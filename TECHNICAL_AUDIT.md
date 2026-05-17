[ignoring loop detection]

# 📑 ORBY TECHNICAL & SECURITY AUDIT REPORT
**Projeto:** Orby - Plataforma Omnichannel SaaS Enterprise  
**Data da Auditoria:** 17 de Maio de 2026  
**Auditor:** Principal Software Architect & Technical Lead (Antigravity AI Auditor)  
**Status de Segurança:** Confiabilidade Crítica (Análise não destrutiva)

---

## SEÇÃO 1 — RESUMO EXECUTIVO

### 1. Estado Real do Projeto
O Orby é uma plataforma Omnichannel que integra atendimento ao cliente via WhatsApp (com suporte a conexões híbridas: Meta Cloud API e Baileys QR Code Bridge) com fluxos de Kanban de desenvolvimento. 
Embora o software apresente uma interface rica, visualmente atraente e com animações modernas, a sua estrutura interna de código e arquitetura de dados revela que o projeto foi desenvolvido de forma extremamente acelerada ("vibe coded"). O sistema comporta-se como um **protótipo funcional altamente instável**, sustentado por decisões técnicas perigosas, atalhos arquiteturais e brechas críticas de segurança.

### 2. Grau de Maturidade: `PROTÓTIPO ACELERADO / MVP INSTÁVEL`
*   **Comercialização:** Absolutamente **inviável** para uso sério por empresas reais no estado atual.
*   **Segurança:** Totalmente comprometida.
*   **Isolamento SaaS (Multi-Tenancy):** Crítico e inoperante por completo.

### 3. Principais Riscos Detectados
1.  **Vazamento Total de Dados entre Clientes (Tenant Leakage):** A isolação de banco de dados (SaaS Multi-Tenancy) falha silenciosamente. Qualquer empresa pode visualizar e interagir com chamados, notas e dados de outras empresas.
2.  **Invasão de Conta via CSRF:** A combinação de JWT armazenado em cookies HttpOnly com o CSRF desabilitado expõe operadores a controle de sessão por sites terceiros maliciosos.
3.  **Falsificação de Mensagens do WhatsApp:** Falta de validação criptográfica (X-Hub-Signature-256) na recepção de webhooks permite a qualquer pessoa forjar mensagens e injetar dados no sistema.
4.  **Uso de Reflexão do Java em Controladores (Reflection Anti-Pattern):** O backend realiza chamadas a métodos privados de outras classes via Java Reflection dentro do fluxo de recebimento de mensagens, criando uma fragilidade estrutural severa.
5.  **Perda Total de Dados em Boot (DDL Create-Drop):** O sistema utiliza banco H2 em memória com a estratégia de DDL `create-drop`. Se o servidor reiniciar, todos os clientes, chamados, operadores e históricos de conversas são permanentemente apagados do planeta.

---

## SEÇÃO 2 — O QUE FUNCIONA BEM

*   **Motor de Temas Dinâmicos (Tailored HSL Themes):** O sistema de personalização visual baseado em variáveis CSS (`App.jsx` e `AppContext.jsx`) funciona de maneira brilhante. A conversão de cores hexadecimais para HSL e o cálculo de contraste/luminosidade automática garantem excelente usabilidade.
*   **Bridge WebSocket em Tempo Real:** A integração WebSocket com STOMP/SockJS para sincronização de mensagens e troca de status está bem configurada no lado do Spring Boot e React.
*   **Módulo de Atendimento Híbrido:** A lógica de envio híbrido (Meta API ou QR Code Baileys) em `WhatsAppService.java` está bem modularizada no nível do Service, permitindo chaveamento ágil de canais de entrega.
*   **Lógica de Atendimento (State Machine de Chamados):** Os fluxos de transição de chamados (assumir, transferir de setor, colocar em espera e finalizar com rating) possuem regras de negócio bem definidas no backend.

---

## SEÇÃO 3 — O QUE NÃO FUNCIONA

