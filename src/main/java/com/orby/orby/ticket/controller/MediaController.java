package com.orby.orby.ticket.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.InetAddress;
import java.net.URI;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final RestTemplate secureRestTemplate;

    @Value("${whatsapp.api.token:}")
    private String apiToken;

    public MediaController() {
        // Criar um RestTemplate seguro que explicitamente não segue redirecionamentos HTTP (3xx)
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory() {
            @Override
            protected void prepareConnection(java.net.HttpURLConnection connection, String httpMethod) throws java.io.IOException {
                super.prepareConnection(connection, httpMethod);
                connection.setInstanceFollowRedirects(false);
            }
        };
        this.secureRestTemplate = new RestTemplate(factory);
    }

    @GetMapping("/proxy")
    public ResponseEntity<byte[]> proxyMedia(@RequestParam("url") String url) {
        if (apiToken == null || apiToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 1. Validar a URL contra ataques de SSRF
        if (!isUrlAllowedAndSafe(url)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<byte[]> response = secureRestTemplate.exchange(url, HttpMethod.GET, request, byte[].class);
            
            // Tratar respostas que não sejam 200 OK (como redirecionamentos 3xx)
            if (response.getStatusCode() != HttpStatus.OK) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.setContentType(response.getHeaders().getContentType());
            responseHeaders.setContentLength(response.getHeaders().getContentLength());
            
            return new ResponseEntity<>(response.getBody(), responseHeaders, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private boolean isUrlAllowedAndSafe(String urlStr) {
        try {
            URI uri = new URI(urlStr);
            
            // Enforce HTTPS
            String scheme = uri.getScheme();
            if (scheme == null || !scheme.equalsIgnoreCase("https")) {
                return false;
            }

            // Validar HOST
            String host = uri.getHost();
            if (host == null || host.isEmpty()) {
                return false;
            }

            host = host.toLowerCase();

            // Domínios da allowlist
            boolean isAllowedDomain = host.equals("facebook.com") || host.endsWith(".facebook.com")
                    || host.equals("fbsbx.com") || host.endsWith(".fbsbx.com")
                    || host.equals("whatsapp.net") || host.endsWith(".whatsapp.net");

            if (!isAllowedDomain) {
                return false;
            }

            // DNS Resolution & IP Range checks (Defense in Depth contra DNS Rebinding e Intranet scans)
            InetAddress address = InetAddress.getByName(host);
            if (address.isLoopbackAddress() || address.isLinkLocalAddress() || address.isSiteLocalAddress() || address.isMulticastAddress()) {
                return false;
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
