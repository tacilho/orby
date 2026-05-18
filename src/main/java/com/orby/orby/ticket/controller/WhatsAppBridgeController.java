package com.orby.orby.ticket.controller;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.admin.service.TenantConfigService;
import com.orby.orby.shared.tenant.TenantContext;
import com.orby.orby.ticket.service.ChatService;
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

    private final TenantConfigService tenantConfigService;
    private final ChatService chatService;

    public WhatsAppBridgeController(TenantConfigService tenantConfigService,
                                     ChatService chatService) {
        this.tenantConfigService = tenantConfigService;
        this.chatService = chatService;
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

        if (instanceName != null) {
            try {
                TenantContext.setCurrentTenant(instanceName);
                Optional<TenantConfig> configOpt = tenantConfigService.getConfigForCurrentTenant();
                TenantConfig config = configOpt.orElseGet(() -> {
                    TenantConfig newConfig = new TenantConfig();
                    newConfig.setTenantId(instanceName);
                    return newConfig;
                });
                config.setWhatsAppProvider("QRCODE");
                config.setQrCodeConnectedNumber(phoneNumber);
                tenantConfigService.saveConfigForCurrentTenant(config);
                System.out.println("[WhatsApp Bridge] TenantConfig atualizado para " + instanceName);
            } finally {
                TenantContext.clear();
            }
        }

        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    /**
     * Recebe mensagens do WhatsApp encaminhadas pelo Bridge (Baileys).
     * Converte para o formato interno e reutiliza toda a lógica existente de criação de tickets via ChatService.
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

        String tenantId = instanceName != null ? instanceName : "default";

        try {
            TenantContext.setCurrentTenant(tenantId);

            com.orby.orby.ticket.model.ChatMessageType msgType = com.orby.orby.ticket.model.ChatMessageType.TEXT;
            if ("IMAGE".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.IMAGE;
            else if ("VIDEO".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.VIDEO;
            else if ("AUDIO".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.AUDIO;
            else if ("DOCUMENT".equals(messageType)) msgType = com.orby.orby.ticket.model.ChatMessageType.DOCUMENT;

            chatService.handleIncomingMessage(senderNumber, content != null ? content : "", msgType, null, null);

        } catch (Exception e) {
            System.err.println("[WhatsApp Bridge] Erro ao processar mensagem: " + e.getMessage());
            e.printStackTrace();
        } finally {
            TenantContext.clear();
        }

        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
