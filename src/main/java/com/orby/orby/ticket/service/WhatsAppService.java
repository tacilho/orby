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

@Service
public class WhatsAppService {

    private final RestTemplate restTemplate;

    @Value("${whatsapp.api.url:https://graph.facebook.com/v19.0}")
    private String apiUrl;

    @Value("${whatsapp.phone.number.id:}")
    private String phoneNumberId;

    @Value("${whatsapp.api.token:}")
    private String apiToken;

    public WhatsAppService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendTextMessage(String to, String text) {
        System.out.println("WhatsAppService.sendTextMessage chamado para: " + to);
        System.out.println("Config - PhoneID: " + (phoneNumberId != null ? phoneNumberId : "NULL"));
        System.out.println("Config - Token: " + (apiToken != null && apiToken.length() > 10 ? "CARREGADO" : "FALTOU OU CURTO"));

        if (phoneNumberId == null || phoneNumberId.isEmpty() || apiToken == null || apiToken.isEmpty()) {
            System.err.println("WhatsApp API not configured. Skipping message to " + to);
            return;
        }

        String url = String.format("%s/%s/messages", apiUrl, phoneNumberId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        Map<String, Object> body = new HashMap<>();
        body.put("messaging_product", "whatsapp");
        body.put("to", to.startsWith("+") ? to : "+" + to);
        body.put("type", "template");

        Map<String, Object> template = new HashMap<>();
        template.put("name", "hello_world");
        Map<String, String> language = new HashMap<>();
        language.put("code", "en_US");
        template.put("language", language);
        
        body.put("template", template);

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
}
