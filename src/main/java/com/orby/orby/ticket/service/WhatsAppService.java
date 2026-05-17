package com.orby.orby.ticket.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import com.orby.orby.admin.model.TenantConfig;
import com.orby.orby.shared.tenant.TenantContext;

@Service
public class WhatsAppService {

    private final RestTemplate restTemplate;
    private final com.orby.orby.admin.repository.TenantConfigRepository tenantConfigRepository;

    @Value("${whatsapp.api.url:https://graph.facebook.com/v19.0}")
    private String apiUrl;

    @Value("${whatsapp.phone.number.id:}")
    private String globalPhoneNumberId;

    @Value("${whatsapp.api.token:}")
    private String globalApiToken;

    @Value("${whatsapp.bridge.url:http://localhost:3333}")
    private String bridgeUrl;

    public WhatsAppService(RestTemplate restTemplate, com.orby.orby.admin.repository.TenantConfigRepository tenantConfigRepository) {
        this.restTemplate = restTemplate;
        this.tenantConfigRepository = tenantConfigRepository;
    }

    private TenantConfig getActiveConfig() {
        String currentTenant = TenantContext.getCurrentTenant();
        if (currentTenant == null) {
            return null;
        }
        return tenantConfigRepository.findByTenantId(currentTenant).orElse(null);
    }

    private String getPhoneNumberId(TenantConfig config) {
        if (config != null && config.getWhatsAppPhoneNumberId() != null && !config.getWhatsAppPhoneNumberId().isEmpty()) {
            return config.getWhatsAppPhoneNumberId();
        }
        return globalPhoneNumberId;
    }

    private String getApiToken(TenantConfig config) {
        if (config != null && config.getWhatsAppApiToken() != null && !config.getWhatsAppApiToken().isEmpty()) {
            return config.getWhatsAppApiToken();
        }
        return globalApiToken;
    }

    /**
     * Envia mensagem de texto via Bridge Node.js (Baileys/QR Code)
     */
    private void sendViaBridge(String instanceName, String to, String text) {
        try {
            String url = String.format("%s/api/message/sendText/%s", bridgeUrl, instanceName);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("number", to);
            body.put("text", text);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("[BRIDGE] Mensagem enviada via QR Code Bridge: " + response.getStatusCode());
        } catch (Exception e) {
            System.err.println("[BRIDGE] Erro ao enviar via Bridge: " + e.getMessage());
        }
    }

    public void sendTextMessage(String to, String text) {
        TenantConfig config = getActiveConfig();

        // Se o provedor for QRCODE, enviar via Bridge Node.js
        if ("QRCODE".equalsIgnoreCase(config != null ? config.getWhatsAppProvider() : "")) {
            String instanceName = config.getTenantId();
            System.out.println("[QRCODE] Enviando via Bridge para " + to + " (instância: " + instanceName + ")");
            sendViaBridge(instanceName, to, text);
            return;
        }

        String phoneId = getPhoneNumberId(config);
        String token = getApiToken(config);

        System.out.println("WhatsAppService.sendTextMessage chamado para: " + to + " no tenant: " + TenantContext.getCurrentTenant());

        if (phoneId == null || phoneId.isEmpty() || token == null || token.isEmpty()) {
            System.err.println("WhatsApp API not configured. Skipping message to " + to);
            return;
        }

        String url = String.format("%s/%s/messages", apiUrl, phoneId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> body = new HashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("to", to.startsWith("+") ? to : "+" + to);
        body.put("type", "text");
        Map<String, String> textBody = new HashMap<>();
        textBody.put("body", text);
        body.put("text", textBody);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            System.out.println("Sending WhatsApp message to: " + to);
            System.out.println("URL: " + url);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            System.out.println("WhatsApp API Response: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp message. Error: " + e.getMessage());
            if (e instanceof org.springframework.web.client.HttpStatusCodeException) {
                System.err.println("Response body: " + ((org.springframework.web.client.HttpStatusCodeException) e).getResponseBodyAsString());
            }
        }
    }

    public String getMediaUrl(String mediaId) {
        TenantConfig config = getActiveConfig();
        String token = getApiToken(config);

        if (token == null || token.isEmpty()) return null;

        String url = String.format("%s/%s", apiUrl, mediaId);
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, request, Map.class);
            if (response.getBody() != null) {
                return (String) response.getBody().get("url");
            }
        } catch (Exception e) {
            System.err.println("Failed to get media URL for ID " + mediaId + ": " + e.getMessage());
        }
        return null;
    }

    public void sendMediaMessage(String to, com.orby.orby.ticket.model.ChatMessageType type, String mediaUrl, String caption) {
        TenantConfig config = getActiveConfig();

        // Se o provedor for QRCODE, enviar via Bridge Node.js
        if ("QRCODE".equalsIgnoreCase(config != null ? config.getWhatsAppProvider() : "")) {
            try {
                String instanceName = config.getTenantId();
                String url = String.format("%s/api/message/sendMedia/%s", bridgeUrl, instanceName);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, String> body = new HashMap<>();
                body.put("number", to);
                body.put("mediaUrl", mediaUrl);
                body.put("type", type.name());
                body.put("caption", caption);

                HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
                restTemplate.postForEntity(url, request, String.class);
                System.out.println("[BRIDGE] Mídia enviada via QR Code Bridge");
            } catch (Exception e) {
                System.err.println("[BRIDGE] Erro ao enviar mídia via Bridge: " + e.getMessage());
            }
            return;
        }

        String phoneId = getPhoneNumberId(config);
        String token = getApiToken(config);

        if (phoneId == null || phoneId.isEmpty() || token == null || token.isEmpty()) {
            return;
        }

        String url = String.format("%s/%s/messages", apiUrl, phoneId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(token);

        Map<String, Object> body = new HashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("to", to.startsWith("+") ? to : "+" + to);
        
        String typeStr = type.name().toLowerCase();
        body.put("type", typeStr);

        Map<String, String> mediaBody = new HashMap<>();
        mediaBody.put("link", mediaUrl);
        if (caption != null && !caption.isEmpty() && (type == com.orby.orby.ticket.model.ChatMessageType.IMAGE || type == com.orby.orby.ticket.model.ChatMessageType.VIDEO)) {
            mediaBody.put("caption", caption);
        }
        body.put(typeStr, mediaBody);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send WhatsApp media message: " + e.getMessage());
        }
    }
}
