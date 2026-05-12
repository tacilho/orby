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
        /* 
        // Logica para lidar com o 9º dígito brasileiro (Meta Cloud API costuma falhar com o 9)
        if (to.startsWith("55") && to.length() == 13) {
            // Remove o 9 (o dígito na posição index 4: 55 19 [9] ...)
            to = to.substring(0, 4) + to.substring(5);
        } else if (to.startsWith("+55") && to.length() == 14) {
            // Remove o 9 (o dígito na posição index 5: +55 19 [9] ...)
            to = to.substring(0, 5) + to.substring(6);
        }
        */

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
}
