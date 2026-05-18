package com.orby.orby.ticket.controller;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.repository.TenantConfigRepository;
import com.orby.orby.shared.tenant.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Controller que recebe notificações do microserviço Node.js WhatsApp Bridge (Baileys).
 * Endpoints:
 *   POST /api/whatsapp-bridge/connected  → Notificação de conexão bem-sucedida via QR Code
 *   POST /api/whatsapp-bridge/message    → Mensagem recebida de um contato no WhatsApp
 */
@RestController
@RequestMapping("/api/whatsapp-bridge")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class WhatsAppBridgeController {

    private final TenantConfigRepository tenantConfigRepository;
    private final WhatsAppWebhookController webhookController;

    public WhatsAppBridgeController(TenantConfigRepository tenantConfigRepository,
                                     WhatsAppWebhookController webhookController) {
        this.tenantConfigRepository = tenantConfigRepository;
        this.webhookController = webhookController;
    }

    /**
     * Recebe notificação do Bridge quando um dispositivo é conectado com sucesso via QR Code.
     * Atualiza o TenantConfig com o número do telefone conectado e o provedor como QRCODE.
     */
    @PostMapping("/connected")
    public ResponseEntity<?> onConnected(@RequestBody Map<String, String> payload) {
        String instanceName = payload.get("instanceName");
        String phoneNumber = payload.get("phoneNumber");

        System.out.println("[WhatsApp Bridge] ✅ Dispositivo conectado!");
        System.out.println("[WhatsApp Bridge] Instância: " + instanceName);
        System.out.println("[WhatsApp Bridge] Número: " + phoneNumber);

        // instanceName é o tenantId da empresa
        if (instanceName != null) {
            try {
                TenantContext.setCurrentTenant(instanceName);
                Optional<TenantConfig> configOpt = tenantConfigRepository.findByTenantId(instanceName);
                if (configOpt.isPresent()) {
                    TenantConfig config = configOpt.get();
                    config.setWhatsAppProvider("QRCODE");
                    config.setQrCodeConnectedNumber(phoneNumber);
                    tenantConfigRepository.save(config);
                    System.out.println("[WhatsApp Bridge] TenantConfig atualizado para " + instanceName);
                }
            } finally {
                TenantContext.clear();
            }
        }

        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /**
     * Recebe mensagens do WhatsApp encaminhadas pelo Bridge (Baileys).
     * Converte para o formato interno e reutiliza toda a lógica existente de criação de tickets.
     */
    @PostMapping("/message")
    public ResponseEntity<?> onMessage(@RequestBody Map<String, Object> payload) {
        String instanceName = (String) payload.get("instanceName");
        String senderNumber = (String) payload.get("senderNumber");
        String senderName = (String) payload.get("senderName");
        String content = (String) payload.get("content");
        String messageType = (String) payload.get("messageType");

        System.out.println("[WhatsApp Bridge] 📨 Mensagem recebida!");
        System.out.println("[WhatsApp Bridge] De: " + senderName + " (" + senderNumber + ")");
        System.out.println("[WhatsApp Bridge] Tipo: " + messageType);
        System.out.println("[WhatsApp Bridge] Conteúdo: " + content);

        // Definir o tenant com base no instanceName
        String tenantId = instanceName != null ? instanceName : "default";

        try {
            TenantContext.setCurrentTenant(tenantId);

            // Converter tipo de mensagem
            com.orby.orby.ticket.model.ChatMessageType msgType = com.orby.orby.ticket.model.ChatMessageType.TEXT;
            if ("IMAGE".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.IMAGE;
            else if ("VIDEO".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.VIDEO;
            else if ("AUDIO".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.AUDIO;
            else if ("DOCUMENT".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.DOCUMENT;

            // Reutilizar toda a lógica do webhook controller existente (cria cliente, ticket, salva mensagem, notifica via WebSocket)
            // O método handleIncomingMessage precisa ser acessível - vamos invocar diretamente
            webhookController.handleIncomingMessage(senderNumber, content != null ? content : "", msgType, null, null);

        } catch (Exception e) {
            System.err.println("[WhatsApp Bridge] Erro ao processar mensagem: " + e.getMessage());
            e.printStackTrace();
        } finally {
            TenantContext.clear();
        }

        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