### 1. Multi-Tenancy (Isolamento de Dados) Totalmente Quebrado
*   **Descrição:** O isolamento SaaS baseia-se no uso de `@FilterDef` do Hibernate em `TenantAwareEntity.java`. No entanto, em `HibernateFilterConfig.java`, o filtro é habilitado dentro de listeners `PreLoad` e `PostLoad`.
*   **Localização:** `HibernateFilterConfig.java` (Linhas 45-63)
*   **Impacto:** **CRÍTICO**. O evento `PreLoad` do Hibernate é disparado *após* a compilação do comando SQL de seleção. Portanto, habilitar o filtro neste ponto **não altera o SQL compilado**. Chamadas padrão dos Repositories (como `findAll()`, `findById()`, etc.) executam queries sem a cláusula `WHERE tenant_id = ?`, retornando dados de todos os inquilinos (tenants) indiscriminadamente.
*   **Consequência Prática:** Qualquer empresa conectada à plataforma tem acesso à lista e ao histórico completo de chamados de todas as outras empresas clientes do seu SaaS.

### 2. Hardcode de Tenant no Cadastro e Atualização de Clientes
*   **Descrição:** O método de atualização de dados cadastrais do cliente possui o ID do inquilino chumbado como literal de string `"default"`.
*   **Localização:** `ClientController.java` (Linha 22)
*   **Impacto:** **ALTO / BLOQUEANTE**. 
*   **Consequência Prática:** Empresas registradas em outros tenants (ex: `empresa_a`) nunca conseguirão atualizar os dados de seus clientes. Qualquer tentativa retornará `404 Not Found` porque o controller força a busca no tenant `"default"`.

### 3. Falta de Sincronização Dinâmica do Histórico de Chats na Sidebar
*   **Descrição:** O operador apenas se inscreve no tópico de WebSocket de mensagens do chamado focado (`activeTicketId`).
*   **Localização:** `AppContext.jsx` (Linhas 678-706)
*   **Impacto:** **MÉDIO / UX comprometida**.
*   **Consequência Prática:** Se o operador estiver olhando para a tela do chamado "A" e o cliente do chamado "B" mandar uma mensagem, a sidebar esquerda não exibirá um indicador/badge de nova mensagem em tempo real, nem atualizará o preview do texto. O operador precisa clicar manualmente no chamado para forçar uma requisição HTTP REST para descobrir se há novidades.

---

## SEÇÃO 4 — O QUE NÃO FAZ SENTIDO (INCOERÊNCIAS)

### 1. Invocação Privada via Java Reflection entre Controladores
*   **Descrição:** O controller do Bridge executa um bypass de encapsulamento chamando um método `private` do controller do webhook via reflexão do Java.
*   **Localização:** `WhatsAppBridgeController.java` (Linhas 97-102)
*   **Incoerência:** Se o método `handleIncomingMessage` precisa ser reaproveitado, ele deve residir em um `Service` de negócio injetado (ex: `ChatService`). Chamar reflexão dinâmica dentro de uma rota de alta concorrência destrói a legibilidade, degrada performance e quebra o compilador Java se o método mudar de assinatura.

### 2. Ausência Total de Tratamento Global de Exceções
*   **Descrição:** Não existe nenhuma classe anotada com `@ControllerAdvice` ou `@ExceptionHandler`.
*   **Incoerência:** Sem um interceptador global, qualquer erro de banco ou ponteiro nulo devolve uma stack trace crua do Java na resposta HTTP. O usuário final recebe nomes de tabelas, estruturas internas e vulnerabilidades do servidor expostas diretamente no navegador.

### 3. IPs e URLs de Desenvolvimento Hardcoded no Frontend
*   **Descrição:** Variáveis como `API_BASE` e `BRIDGE_URL` estão chumbadas como `http://localhost:8080` e `http://localhost:3333`.
*   **Localização:** `AuthContext.jsx` (Linha 5) e `Settings.jsx` (Linha 27)
*   **Incoerência:** Torna impossível rodar build de staging ou produção sem ter que editar o código fonte manualmente. Deve-se adotar variáveis de ambiente (`.env`).

---

## SEÇÃO 5 — DÍVIDA TÉCNICA

*   **Isolamento de Banco (CRÍTICA):** Filtro Hibernate inoperante. Risco de vazamento de dados corporativos (Tenants).
*   **Persistência de Dados (CRÍTICA):** Banco H2 em memória com `create-drop`. Perda de dados garantida em caso de reboot.
*   **Arquitetura de Código (ALTA):** Uso de Java Reflection, controllers chamando controllers e falta de DTOs consistentes.
*   **Tratamento de Erros (MÉDIO):** Ausência de `@ControllerAdvice` no backend e ausência de `ErrorBoundary` no React.
*   **Configuration Management (MÉDIO):** URLs de APIs locais hardcoded em múltiplos arquivos no frontend.

