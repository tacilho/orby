import React, { useState, useEffect } from 'react';
import { Palette, Globe, Server, Check, Save, Mail, MessageCircle, Eye, Sparkles, Shield, Layers, Plus, Trash2, Edit2, X, ChevronRight, Monitor, Settings as SettingsIcon, Smartphone, Wifi, BatteryCharging, Power, QrCode } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ColorPicker from '../components/ColorPicker';

const COLOR_PRESETS = ['#EAEAEA','#6366f1','#3b82f6','#10b981','#ef4444','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316','#14b8a6','#a3e635'];

function isLightColor(hex) {
  if (!hex) return true;
  hex = hex.replace('#','');
  if (hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  const r=parseInt(hex.substring(0,2),16), g=parseInt(hex.substring(2,4),16), b=parseInt(hex.substring(4,6),16);
  return (r*299+g*587+b*114)/1000>150;
}

function Settings() {
  const { 
    tenantConfig, updateTenantConfig, 
    activeThemeId, builtinThemes, customThemes, applyTheme, saveCustomTheme, deleteCustomTheme,
    ticketReasons, addTicketReason, editTicketReason, deleteTicketReason,
    ticketSubReasons, addTicketSubReason, editTicketSubReason, deleteTicketSubReason,
    cannedResponses, addCannedResponse, editCannedResponse, deleteCannedResponse,
    standByReasons, addStandByReason, editStandByReason, deleteStandByReason
  } = useAppContext();
  
  const [config, setConfig] = useState(tenantConfig);
  const [activeTab, setActiveTab] = useState('brand');
  const [savedStatus, setSavedStatus] = useState('');

  // QR Code Real States (Baileys Bridge)
  const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL || 'http://localhost:3333';
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState(''); // '', 'connecting', 'qr_ready', 'connected'
  const [connectedNumber, setConnectedNumber] = useState(config.qrCodeConnectedNumber || '');
  
  // Theme Creator State
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState(null);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeVars, setNewThemeVars] = useState({
    '--bg-app': '#F3F4F6',
    '--bg-panel': '#FFFFFF',
    '--text-primary': '#111827',
    '--text-secondary': '#374151',
    '--border-color': '#D4D6DC'
  });

  // Motivos, Submotivos, Respostas Rapidas e Stand By States
  const [editingReasonId, setEditingReasonId] = useState(null);
  const [newReasonTitle, setNewReasonTitle] = useState('');
  
  const [editingSubReasonId, setEditingSubReasonId] = useState(null);
  const [newSubReasonTitle, setNewSubReasonTitle] = useState('');
  const [selectedParentReasonId, setSelectedParentReasonId] = useState('');

  const [editingCannedId, setEditingCannedId] = useState(null);
  const [newCannedTitle, setNewCannedTitle] = useState('');
  const [newCannedText, setNewCannedText] = useState('');

  const [editingStandById, setEditingStandById] = useState(null);
  const [newStandByTitle, setNewStandByTitle] = useState('');

  // Modal open states
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isSubReasonModalOpen, setIsSubReasonModalOpen] = useState(false);
  const [isCannedModalOpen, setIsCannedModalOpen] = useState(false);
  const [isStandByModalOpen, setIsStandByModalOpen] = useState(false);

  // Gerar QR Code REAL via Bridge Node.js
  const handleGenerateQr = async () => {
    setGeneratingQr(true);
    setQrDataUrl(null);
    setBridgeStatus('connecting');

    const instanceName = tenantConfig.tenantId || 'default';

    try {
      // 1. Criar instância no Bridge
      await fetch(`${BRIDGE_URL}/api/instance/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName }),
      });

      // 2. Polling para obter QR Code e status
      const pollInterval = setInterval(async () => {
        try {
          const resp = await fetch(`${BRIDGE_URL}/api/instance/qrcode/${instanceName}`);
          const data = await resp.json();

          if (data.status === 'qr_ready' && data.qrCode) {
            setQrDataUrl(data.qrCode);
            setBridgeStatus('qr_ready');
            setGeneratingQr(false);
          }

          if (data.status === 'connected') {
            clearInterval(pollInterval);
            setBridgeStatus('connected');
            setConnectedNumber(data.phoneNumber || '');
            setGeneratingQr(false);
            setQrDataUrl(null);

            // Atualizar config local e no backend
            const newConfig = {
              ...config,
              whatsAppProvider: 'QRCODE',
              qrCodeConnectedNumber: data.phoneNumber || ''
            };
            setConfig(newConfig);
            updateTenantConfig(newConfig);
            setSavedStatus('✅ WhatsApp conectado com sucesso!');
            setTimeout(() => setSavedStatus(''), 3000);
          }
        } catch (e) {
          // Bridge pode ainda não ter respondido, continuar polling
        }
      }, 1500);

      // Timeout de 2 minutos (o QR Code expira)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (bridgeStatus !== 'connected') {
          setBridgeStatus('');
          setGeneratingQr(false);
          setQrDataUrl(null);
        }
      }, 120000);
    } catch (err) {
      console.error('Erro ao conectar ao Bridge:', err);
      setGeneratingQr(false);
      setBridgeStatus('');
      setSavedStatus('❌ Erro: WhatsApp Bridge não está rodando (porta 3333)');
      setTimeout(() => setSavedStatus(''), 4000);
    }
  };

  // Desconectar sessão real via Bridge Node.js
  const handleDisconnectQr = async () => {
    const instanceName = tenantConfig.tenantId || 'default';
    try {
      await fetch(`${BRIDGE_URL}/api/instance/logout/${instanceName}`, { method: 'POST' });
    } catch (e) {
      console.error('Erro ao desconectar:', e);
    }

    const newConfig = {
      ...config,
      whatsAppProvider: 'META',
      qrCodeConnectedNumber: ''
    };
    setConfig(newConfig);
    updateTenantConfig(newConfig);
    setBridgeStatus('');
    setConnectedNumber('');
    setQrDataUrl(null);
    setSavedStatus('Dispositivo desconectado!');
    setTimeout(() => setSavedStatus(''), 2500);
  };

  useEffect(() => { setConfig(tenantConfig); }, [tenantConfig]);
  useEffect(() => { setConnectedNumber(tenantConfig.qrCodeConnectedNumber || ''); }, [tenantConfig]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    updateTenantConfig(config);
    setSavedStatus('Configurações salvas!');
    setTimeout(() => setSavedStatus(''), 2500);
  };

  const handleChange = (field, value) => setConfig(prev => ({...prev, [field]: value}));

  const openThemeCreator = (themeId = null) => {
    if (themeId && customThemes[themeId]) {
      setEditingThemeId(themeId);
      setNewThemeName(customThemes[themeId].name);
      setNewThemeVars(customThemes[themeId].vars);
    } else {
      setEditingThemeId(null);
      setNewThemeName('');
      const currentTheme = builtinThemes[activeThemeId] || customThemes[activeThemeId] || builtinThemes.light;
      setNewThemeVars(currentTheme.vars);
    }
    setIsCreatorOpen(true);
  };

  const handleSaveTheme = () => {
    if (!newThemeName.trim()) return;
    const id = editingThemeId || `custom_${Date.now()}`;
    saveCustomTheme(id, {
      name: newThemeName,
      vars: newThemeVars,
      isLight: isLightColor(newThemeVars['--bg-app'])
    });
    setIsCreatorOpen(false);
  };

  const tabs = [
    { id: 'brand', label: 'Marca & Identidade', desc: 'Logotipo, cores e nome', icon: <Palette size={18}/> },
    { id: 'themes', label: 'Temas & Interface', desc: 'Motor de temas dinâmico', icon: <Layers size={18}/> },
    { id: 'whatsapp', label: 'Conexão WhatsApp', desc: 'Sincronizar número via QR Code', icon: <MessageCircle size={18}/> },
    { id: 'domain', label: 'Domínio & Acesso', desc: 'URLs personalizadas e SSL', icon: <Globe size={18}/> },
    { id: 'email', label: 'E-mail (SMTP)', desc: 'Servidores de envio próprios', icon: <Mail size={18}/> },
    { id: 'widget', label: 'Widget de Chat', desc: 'Aparência do balão externo', icon: <MessageCircle size={18}/> },
    { id: 'categories', label: 'Motivos & Respostas', desc: 'Gerenciar motivos e respostas rápidas', icon: <Layers size={18}/> },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Whitelabel & Configurações</h1>
          <p>Gerencie a identidade visual e as configurações globais da sua plataforma.</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
           {savedStatus && (
             <div className="badge green" style={{ animation:'badgePop 0.3s ease', padding:'0.5rem 1rem' }}>
                <Check size={14} style={{ marginRight:'0.375rem' }}/> {savedStatus}
             </div>
           )}
           <button className="btn primary" onClick={handleSave} disabled={JSON.stringify(config) === JSON.stringify(tenantConfig)}>
             <Save size={16}/> Salvar Alterações
           </button>
        </div>
      </div>

      <div className="panel" style={{ padding:0, overflow:'hidden', display:'flex', minHeight:'640px', background:'var(--bg-panel)' }}>
        
        {/* Navigation Sidebar */}
        <div style={{ width:'280px', borderRight:'1px solid var(--border-color)', background:'var(--bg-app)', padding:'1.5rem 0', display:'flex', flexDirection:'column' }}>
          {tabs.map(t => (
            <div 
              key={t.id} 
              onClick={() => setActiveTab(t.id)}
              style={{
                padding:'1rem 1.5rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'1rem',
                borderLeft:`3px solid ${activeTab === t.id ? 'var(--accent-color)' : 'transparent'}`,
                background: activeTab === t.id ? 'var(--bg-active)' : 'transparent',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e => activeTab !== t.id && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => activeTab !== t.id && (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ color: activeTab === t.id ? 'var(--accent-color)' : 'var(--text-muted)' }}>{t.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'0.875rem', fontWeight:600, color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.label}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'0.125rem' }}>{t.desc}</div>
              </div>
              {activeTab === t.id && <ChevronRight size={14} style={{ color:'var(--accent-color)' }}/>}
            </div>
          ))}

          <div style={{ marginTop:'auto', padding:'2rem 1.5rem' }}>
            <div style={{ padding:'1rem', background:'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>Licença Ativa</div>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <Shield size={14} style={{ color:'var(--success)' }}/>
                <span style={{ fontWeight:600, fontSize:'0.8125rem' }}>Enterprise Plan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex:1, padding:'2.5rem', overflowY:'auto', background:'var(--bg-panel)' }}>
          
          {/* ── Marca Tab ─── */}
          {activeTab==='brand' && (
            <div className="fade-in">
              <SectionHeader title="Identidade Visual" desc="Defina como sua marca aparece para os operadores e clientes." icon={<Sparkles size={18}/>}/>
              
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'3rem', marginTop:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Nome da Plataforma</label>
                    <input type="text" className="form-control" value={config.brandName} onChange={e=>handleChange('brandName',e.target.value)} placeholder="Ex: Orby Suporte"/>
                  </div>
                  
                  <div className="form-group">
                    <ColorPicker label="Cor de Destaque (Accent)" value={config.primaryColor} onChange={hex=>handleChange('primaryColor',hex)} presets={COLOR_PRESETS}/>
                  </div>
                </div>

                <div>
                   <label className="form-label">Visualização da Marca</label>
                   <div style={{ 
                     padding:'2.5rem', background:'var(--bg-app)', borderRadius:'var(--radius-lg)', border:'1px dashed var(--border-color)',
                     display:'flex', flexDirection:'column', alignItems:'center', gap:'1.5rem', textAlign:'center'
                   }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1.25rem', background:'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)', boxShadow:'var(--shadow-sm)' }}>
                         <div className="brand-icon" style={{ width:24, height:24, fontSize:12 }}>{config.brandName?.charAt(0) || 'O'}</div>
                         <span style={{ fontWeight:700, fontSize:'1rem' }}>{config.brandName || 'Orby'}</span>
                      </div>
                      <div style={{ width:'100%', height:'1px', background:'var(--border-color)' }}></div>
                      <button className="btn primary" style={{ width:'100%', maxWidth:'200px' }}>Exemplo de Botão</button>
                      <p style={{ fontSize:'0.75rem', maxWidth:'240px' }}>A cor será aplicada em botões, links, ícones de navegação e indicadores de status.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Temas Tab ─── */}
          {activeTab==='themes' && (
            <div className="fade-in">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
                <SectionHeader title="Motor de Temas" desc="Personalize a experiência visual completa da interface administrativa." icon={<Monitor size={18}/>}/>
                <button className="btn primary" onClick={() => openThemeCreator()}>
                  <Plus size={16}/> Criar Novo Tema
                </button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:'1.25rem' }}>
                {Object.entries(builtinThemes).map(([id, theme]) => (
                  <ThemeOption 
                    key={id} id={id} theme={theme} 
                    isActive={activeThemeId === id} 
                    onSelect={() => applyTheme(id)}
                  />
                ))}
                
                {Object.entries(customThemes).map(([id, theme]) => (
                  <ThemeOption 
                    key={id} id={id} theme={theme} 
                    isActive={activeThemeId === id} 
                    onSelect={() => applyTheme(id)}
                    onEdit={() => openThemeCreator(id)}
                    onDelete={() => deleteCustomTheme(id)}
                    isCustom
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Conexão WhatsApp Tab ─── */}
          {activeTab==='whatsapp' && (
            <div className="fade-in">
              <SectionHeader 
                title="Conexão do WhatsApp" 
                desc="Conecte e gerencie a integração de conversas da sua empresa de forma instantânea." 
                icon={<MessageCircle size={18}/>}
              />
              
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', marginTop: '1.5rem' }}>
                {/* Opção 1: QR Code */}
                <div 
                  onClick={() => handleChange('whatsAppProvider', 'QRCODE')}
                  style={{
                    flex: 1,
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: config.whatsAppProvider === 'QRCODE' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: config.whatsAppProvider === 'QRCODE' ? 'var(--bg-active)' : 'var(--bg-panel)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: config.whatsAppProvider === 'QRCODE' ? '0 4px 12px var(--accent-color)15' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <QrCode size={20} style={{ color: 'var(--accent-color)' }} />
                      WhatsApp QR Code
                    </div>
                    {config.whatsAppProvider === 'QRCODE' && <span className="badge green" style={{ fontSize: '0.7rem' }}>Ativo</span>}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Conecte qualquer celular pessoal ou comercial instantaneamente escaneando um QR Code. Perfeito para implantação rápida sem burocracias ou custos oficiais.
                  </p>
                </div>

                {/* Opção 2: Meta Cloud API */}
                <div 
                  onClick={() => handleChange('whatsAppProvider', 'META')}
                  style={{
                    flex: 1,
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: config.whatsAppProvider === 'META' ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                    background: config.whatsAppProvider === 'META' ? 'var(--bg-active)' : 'var(--bg-panel)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: config.whatsAppProvider === 'META' ? '0 4px 12px var(--accent-color)15' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Server size={20} style={{ color: 'var(--accent-color)' }} />
                      Meta Cloud API (Oficial)
                    </div>
                    {config.whatsAppProvider === 'META' && <span className="badge green" style={{ fontSize: '0.7rem' }}>Ativo</span>}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Integração corporativa oficial com servidores da Meta Graph API. Oferece estabilidade máxima (celular pode ficar desligado) e taxas de tráfego por mensagens.
                  </p>
                </div>
              </div>

              {/* Interface QR Code */}
              {config.whatsAppProvider === 'QRCODE' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '3rem', marginTop: '2rem' }}>
                  {/* Coluna Esquerda: Detalhes ou Instruções */}
                  {(connectedNumber || bridgeStatus === 'connected') ? (
                    /* Tela de Conectado */
                    <div style={{
                      padding: '2rem',
                      background: 'var(--bg-app)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1.5rem'
                    }}>
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: 'var(--success-light, #22c55e20)', 
                        color: 'var(--success)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 0 20px #22c55e20'
                      }}>
                        <Smartphone size={40} />
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                          <h4 style={{ margin: 0, fontWeight: 800, fontSize: '1.125rem' }}>WhatsApp Conectado</h4>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          Número: <strong>+{connectedNumber || config.qrCodeConnectedNumber}</strong>
                        </p>
                      </div>

                      <div style={{ width: '100%', height: '1px', background: 'var(--border-color)' }} />

                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Wifi size={14} /> Conexão:</span>
                          <span style={{ fontWeight: 600, color: 'var(--success)' }}>Ativa (Baileys)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={14} /> Criptografia:</span>
                          <span style={{ fontWeight: 600 }}>End-to-End (E2EE)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Status da Sessão:</span>
                          <span className="badge green" style={{ fontSize: '0.7rem' }}>Sincronizada</span>
                        </div>
                      </div>

                      <button 
                        onClick={handleDisconnectQr} 
                        className="btn danger" 
                        style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
                      >
                        <Power size={14} /> Desconectar Celular
                      </button>
                    </div>
                  ) : (
                    /* Tela de Instruções */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Passo a Passo para Conectar</h4>
                        <ol style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', lineHeight: 1.5 }}>
                          <li>Clique em <strong>"Gerar Código QR"</strong> ao lado.</li>
                          <li>Abra o <strong>WhatsApp</strong> no seu aparelho celular.</li>
                          <li>Toque em <strong>Mais Opções</strong> (três pontinhos) ou <strong>Configurações</strong> e selecione <strong>Aparelhos Conectados</strong>.</li>
                          <li>Toque em <strong>Conectar um Aparelho</strong>.</li>
                          <li>Aponte a câmera do celular para o QR Code gerado para conectar instantaneamente!</li>
                        </ol>
                      </div>

                      {bridgeStatus === 'connecting' && (
                        <div className="panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ border: '3px solid var(--border-color)', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                            <div>
                              <div style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                                🔄 Inicializando sessão do WhatsApp...
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aguarde a geração do QR Code.</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {bridgeStatus === 'qr_ready' && (
                        <div className="panel" style={{ padding: '1rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--success)', fontWeight: 600 }}>
                            <Check size={16} /> QR Code pronto! Escaneie com o celular.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Coluna Direita: Código QR Real */}
                  {!(connectedNumber || bridgeStatus === 'connected') && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <label className="form-label" style={{ alignSelf: 'flex-start', fontSize: '0.8125rem', fontWeight: 700 }}>Código QR de Autenticação</label>
                      <div style={{
                        width: '300px',
                        height: '300px',
                        background: '#FFFFFF',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {generatingQr && !qrDataUrl && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ border: '3px solid #e5e7eb', borderTop: '3px solid var(--accent-color)', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600 }}>Gerando chave de sessão...</span>
                          </div>
                        )}

                        {!generatingQr && !qrDataUrl && bridgeStatus !== 'connecting' && (
                          <div style={{ textAlign: 'center', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                            <QrCode size={48} style={{ color: '#9ca3af' }} />
                            <button onClick={handleGenerateQr} className="btn primary" style={{ fontSize: '0.8125rem' }}>
                              Gerar Código QR
                            </button>
                          </div>
                        )}

                        {qrDataUrl && (
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {/* QR Code REAL do WhatsApp */}
                            <img 
                              src={qrDataUrl} 
                              alt="WhatsApp QR Code" 
                              style={{ width: '260px', height: '260px', imageRendering: 'pixelated' }}
                            />
                            {/* Linha laser de escaneamento */}
                            <div style={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              height: '2px',
                              background: 'var(--accent-color)',
                              boxShadow: '0 0 10px var(--accent-color)',
                              animation: 'scanLine 3s ease-in-out infinite'
                            }} />
                          </div>
                        )}
                      </div>
                      {qrDataUrl && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>📱 Escaneie este QR Code com o WhatsApp do seu celular.</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Interface Meta API */}
              {config.whatsAppProvider === 'META' && (
                <div style={{ maxWidth: '640px', marginTop: '2rem' }}>
                  <div style={{ padding: '1.5rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <Server size={14}/> Integração Oficial Meta Cloud API
                    </div>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-primary)', margin: 0 }}>
                      Vincule as credenciais de sua conta comercial do Facebook Developers. Este método se comunica com a Graph API oficial do WhatsApp Business de forma assíncrona.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Identificador do Telefone (Phone Number ID)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Ex: 105658245199654" 
                        value={config.whatsAppPhoneNumberId || ''} 
                        onChange={e => handleChange('whatsAppPhoneNumberId', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Token de Acesso Permanente (Meta Access Token)</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="EAAGzDk..." 
                        value={config.whatsAppApiToken || ''} 
                        onChange={e => handleChange('whatsAppApiToken', e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Domínio Tab ─── */}
          {activeTab==='domain' && (
            <div className="fade-in" style={{ maxWidth:'640px' }}>
              <SectionHeader title="Configurações de Domínio" desc="Acesse o painel administrativo através de uma URL customizada." icon={<Globe size={18}/>}/>
              
              <div className="form-group" style={{ marginTop:'2rem' }}>
                <label className="form-label">Endereço (Hostname)</label>
                <div style={{ position:'relative' }}>
                   <Globe size={16} style={{ position:'absolute', left:'1rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }}/>
                   <input type="text" className="form-control" style={{ paddingLeft:'2.75rem' }} placeholder="suporte.suaempresa.com" value={config.domain} onChange={e=>handleChange('domain',e.target.value)}/>
                </div>
              </div>
              
              <div style={{ marginTop:'1.5rem', padding:'1.5rem', background:'var(--bg-app)', border:'1px solid var(--border-color)', borderRadius:'var(--radius-md)' }}>
                <div style={{ fontWeight:700, fontSize:'0.7rem', color:'var(--info)', textTransform:'uppercase', letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.75rem' }}>
                  <Shield size={14}/> Instrução de DNS
                </div>
                <p style={{ fontSize:'0.875rem', lineHeight:1.6, color:'var(--text-primary)' }}>
                  Para ativar seu domínio, aponte um registro <strong>CNAME</strong> no seu provedor de DNS para:
                </p>
                <div className="mono" style={{ padding:'0.75rem', background:'var(--bg-panel)', border:'1px solid var(--border-color)', borderRadius:'4px', marginTop:'0.75rem', color:'var(--info)', fontSize:'0.9rem' }}>
                  cname.orby.com
                </div>
                <p style={{ fontSize:'0.8125rem', marginTop:'1rem', color:'var(--text-muted)' }}>
                  O certificado SSL (HTTPS) será gerado automaticamente assim que a propagação for concluída.
                </p>
              </div>
            </div>
          )}

          {/* ── SMTP Tab ─── */}
          {activeTab==='email' && (
            <div className="fade-in" style={{ maxWidth:'640px' }}>
              <SectionHeader title="Servidor de E-mail" desc="Envie notificações de chamados através do seu próprio servidor SMTP." icon={<Mail size={18}/>}/>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:'1rem', marginTop:'2rem' }}>
                <div className="form-group">
                  <label className="form-label">Host SMTP</label>
                  <input type="text" className="form-control" placeholder="smtp.gmail.com" value={config.smtpHost||''} onChange={e=>handleChange('smtpHost',e.target.value)}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Porta</label>
                  <input type="text" className="form-control" placeholder="587" value={config.smtpPort||''} onChange={e=>handleChange('smtpPort',e.target.value)}/>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Usuário (E-mail)</label>
                <input type="text" className="form-control" placeholder="contato@suaempresa.com" value={config.smtpUser||''} onChange={e=>handleChange('smtpUser',e.target.value)}/>
              </div>

              <div style={{ marginTop:'1.5rem', display:'flex', justifyContent:'flex-end' }}>
                <button className="btn outline" style={{ background:'transparent' }}>Testar Conexão</button>
              </div>
            </div>
          )}

          {/* ── Widget Tab ─── */}
          {activeTab==='widget' && (
            <div className="fade-in">
              <SectionHeader title="Customização do Widget" desc="Personalize o chat flutuante que seus clientes verão em seus sites." icon={<MessageCircle size={18}/>}/>
              
              <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:'3rem', marginTop:'2rem' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">Mensagem de Boas-vindas</label>
                    <textarea className="form-control" rows={3} value={config.widgetWelcome} onChange={e=>handleChange('widgetWelcome',e.target.value)} placeholder="Olá! Como podemos te ajudar hoje?"/>
                  </div>
                  <ColorPicker label="Cor do Balão" value={config.widgetColor || config.primaryColor} onChange={hex=>handleChange('widgetColor',hex)} presets={COLOR_PRESETS}/>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                   <label className="form-label">Preview do Widget</label>
                   <div style={{ 
                     height:'260px', background:'var(--bg-app)', borderRadius:'var(--radius-lg)', border:'1px solid var(--border-color)',
                     position:'relative', overflow:'hidden', padding:'1.5rem'
                   }}>
                      <div style={{ position:'absolute', bottom:'1.5rem', right:'1.5rem', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'1rem' }}>
                         <div style={{ 
                           background:'var(--bg-panel)', padding:'1rem', borderRadius:'16px 16px 4px 16px', boxShadow:'var(--shadow-md)', border:'1px solid var(--border-color)', maxWidth:'200px'
                         }}>
                            <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)', fontWeight:700, marginBottom:'0.25rem', textTransform:'uppercase' }}>{config.brandName}</div>
                            <div style={{ fontSize:'0.875rem', lineHeight:1.4 }}>{config.widgetWelcome}</div>
                         </div>
                         <div style={{ 
                           width:52, height:52, borderRadius:'50%', background:config.widgetColor || config.primaryColor,
                           display:'flex', alignItems:'center', justifyContent:'center', color:isLightColor(config.widgetColor || config.primaryColor)?'#000':'#fff',
                           boxShadow:`0 4px 16px ${(config.widgetColor || config.primaryColor)}50`
                         }}>
                          <MessageCircle size={24}/>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Motivos & Respostas Tab ─── */}
          {activeTab==='categories' && (
            <div className="fade-in">
              <SectionHeader title="Categorias & Respostas" desc="Gerencie os motivos de encerramento, submotivos, respostas rápidas e motivos de pausa do sistema." icon={<Layers size={18}/>}/>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                
                {/* 1. Motivos de Encerramento */}
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Motivos de Encerramento</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classificação principal ao fechar chamados.</p>
                    </div>
                    <button className="btn primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', gap: '0.375rem' }} onClick={() => { setEditingReasonId(null); setNewReasonTitle(''); setIsReasonModalOpen(true); }}>
                      <Plus size={14}/> Novo
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {ticketReasons && ticketReasons.length > 0 ? (
                      ticketReasons.map(r => (
                        <div key={r.id} style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{r.title}</span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn" style={{ padding: '0.375rem' }} onClick={() => { setEditingReasonId(r.id); setNewReasonTitle(r.title); setIsReasonModalOpen(true); }} title="Editar"><Edit2 size={12} /></button>
                            <button className="btn danger" style={{ padding: '0.375rem' }} onClick={() => deleteTicketReason(r.id)} title="Excluir"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>Nenhum motivo cadastrado.</div>
                    )}
                  </div>
                </div>

                {/* 2. Submotivos de Encerramento */}
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Submotivos de Encerramento</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classificações secundárias detalhadas.</p>
                    </div>
                    <button className="btn primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', gap: '0.375rem' }} onClick={() => { setEditingSubReasonId(null); setNewSubReasonTitle(''); setSelectedParentReasonId(''); setIsSubReasonModalOpen(true); }}>
                      <Plus size={14}/> Novo
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {ticketSubReasons && ticketSubReasons.length > 0 ? (
                      ticketSubReasons.map(sr => {
                        const parent = ticketReasons && ticketReasons.find(r => r.id === sr.parentId);
                        return (
                          <div key={sr.id} style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
                            <div>
                              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sr.title}</span>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Pai: {parent ? parent.title : 'N/A'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button className="btn" style={{ padding: '0.375rem' }} onClick={() => { setEditingSubReasonId(sr.id); setNewSubReasonTitle(sr.title); setSelectedParentReasonId(sr.parentId); setIsSubReasonModalOpen(true); }} title="Editar"><Edit2 size={12} /></button>
                              <button className="btn danger" style={{ padding: '0.375rem' }} onClick={() => deleteTicketSubReason(sr.id)} title="Excluir"><Trash2 size={12} /></button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>Nenhum submotivo cadastrado.</div>
                    )}
                  </div>
                </div>

                {/* 3. Respostas Rápidas */}
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Respostas Rápidas</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Atalhos para mensagens frequentes.</p>
                    </div>
                    <button className="btn primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', gap: '0.375rem' }} onClick={() => { setEditingCannedId(null); setNewCannedTitle(''); setNewCannedText(''); setIsCannedModalOpen(true); }}>
                      <Plus size={14}/> Nova
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {cannedResponses && cannedResponses.length > 0 ? (
                      cannedResponses.map(c => (
                        <div key={c.id} style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
                          <div style={{ flex: 1, marginRight: '1rem' }}>
                            <strong style={{ fontSize: '0.875rem' }}>/{c.title}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{c.text}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn" style={{ padding: '0.375rem' }} onClick={() => { setEditingCannedId(c.id); setNewCannedTitle(c.title); setNewCannedText(c.text); setIsCannedModalOpen(true); }} title="Editar"><Edit2 size={12} /></button>
                            <button className="btn danger" style={{ padding: '0.375rem' }} onClick={() => deleteCannedResponse(c.id)} title="Excluir"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>Nenhuma resposta rápida cadastrada.</div>
                    )}
                  </div>
                </div>

                {/* 4. Motivos de Stand By */}
                <div className="panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '340px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Motivos de Stand By (Pausa)</h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Classificações de pausa de chamados.</p>
                    </div>
                    <button className="btn primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem', gap: '0.375rem' }} onClick={() => { setEditingStandById(null); setNewStandByTitle(''); setIsStandByModalOpen(true); }}>
                      <Plus size={14}/> Novo
                    </button>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '250px', overflowY: 'auto' }}>
                    {standByReasons && standByReasons.length > 0 ? (
                      standByReasons.map(sr => (
                        <div key={sr.id} style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sr.title}</span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button className="btn" style={{ padding: '0.375rem' }} onClick={() => { setEditingStandById(sr.id); setNewStandByTitle(sr.title); setIsStandByModalOpen(true); }} title="Editar"><Edit2 size={12} /></button>
                            <button className="btn danger" style={{ padding: '0.375rem' }} onClick={() => deleteStandByReason(sr.id)} title="Excluir"><Trash2 size={12} /></button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>Nenhum motivo de pausa cadastrado.</div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
      {/* ── Motivo Modal ─── */}
      {isReasonModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{editingReasonId ? 'Editar Motivo' : 'Adicionar Motivo'}</h3>
              <button className="close-btn" onClick={() => setIsReasonModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newReasonTitle.trim()) return;
              if (editingReasonId) {
                await editTicketReason(editingReasonId, newReasonTitle);
                setEditingReasonId(null);
              } else {
                await addTicketReason(newReasonTitle);
              }
              setNewReasonTitle('');
              setIsReasonModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Título do Motivo</label>
                <input type="text" className="form-control" placeholder="Ex: Problema de Conectividade" value={newReasonTitle} onChange={e => setNewReasonTitle(e.target.value)} required autoFocus />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn outline" onClick={() => setIsReasonModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingReasonId ? 'Salvar Alterações' : 'Adicionar Motivo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Submotivo Modal ─── */}
      {isSubReasonModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{editingSubReasonId ? 'Editar Submotivo' : 'Adicionar Submotivo'}</h3>
              <button className="close-btn" onClick={() => setIsSubReasonModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newSubReasonTitle.trim() || !selectedParentReasonId) return;
              if (editingSubReasonId) {
                await editTicketSubReason(editingSubReasonId, newSubReasonTitle);
                setEditingSubReasonId(null);
              } else {
                await addTicketSubReason(selectedParentReasonId, newSubReasonTitle);
              }
              setNewSubReasonTitle('');
              setSelectedParentReasonId('');
              setIsSubReasonModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Motivo Principal (Pai)</label>
                <select className="form-control" value={selectedParentReasonId} onChange={e => setSelectedParentReasonId(e.target.value)} required disabled={!!editingSubReasonId}>
                  <option value="">-- Selecione o Motivo --</option>
                  {ticketReasons && ticketReasons.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Título do Submotivo</label>
                <input type="text" className="form-control" placeholder="Ex: Lentidão no Wifi" value={newSubReasonTitle} onChange={e => setNewSubReasonTitle(e.target.value)} required autoFocus />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn outline" onClick={() => setIsSubReasonModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingSubReasonId ? 'Salvar Alterações' : 'Adicionar Submotivo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Resposta Rápida Modal ─── */}
      {isCannedModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{editingCannedId ? 'Editar Resposta Rápida' : 'Adicionar Resposta Rápida'}</h3>
              <button className="close-btn" onClick={() => setIsCannedModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newCannedTitle.trim() || !newCannedText.trim()) return;
              if (editingCannedId) {
                await editCannedResponse(editingCannedId, newCannedTitle, newCannedText);
                setEditingCannedId(null);
              } else {
                await addCannedResponse(newCannedTitle, newCannedText);
              }
              setNewCannedTitle('');
              setNewCannedText('');
              setIsCannedModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Atalho (sem a barra "/")</label>
                <input type="text" className="form-control" placeholder="Ex: saudacao" value={newCannedTitle} onChange={e => setNewCannedTitle(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Mensagem de Resposta</label>
                <textarea className="form-control" rows={4} placeholder="Ex: Olá! Tudo bem? Como posso te ajudar hoje?" value={newCannedText} onChange={e => setNewCannedText(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn outline" onClick={() => setIsCannedModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingCannedId ? 'Salvar Alterações' : 'Adicionar Resposta'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Motivo Stand By Modal ─── */}
      {isStandByModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 700 }}>{editingStandById ? 'Editar Motivo de Stand By' : 'Adicionar Motivo de Stand By'}</h3>
              <button className="close-btn" onClick={() => setIsStandByModalOpen(false)}><X size={20}/></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newStandByTitle.trim()) return;
              if (editingStandById) {
                await editStandByReason(editingStandById, newStandByTitle);
                setEditingStandById(null);
              } else {
                await addStandByReason(newStandByTitle);
              }
              setNewStandByTitle('');
              setIsStandByModalOpen(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Título do Motivo de Pausa</label>
                <input type="text" className="form-control" placeholder="Ex: Aguardando resposta do cliente" value={newStandByTitle} onChange={e => setNewStandByTitle(e.target.value)} required autoFocus />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn outline" onClick={() => setIsStandByModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn primary">{editingStandById ? 'Salvar Alterações' : 'Adicionar Motivo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Theme Creator Modal ─── */}
      {isCreatorOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px', padding: 0, overflow:'hidden', display:'flex', flexDirection:'column', height:'85vh' }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border-color)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-panel)' }}>
              <div>
                <h2 style={{ margin:0, fontSize:'1.125rem' }}>{editingThemeId ? 'Editar Tema' : 'Criar Novo Tema'}</h2>
                <p style={{ fontSize:'0.8125rem', margin:0, color:'var(--text-muted)' }}>Customize as cores estruturais do painel administrativo.</p>
              </div>
              <button className="close-btn" onClick={() => setIsCreatorOpen(false)}><X size={20}/></button>
            </div>
            
            <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
              {/* Controls */}
              <div style={{ width:'360px', padding:'1.75rem', overflowY:'auto', borderRight:'1px solid var(--border-color)', display:'flex', flexDirection:'column', gap:'1.5rem', background:'var(--bg-app)' }}>
                <div className="form-group">
                  <label className="form-label">Nome do Tema</label>
                  <input type="text" className="form-control" placeholder="Ex: Dark Mode Pro" value={newThemeName} onChange={e => setNewThemeName(e.target.value)}/>
                </div>
                
                <ColorPicker label="Fundo da Aplicação" value={newThemeVars['--bg-app']} onChange={v => setNewThemeVars(p => ({...p, '--bg-app': v}))} />
                <ColorPicker label="Fundo dos Painéis" value={newThemeVars['--bg-panel']} onChange={v => setNewThemeVars(p => ({...p, '--bg-panel': v}))} />
                <ColorPicker label="Bordas e Linhas" value={newThemeVars['--border-color']} onChange={v => setNewThemeVars(p => ({...p, '--border-color': v}))} />
                <ColorPicker label="Texto Principal" value={newThemeVars['--text-primary']} onChange={v => setNewThemeVars(p => ({...p, '--text-primary': v}))} />
                <ColorPicker label="Texto Secundário" value={newThemeVars['--text-secondary']} onChange={v => setNewThemeVars(p => ({...p, '--text-secondary': v}))} />
              </div>

              {/* Live Preview Shell - Real Orby Layout */}
              <div style={{ flex:1, padding:'2rem', background:newThemeVars['--bg-app'], overflow:'hidden', display:'flex', flexDirection:'column' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', marginBottom:'1.5rem', opacity:0.5 }}>
                  <Eye size={16} style={{ color:newThemeVars['--text-primary'] }}/> <span style={{ fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:newThemeVars['--text-primary'] }}>Preview ao Vivo (Orby UI)</span>
                </div>
                
                <div style={{ 
                  flex:1, background:newThemeVars['--bg-panel'], border:`1px solid ${newThemeVars['--border-color']}`, borderRadius:'var(--radius-lg)',
                  display:'flex', boxShadow:'var(--shadow-lg)', overflow:'hidden'
                }}>
                  {/* Mock Sidebar */}
                  <div style={{ width:'60px', background:newThemeVars['--bg-app'], borderRight:`1px solid ${newThemeVars['--border-color']}`, display:'flex', flexDirection:'column', alignItems:'center', padding:'1rem 0', gap:'1rem' }}>
                     <div style={{ width:24, height:24, background:'var(--accent-color)', borderRadius:6 }}/>
                     <div style={{ width:20, height:2, background:newThemeVars['--text-primary'], opacity:0.1 }}/>
                     {[1,2,3,4].map(i => (
                       <div key={i} style={{ width:24, height:24, background:newThemeVars['--text-primary'], opacity:i===1 ? 0.2 : 0.05, borderRadius:6 }}/>
                     ))}
                     <div style={{ marginTop:'auto', width:24, height:24, background:newThemeVars['--text-primary'], opacity:0.1, borderRadius:6 }}/>
                  </div>

                  {/* Mock Main Content */}
                  <div style={{ flex:1, display:'flex', flexDirection:'column', background:newThemeVars['--bg-app'] }}>
                    {/* Mock Header */}
                    <div style={{ height:'48px', background:newThemeVars['--bg-panel'], borderBottom:`1px solid ${newThemeVars['--border-color']}`, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.25rem' }}>
                       <div style={{ width:60, height:10, background:newThemeVars['--text-primary'], opacity:0.3, borderRadius:5 }}/>
                       <div style={{ width:24, height:24, background:newThemeVars['--text-primary'], opacity:0.1, borderRadius:'50%' }}/>
                    </div>

                    {/* Mock Dashboard Body */}
                    <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                       {/* Metric Grid */}
                       <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem' }}>
                          {[1,2,3].map(i => (
                            <div key={i} style={{ padding:'0.75rem', background:newThemeVars['--bg-panel'], border:`1px solid ${newThemeVars['--border-color']}`, borderRadius:8 }}>
                               <div style={{ width:40, height:6, background:newThemeVars['--text-secondary'], opacity:0.2, marginBottom:'8px' }}/>
                               <div style={{ width:30, height:12, background:newThemeVars['--text-primary'], opacity:0.8 }}/>
                            </div>
                          ))}
                       </div>

                       {/* List / Table */}
                       <div style={{ background:newThemeVars['--bg-panel'], border:`1px solid ${newThemeVars['--border-color']}`, borderRadius:10, overflow:'hidden' }}>
                          <div style={{ padding:'0.75rem 1rem', borderBottom:`1px solid ${newThemeVars['--border-color']}`, background:newThemeVars['--bg-panel'], display:'flex', justifyContent:'space-between' }}>
                             <div style={{ width:80, height:8, background:newThemeVars['--text-primary'], opacity:0.2 }}/>
                             <div style={{ width:40, height:8, background:newThemeVars['--text-primary'], opacity:0.1 }}/>
                          </div>
                          {[1,2,3].map(i => (
                             <div key={i} style={{ padding:'1rem', borderBottom:`1px solid ${newThemeVars['--border-color']}`, display:'flex', alignItems:'center', gap:'1rem' }}>
                                <div style={{ width:12, height:12, background:newThemeVars['--text-primary'], opacity:0.1, borderRadius:3 }}/>
                                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'6px' }}>
                                   <div style={{ width:'60%', height:8, background:newThemeVars['--text-primary'], opacity:0.5 }}/>
                                   <div style={{ width:'30%', height:6, background:newThemeVars['--text-secondary'], opacity:0.3 }}/>
                                </div>
                                <div style={{ width:40, height:18, background:'var(--accent-color)', borderRadius:4 }}/>
                             </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding:'1.25rem 1.5rem', borderTop:'1px solid var(--border-color)', display:'flex', justifyContent:'flex-end', gap:'0.875rem', background:'var(--bg-panel)' }}>
              <button className="btn" onClick={() => setIsCreatorOpen(false)} style={{ background:'transparent' }}>Cancelar</button>
              <button className="btn primary" onClick={handleSaveTheme} disabled={!newThemeName.trim()}>
                <Check size={18}/> Salvar Novo Tema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, desc, icon }) {
  return (
    <div style={{ marginBottom:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.375rem' }}>
        <div style={{ color:'var(--accent-color)' }}>{icon}</div>
        <h2 style={{ margin:0, fontSize:'1.25rem' }}>{title}</h2>
      </div>
      <p style={{ margin:0, fontSize:'0.9rem', color:'var(--text-secondary)' }}>{desc}</p>
    </div>
  );
}

function ThemeOption({ id, theme, isActive, onSelect, onEdit, onDelete, isCustom }) {
  const vars = theme.vars;
  return (
    <div 
      onClick={onSelect}
      style={{
        padding:'1.25rem', borderRadius:'var(--radius-lg)', cursor:'pointer',
        background: vars['--bg-panel'],
        border: isActive ? `2px solid var(--accent-color)` : `1px solid var(--border-color)`,
        boxShadow: isActive ? `0 8px 24px -4px ${isActive ? 'var(--accent-color)' : 'transparent'}20` : 'none',
        transition:'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display:'flex', flexDirection:'column', gap:'1rem',
        position:'relative',
        transform: isActive ? 'translateY(-2px)' : 'none'
      }}
      onMouseEnter={e => !isActive && (e.currentTarget.style.borderColor = 'var(--border-focus)')}
      onMouseLeave={e => !isActive && (e.currentTarget.style.borderColor = 'var(--border-color)')}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ fontWeight:700, fontSize:'0.875rem', color:vars['--text-primary'] }}>{theme.name}</div>
        {isActive && (
          <div style={{ 
            background:'var(--accent-color)', color:'var(--accent-text)', borderRadius:'50%', width:20, height:20, 
            display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-sm)' 
          }}><Check size={14}/></div>
        )}
      </div>
      
      <div style={{ background:vars['--bg-app'], height:72, borderRadius:'var(--radius-md)', padding:'10px', display:'flex', gap:'8px' }}>
        <div style={{ flex:1, background:vars['--bg-panel'], border:`1px solid ${vars['--border-color']}`, borderRadius:4 }}></div>
        <div style={{ flex:2, display:'flex', flexDirection:'column', gap:'6px', justifyContent:'center' }}>
          <div style={{ width:'70%', height:5, background:vars['--text-primary'], opacity:0.2, borderRadius:1 }}></div>
          <div style={{ width:'40%', height:5, background:vars['--text-primary'], opacity:0.1, borderRadius:1 }}></div>
          <div style={{ width:'30%', height:8, background:'var(--accent-color)', borderRadius:2, marginTop:6 }}></div>
        </div>
      </div>

      <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
        <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--bg-app'], border:'1px solid rgba(255,255,255,0.1)' }}/>
        <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--bg-panel'], border:'1px solid rgba(255,255,255,0.1)' }}/>
        <div style={{ width:14, height:14, borderRadius:'50%', background:vars['--text-primary'], border:'1px solid rgba(255,255,255,0.1)' }}/>
      </div>

      {isCustom && (
        <div style={{ marginTop:'0.5rem', display:'flex', gap:'0.625rem', paddingTop:'0.875rem', borderTop:`1px solid ${vars['--border-color']}` }}>
          <button className="btn" style={{ padding:'4px 8px', fontSize:'11px', flex:1, background:'transparent' }} onClick={(e) => { e.stopPropagation(); onEdit(); }}>Editar</button>
          <button className="btn danger" style={{ padding:'4px 8px', background:'transparent', borderColor:'transparent' }} onClick={(e) => { e.stopPropagation(); onDelete(); }}><Trash2 size={14}/></button>
        </div>
      )}
    </div>
  );
}

export default Settings;
