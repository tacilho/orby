const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3333;
const ORBY_BACKEND_URL = process.env.ORBY_BACKEND_URL || 'http://localhost:8080';
const ORBY_M2M_TOKEN = process.env.ORBY_M2M_TOKEN || 'ORBY_SUPER_SECRET_M2M_TOKEN_12345';

// ─── In-memory store for active sessions ───
const sessions = new Map();

// Logger silencioso para o Baileys
const logger = pino({ level: 'silent' });

// ─── Security: Path Traversal & Injection Validator Middleware ───
function validateInstanceName(req, res, next) {
  const instanceName = req.params.instanceName || req.body.instanceName;
  if (!instanceName) {
    return next();
  }

  // Regex: Apenas letras, números, hífen e sublinhado. Bloqueia barras, pontos e caracteres especiais.
  const safeRegex = /^[a-zA-Z0-9_-]+$/;
  if (!safeRegex.test(instanceName)) {
    console.error(`[Security Warning] 🛑 Tentativa de injeção ou traversal detectada com instanceName: "${instanceName}"`);
    return res.status(400).json({ error: 'instanceName inválido. Apenas letras, números, hífen e sublinhado são permitidos.' });
  }
  next();
}

// ─── Helpers ───
function getSessionDir(instanceName) {
  return path.join(__dirname, 'sessions', instanceName);
}

// ─── Clean up excess lid-mapping files to prevent disk clutter ───
function cleanupLidFiles(instanceName) {
  const dir = getSessionDir(instanceName);
  if (!fs.existsSync(dir)) return;

  try {
    const files = fs.readdirSync(dir);
    let count = 0;
    for (const file of files) {
      if (file.startsWith('lid-mapping-') && file.endsWith('.json')) {
        fs.unlinkSync(path.join(dir, file));
        count++;
      }
    }
    if (count > 0) {
      console.log(`[Cleanup] 🧹 Removidos ${count} arquivos temporários de lid-mapping da sessão "${instanceName}"`);
    }
  } catch (err) {
    console.error(`[Cleanup] Erro ao limpar arquivos lid-mapping:`, err.message);
  }
}

// ─── Core: Connect to WhatsApp (with auto-reconnect) ───
async function connectToWhatsApp(instanceName) {
  const sessionDir = getSessionDir(instanceName);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Limpar os arquivos de LID acumulados antes de iniciar para liberar espaço
  cleanupLidFiles(instanceName);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  // Criar ou reutilizar dados de sessão
  let sessionData = sessions.get(instanceName);
  if (!sessionData) {
    sessionData = {
      qrCode: null,
      status: 'connecting',
      phoneNumber: null,
      socket: null,
      instanceName,
    };
    sessions.set(instanceName, sessionData);
  }

  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: true,
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false, // 🚫 EVITA A CRIAÇÃO DE MILHARES DE ARQUIVOS LID-MAPPING
    browser: ['Orby Platform', 'Chrome', '10.0'],
  });

  sessionData.socket = sock;

  // ─── Evento de conexão (QR Code + Status) ───
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`[${instanceName}] 📱 QR Code gerado! Escaneie com o celular.`);
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, {
          width: 300,
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
        sessionData.qrCode = qrDataUrl;
        sessionData.status = 'qr_ready';
      } catch (err) {
        console.error(`[${instanceName}] Erro ao gerar QR Code:`, err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[${instanceName}] Conexão fechada. StatusCode: ${statusCode}. Reconectar: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        sessionData.status = 'reconnecting';
        console.log(`[${instanceName}] ⏳ Reconectando em 2 segundos...`);
        setTimeout(() => {
          connectToWhatsApp(instanceName);
        }, 2000);
      } else {
        sessionData.status = 'disconnected';
        sessions.delete(instanceName);
        try {
          fs.rmSync(sessionDir, { recursive: true, force: true });
        } catch (e) { /* ignore */ }
        console.log(`[${instanceName}] 🚫 Deslogado permanentemente.`);
      }
    }

    if (connection === 'open') {
      const jid = sock.user?.id;
      const number = jid ? jid.split(':')[0].split('@')[0] : 'desconhecido';
      console.log(`[${instanceName}] ✅ WhatsApp conectado! Número: ${number}`);
      sessionData.status = 'connected';
      sessionData.phoneNumber = number;
      sessionData.qrCode = null;

      // Limpar excesso de LID-mapping após conectar com sucesso
      cleanupLidFiles(instanceName);

      // Notificar backend Java do Orby (com autenticação M2M)
      try {
        const response = await fetch(`${ORBY_BACKEND_URL}/api/whatsapp-bridge/connected`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-M2M-Token': ORBY_M2M_TOKEN,
            'X-Tenant-ID': instanceName
          },
          body: JSON.stringify({
            instanceName,
            phoneNumber: number,
          }),
        });
        console.log(`[${instanceName}] Backend Orby notificado: ${response.status}`);
      } catch (err) {
        console.error(`[${instanceName}] Erro ao notificar backend:`, err.message);
      }
    }
  });

  // ─── Salvar credenciais ───
  sock.ev.on('creds.update', saveCreds);

  // ─── Mensagens recebidas ───
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (msg.key.fromMe) continue;
      if (!msg.message) continue;

      const senderJid = msg.key.remoteJid;
      if (!senderJid || senderJid.endsWith('@g.us')) continue;

      const senderNumber = senderJid; 
      const senderName = msg.pushName || senderJid.split('@')[0];

      let content = '';
      let messageType = 'TEXT';

      if (msg.message.conversation) {
        content = msg.message.conversation;
      } else if (msg.message.extendedTextMessage?.text) {
        content = msg.message.extendedTextMessage.text;
      } else if (msg.message.imageMessage) {
        messageType = 'IMAGE';
        content = msg.message.imageMessage.caption || '';
      } else if (msg.message.videoMessage) {
        messageType = 'VIDEO';
        content = msg.message.videoMessage.caption || '';
      } else if (msg.message.audioMessage) {
        messageType = 'AUDIO';
      } else if (msg.message.documentMessage) {
        messageType = 'DOCUMENT';
      } else {
        continue;
      }

      console.log(`[${instanceName}] 📨 Mensagem de ${senderName} (${senderNumber}): ${content || `[${messageType}]`}`);

      try {
        await fetch(`${ORBY_BACKEND_URL}/api/whatsapp-bridge/message`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-M2M-Token': ORBY_M2M_TOKEN,
            'X-Tenant-ID': instanceName
          },
          body: JSON.stringify({
            instanceName,
            senderNumber,
            senderName,
            content,
            messageType,
            messageId: msg.key.id,
          }),
        });
      } catch (err) {
        console.error(`[${instanceName}] Erro ao enviar mensagem para backend:`, err.message);
      }
    }
  });

  return sock;
}