---

## SEÇÃO 6 — RISCOS DE PRODUÇÃO

### 1. Riscos Operacionais: `CRÍTICO`
*   **Esvaziamento de Dados:** Um pico de memória na VPS que derrube o processo Java resultará na deleção de 100% dos dados operacionais da empresa devido ao H2 em memória.
*   **Instabilidade do Painel React (Blank Screen):** Um único campo nulo vindo de uma mensagem incompleta do WhatsApp resultará no travamento da tela inteira do operador, sem chance de recuperação sem recarregar (F5).

### 2. Riscos de Segurança: `CRÍTICO`
*   **Vazamento Judicial de Dados:** Empresas sob regulação (como LGPD) processarão a plataforma por verem dados sensíveis (documentos, telefones, chats) de clientes concorrentes na mesma tela.

### 3. Riscos de Escalabilidade: `CRÍTICO`
*   **Vazamento de Memória por LID mapping:** A ausência de limites na sincronização do Baileys anteriormente criava mais de 10.000 arquivos de texto em segundos, o que estouraria o limite de *inodes* em discos SSD de servidores pequenos em produção, derrubando o sistema operacional.

---

## SEÇÃO 7 — O QUE PRECISA SER REFEITO

### Precisa de Reestruturação Completa:
1.  **Multi-Tenancy:** Remover os listeners de `PreLoad` / `PostLoad` do Hibernate. Implementar o isolamento dinâmico via Aspectos AOP (`@Aspect` interceptando controllers/serviços) ou configurar um interceptador do Hibernate em nível de sessão que execute o `.unwrap(Session.class).enableFilter("tenantFilter")` a cada requisição identificada no `TenantContext`.
2.  **Arquitetura do Bridge / Webhooks:** Mudar o fluxo de `WhatsAppBridgeController` para chamar um `ChatService` compartilhado. Eliminar o uso do `java.lang.reflect.Method` e injeção por reflexão.

### Precisa apenas de Ajuste/Refatoração:
1.  **Segurança do Webhook:** Implementar a validação do cabeçalho `X-Hub-Signature-256` nos controllers que recebem payloads do Facebook (Meta), validando com o App Secret.
2.  **CORS e CSRF:** Habilitar a proteção de CSRF na configuração do Spring Security e associar cookies de sessão ao atributo `SameSite=Strict`.
3.  **Configuração de Banco de Dados:** Mudar o driver jdbc para PostgreSQL no `application.properties` e integrar ferramenta de migration (Flyway ou Liquibase).

---

## SEÇÃO 8 — SEGURANÇA (VULNERABILITY REPORT)

### 🚨 VULNERABILIDADE 1: Vazamento de Dados Multi-Tenant (Tenant Leakage)
*   **Severidade:** `CRÍTICA (CVSS: 9.8 / 10)`
*   **Exploração:** Simples chamadas HTTP para o endpoint `/management/tickets` sem cabeçalhos especiais retornarão dados de todos os clientes.
*   **Impacto:** Quebra total de confidencialidade de dados de clientes SaaS.

### 🚨 VULNERABILIDADE 2: Falha Crítica de CSRF (Cross-Site Request Forgery)
*   **Severidade:** `ALTA (CVSS: 8.8 / 10)`
*   **Exploração:** O JWT é guardado no cookie e enviado automaticamente em requests. Como `http.csrf(csrf -> csrf.disable())` está ativo, se um operador autenticado acessar um site malicioso, esse site pode executar ações no Orby (como fechar chamados, cadastrar usuários) usando a sessão do operador de forma invisível.
*   **Impacto:** Ações administrativas forjadas por terceiros.

### 🚨 VULNERABILIDADE 3: Recepção de Webhook sem Assinatura Criptográfica
*   **Severidade:** `ALTA (CVSS: 7.5 / 10)`
*   **Exploração:** O controller `/api/webhooks/whatsapp` aceita requisições POST arbitrárias sem validar a assinatura HMAC do Facebook. Qualquer ator mal-intencionado na internet pode disparar mensagens falsas diretamente no painel.
*   **Impacto:** Injeção de dados falsos e perturbação operacional de chats de suporte.

