package com.orby.orby.config;

import com.orby.orby.shared.tenant.TenantContext;

import com.orby.orby.admin.model.Client;
import com.orby.orby.admin.model.Operator;
import com.orby.orby.admin.model.OperatorStatus;
import com.orby.orby.admin.model.Sector;
import com.orby.orby.admin.repository.ClientRepository;
import com.orby.orby.admin.repository.OperatorRepository;
import com.orby.orby.admin.repository.SectorRepository;
import com.orby.orby.ticket.model.*;
import com.orby.orby.ticket.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            SectorRepository sectorRepo,
            OperatorRepository operatorRepo,
            ClientRepository clientRepo,
            SupportTicketRepository ticketRepo,
            TicketReasonRepository reasonRepo,
            TicketSubReasonRepository subReasonRepo,
            CannedResponseRepository cannedRepo,
            ChatMessageRepository messageRepo) {
        
        return args -> {
            TenantContext.setCurrentTenant("default");
            try {
                if (sectorRepo.count() > 0) return; // Prevent double seeding

            // 1. Sectors
            Sector s1 = createSector(sectorRepo, "Suporte N1");
            Sector s2 = createSector(sectorRepo, "Suporte N2");
            Sector s3 = createSector(sectorRepo, "Financeiro");
            Sector s4 = createSector(sectorRepo, "Comercial");

            // 2. Operators
            Operator op1 = createOperator(operatorRepo, "Gabriel Otacilio", "gabriel@orby.com", s1.getId());
            Operator op2 = createOperator(operatorRepo, "Bruno Souza", "bruno@orby.com", s1.getId());
            Operator op3 = createOperator(operatorRepo, "Carla Dias", "carla@orby.com", s2.getId());
            Operator op4 = createOperator(operatorRepo, "Diego Lima", "diego@orby.com", s3.getId());

            // 3. Clients
            Client c1 = createClient(clientRepo, "Tech Solutions", "12.345.678/0001-01");
            Client c2 = createClient(clientRepo, "Global Logistics", "98.765.432/0001-99");
            Client c3 = createClient(clientRepo, "Padaria do João", "11.222.333/0001-44");
            Client c4 = createClient(clientRepo, "Construtora Alpha", "55.666.777/0001-88");

            // 4. Reasons & SubReasons
            TicketReason r1 = createReason(reasonRepo, "Suporte Técnico");
            TicketReason r2 = createReason(reasonRepo, "Financeiro");
            
            createSubReason(subReasonRepo, r1, "Dúvida no Sistema");
            createSubReason(subReasonRepo, r1, "Erro de Login");
            createSubReason(subReasonRepo, r2, "Segunda Via de Boleto");

            // 5. Canned Responses
            createCanned(cannedRepo, "Saudação", "Olá! Como posso ajudar hoje?");
            createCanned(cannedRepo, "Verificando", "Estou verificando seu caso agora mesmo, um momento por favor.");

            // 6. Tickets
            Random rand = new Random();
            List<Client> clients = List.of(c1, c2, c3, c4);
            List<Operator> operators = List.of(op1, op2, op3, op4);
            List<Sector> sectors = List.of(s1, s2, s3, s4);

            // 5 Open Tickets
            for (int i = 1; i <= 5; i++) {
                SupportTicket t = new SupportTicket();
                t.setClient(clients.get(i % clients.size()));
                t.setSector(sectors.get(i % sectors.size()));
                t.setStatus(TicketStatus.OPEN);
                t.setCreatedAt(LocalDateTime.now().minusHours(i));
                t.setTenantId("default");
                ticketRepo.save(t);
            }

            // 5 In Progress Tickets
            for (int i = 1; i <= 5; i++) {
                SupportTicket t = new SupportTicket();
                t.setClient(clients.get(i % clients.size()));
                t.setSector(sectors.get(i % sectors.size()));
                t.setOperator(operators.get(i % operators.size()));
                t.setStatus(TicketStatus.IN_PROGRESS);
                t.setCreatedAt(LocalDateTime.now().minusDays(1).plusHours(i));
                t.setAcceptedAt(t.getCreatedAt().plusMinutes(15));
                t.setTenantId("default");
                ticketRepo.save(t);
            }

            // 10 Closed Tickets for reports
            for (int i = 1; i <= 10; i++) {
                SupportTicket t = new SupportTicket();
                t.setClient(clients.get(i % clients.size()));
                t.setSector(sectors.get(i % sectors.size()));
                t.setOperator(operators.get(i % operators.size()));
                t.setStatus(TicketStatus.CLOSED);
                t.setReason(r1.getTitle());
                t.setSubReason("Dúvida no Sistema");
                t.setCreatedAt(LocalDateTime.now().minusDays(i));
                t.setAcceptedAt(t.getCreatedAt().plusMinutes(10));
                t.setClosedAt(t.getAcceptedAt().plusMinutes(30));
                t.setRating(rand.nextInt(3) + 3); // 3-5 stars
                t.setTenantId("default");
                ticketRepo.save(t);
            }
            } finally {
                TenantContext.clear();
            }
        };
    }

    private Sector createSector(SectorRepository repo, String name) {
        Sector s = new Sector();
        s.setName(name);
        s.setTenantId("default");
        return repo.save(s);
    }

    private Operator createOperator(OperatorRepository repo, String name, String email, Long sectorId) {
        Operator o = new Operator();
        o.setName(name);
        o.setEmail(email);
        o.setSectorId(sectorId);
        o.setPassword("123456");
        o.setStatus(OperatorStatus.ONLINE);
        o.setTenantId("default");
        return repo.save(o);
    }

    private Client createClient(ClientRepository repo, String name, String doc) {
        Client c = new Client();
        c.setName(name);
        c.setDocument(doc);
        c.setTenantId("default");
        return repo.save(c);
    }

    private TicketReason createReason(TicketReasonRepository repo, String title) {
        TicketReason r = new TicketReason();
        r.setTitle(title);
        r.setTenantId("default");
        return repo.save(r);
    }

    private void createSubReason(TicketSubReasonRepository repo, TicketReason parent, String title) {
        TicketSubReason sr = new TicketSubReason();
        sr.setReason(parent);
        sr.setTitle(title);
        sr.setTenantId("default");
        repo.save(sr);
    }

    private void createCanned(CannedResponseRepository repo, String title, String text) {
        CannedResponse c = new CannedResponse();
        c.setTitle(title);
        c.setText(text);
        c.setTenantId("default");
        repo.save(c);
    }
}