// ─── Auto-load saved sessions from disk on startup ───
function loadSavedSessions() {
  const sessionsDir = path.join(__dirname, 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
    return;
  }

  try {
    const dirs = fs.readdirSync(sessionsDir);
    for (const dirName of dirs) {
      const fullPath = path.join(sessionsDir, dirName);
      if (fs.statSync(fullPath).isDirectory()) {
        if (fs.existsSync(path.join(fullPath, 'creds.json'))) {
          // Validar o nome do diretório antes de reconectar para evitar travamento ou leitura de pasta fraudulenta
          const safeRegex = /^[a-zA-Z0-9_-]+$/;
          if (safeRegex.test(dirName)) {
            console.log(`[Startup] 🔄 Carregando sessão salva da pasta: "${dirName}"`);
            connectToWhatsApp(dirName).catch(err => {
              console.error(`[Startup] Erro ao iniciar sessão "${dirName}":`, err);
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[Startup] Erro ao ler pasta de sessões:', err.message);
  }
}

// ─── Helper para resolver JIDs dinamicos baseados em número/JID completo ───
function resolveJid(number) {
  if (number.includes('@')) {
    return number;
  }
  
  let cleanNumber = number.replace(/\D/g, '');
  
  // Se for maior ou igual a 14 digitos e nao iniciar com 55 (Brasil), tratamos como identificador LID
  if (cleanNumber.length >= 14 && !cleanNumber.startsWith('55')) {
    return cleanNumber + '@lid';
  }
  
  // Fallback padrão para números comuns
  if (cleanNumber.length <= 11 && !cleanNumber.startsWith('55')) {
    cleanNumber = '55' + cleanNumber;
  }
  return cleanNumber + '@s.whatsapp.net';
}

// ─── API: Create/Connect Instance & Get QR Code ───
app.post('/api/instance/create', validateInstanceName, async (req, res) => {
  const { instanceName } = req.body;
  if (!instanceName) {
    return res.status(400).json({ error: 'instanceName is required' });
  }

  if (sessions.has(instanceName)) {
    const oldSession = sessions.get(instanceName);
    if (oldSession.socket) {
      try { oldSession.socket.end(); } catch (e) { /* ignore */ }
    }
    sessions.delete(instanceName);
  }

  const sessionDir = getSessionDir(instanceName);
  try {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  } catch (e) { /* ignore */ }

  try {
    await connectToWhatsApp(instanceName);
    res.json({
      status: 'creating',
      instanceName,
      message: 'Instância criada. Use GET /api/instance/qrcode/:instanceName para obter o QR Code.',
    });
  } catch (err) {
    console.error(`[${instanceName}] Erro ao criar instância:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Get QR Code ───
app.get('/api/instance/qrcode/:instanceName', validateInstanceName, (req, res) => {
  const { instanceName } = req.params;
  const session = sessions.get(instanceName);

  if (!session) {
    return res.status(404).json({ error: 'Instância não encontrada' });
  }

  res.json({
    status: session.status,
    qrCode: session.qrCode,
    phoneNumber: session.phoneNumber,
  });
});

// ─── API: Get Connection Status ───
app.get('/api/instance/status/:instanceName', validateInstanceName, (req, res) => {
  const { instanceName } = req.params;
  const session = sessions.get(instanceName);

  if (!session) {
    return res.json({ status: 'disconnected', phoneNumber: null });
  }

  res.json({
    status: session.status,
    phoneNumber: session.phoneNumber,
  });
});

// ─── API: Send Text Message ───
app.post('/api/message/sendText/:instanceName', validateInstanceName, async (req, res) => {
  const { instanceName } = req.params;
  const { number, text } = req.body;
  const session = sessions.get(instanceName);

  if (!session || session.status !== 'connected') {
    return res.status(400).json({ error: 'Instância não conectada' });
  }

  try {
    const jid = resolveJid(number);
    await session.socket.sendMessage(jid, { text });
    console.log(`[${instanceName}] ✉️ Mensagem enviada para ${jid}`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[${instanceName}] Erro ao enviar mensagem:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Send Media Message ───
app.post('/api/message/sendMedia/:instanceName', validateInstanceName, async (req, res) => {
  const { instanceName } = req.params;
  const { number, mediaUrl, type, caption } = req.body;
  const session = sessions.get(instanceName);

  if (!session || session.status !== 'connected') {
    return res.status(400).json({ error: 'Instância não conectada' });
  }

  try {
    const jid = resolveJid(number);

    let msgContent = {};
    switch (type?.toUpperCase()) {
      case 'IMAGE':
        msgContent = { image: { url: mediaUrl }, caption: caption || '' };
        break;
      case 'VIDEO':
        msgContent = { video: { url: mediaUrl }, caption: caption || '' };
        break;
      case 'AUDIO':
        msgContent = { audio: { url: mediaUrl }, mimetype: 'audio/mpeg' };
        break;
      default:
        msgContent = { document: { url: mediaUrl }, fileName: caption || 'file' };
    }

    await session.socket.sendMessage(jid, msgContent);
    console.log(`[${instanceName}] ✉️ Mídia enviada para ${jid}`);
    res.json({ success: true });
  } catch (err) {
    console.error(`[${instanceName}] Erro ao enviar mídia:`, err);
    res.status(500).json({ error: err.message });
  }
});

// ─── API: Disconnect / Logout ───
app.post('/api/instance/logout/:instanceName', validateInstanceName, async (req, res) => {
  const { instanceName } = req.params;
  const session = sessions.get(instanceName);

  if (!session) {
    return res.status(404).json({ error: 'Instância não encontrada' });
  }

  try {
    if (session.socket) {
      await session.socket.logout();
      session.socket.end();
    }
  } catch (e) {
    console.log(`[${instanceName}] Erro ao deslogar:`, e.message);
  }

  sessions.delete(instanceName);
  
  const sessionDir = getSessionDir(instanceName);
  try {
    fs.rmSync(sessionDir, { recursive: true, force: true });
  } catch (e) { /* ignore */ }

  console.log(`[${instanceName}] 🔌 Desconectado com sucesso.`);
  res.json({ success: true });
});

// ─── API: List all active instances ───
app.get('/api/instances', (req, res) => {
  const list = [];
  for (const [name, session] of sessions) {
    list.push({
      instanceName: name,
      status: session.status,
      phoneNumber: session.phoneNumber,
    });
  }
  res.json(list);
});

// ─── Carregar sessões salvas na inicialização ───
loadSavedSessions();

// ─── Start Server ───
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║    🟢 Orby WhatsApp Bridge v1.0                 ║');
  console.log(`║    🔗 Rodando em http://localhost:${PORT}           ║`);
  console.log('║    📱 Pronto para conectar dispositivos!        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});