---

## SEÇÃO 9 — SCORE TÉCNICO

*   **Arquitetura:** `35/100` (Uso de reflexão, quebra de camadas e controllers chamando controllers).
*   **Frontend:** `75/100` (Design e micro-interações excelentes, mas vulnerável a crashes sem ErrorBoundary e com URLs locais hardcoded).
*   **Backend:** `45/100` (Inexistência de tratamento global de exceções, vazamento de stacktrace e acoplamento severo).
*   **Banco de Dados:** `20/100` (In-memory H2 e falta de migrations/persistência).
*   **Segurança:** `15/100` (Ausência de CSRF tokens, falta de assinatura de webhook e vazamento de tenants).
*   **Performance:** `60/100` (Baixa latência pelo banco em memória, mas comprometida pelo download desordenado de histórico e logs excessivos).
*   **Escalabilidade:** `30/100` (Incapaz de escalar devido a threads expostas de WebSocket de chamado único e H2 database).
*   **Qualidade de Código:** `50/100` (Legível e organizado em pastas, mas com hardcodes graves e gambiarras estruturais).
*   **DevOps:** `25/100` (Apenas PostgreSQL isolado em Compose; falta build, containers e CI/CD).
*   **Maturidade Enterprise:** `0/100` (Totalmente inaceitável para empresas reais).

---

## SEÇÃO 10 — ROADMAP PROFISSIONALIZAÇÃO

### 🔴 URGENTE (Para Apresentação da V1 e Pilotos)
1.  **Changer DDL e Banco de Dados:** Mudar o driver jdbc e url do Spring Boot para PostgreSQL em `application-dev.properties` para garantir persistência. Alterar DDL para `update`.
2.  **Remover Hardcode de Tenant no Cliente:** Substituir `String tenantId = "default"` em `ClientController.updateClient` por `TenantContext.getCurrentTenant()`.
3.  **Remover Reflexão na Mensagem:** Refatorar `handleIncomingMessage` no WebhookController para `public` ou criar uma classe `ChatService` para centralizar a lógica.

### 🟡 CURTO PRAZO (Próximas 2 Semanas)
1.  **Aspecto para Multi-Tenancy:** Criar uma anotação `@TenantFilter` ou um `@Aspect` que intercepte toda chamada a serviços e injete a habilitação do filtro no Session do EntityManager de forma imperativa.
2.  **Segurança e CSRF:** Habilitar CSRF no Spring Security ou implementar cookies HTTP com proteção adicional (SameSite=Strict) e autenticação segura no cabeçalho Authorization Bearer no lugar de Cookies no frontend.
3.  **ErrorBoundary no React:** Envolver a árvore de componentes principal em um `ErrorBoundary` para evitar blank-screens.

### 🔵 MÉDIO PRAZO (Próximo Mês)
1.  **Variáveis de Ambiente (.env):** Centralizar todas as conexões do frontend em um arquivo `.env` gerido pelo Vite.
2.  **Validação de Webhooks da Meta:** Implementar verificação criptográfica do cabeçalho `X-Hub-Signature-256`.
3.  **PM2 e Docker em Produção:** Criar arquivos `Dockerfile` individuais e unificar a infraestrutura no `docker-compose.yml` para deploy rápido na nuvem.

---

## SEÇÃO 11 — VEREDITO FINAL

*   **Esse projeto é sustentável?** Sim, desde que haja um esforço focado de refatoração nos próximos sprints. O frontend e as ideias centrais são excelentes.
*   **Pode ir para produção?** **NÃO**. De forma alguma. A falta de persistência real de dados e a falha de isolamento de tenants levariam ao colapso do sistema em poucas horas de uso.
*   **Está seguro?** **Não**. Vulnerável a invasões de conta via CSRF, spoofing de webhooks de mensagens e vazamento cruzado de dados sensíveis entre empresas.
*   **Quanto de retrabalho estrutural existe?** Cerca de **35%** da base do backend precisa ser reescrita para adotar padrões de design de mercado (Clean Architecture, AOP e DTOs reais).
*   **Áreas mais críticas:** Banco de dados/persistência, infraestrutura de multi-tenancy e validação de autenticação.
