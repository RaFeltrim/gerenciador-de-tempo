# Plano de Testes Completo - FocusFlow

## Visão Geral

Este plano de testes detalha uma estratégia abrangente para testar todas as funcionalidades do FocusFlow, incluindo áreas que atualmente não possuem cobertura adequada. O objetivo é garantir qualidade, confiabilidade e robustez em todos os aspectos da aplicação.

## Estrutura da Pirâmide de Testes

```
        ┌─────────────┐
        │   E2E/UI    │ ← Testes manuais e automatizados de interface
        └─────────────┘
             │   │
        ┌─────────────┐
        │Integração/API│ ← Testes de APIs e integrações externas
        └─────────────┘
             │   │
        ┌─────────────┐
        │ Componentes │ ← Testes de componentes React individuais
        └─────────────┘
             │   │
        ┌─────────────┐
        │   Unidade   │ ← Testes unitários de funções e utilitários
        └─────────────┘
```

## 1. Testes de Unidade (Unit Tests)

### 1.1. Autenticação (auth.ts)

**Arquivo:** `src/lib/auth.ts`

**Casos de teste:**

- ✅ Validar configuração do provedor Google
- ✅ Verificar callback JWT com conta nova
- ✅ Verificar callback JWT com token expirado
- ✅ Verificar callback JWT com token válido
- ✅ Testar função refreshAccessToken com credenciais válidas
- ✅ Testar função refreshAccessToken com credenciais inválidas
- ✅ Verificar callback session com token válido
- ✅ Verificar callback session com token inválido

### 1.2. Calendário Google (google-calendar.ts)

**Arquivo:** `src/lib/google-calendar.ts`

**Casos de teste:**

- ✅ getUpcomingEvents com token válido retorna eventos
- ✅ getUpcomingEvents com token inválido lança erro
- ✅ createEvent com dados válidos cria evento
- ✅ createEvent com dados inválidos lança erro
- ✅ Tratamento de erros de rede
- ✅ Tratamento de timeouts

### 1.3. Tarefas Google (google-tasks.ts)

**Arquivo:** `src/lib/google-tasks.ts`

**Casos de teste:**

- ✅ getTaskLists com token válido retorna listas
- ✅ getTasks com token válido retorna tarefas
- ✅ createTask com dados válidos cria tarefa
- ✅ updateTask com dados válidos atualiza tarefa
- ✅ deleteTask remove tarefa existente
- ✅ Tratamento de erros de autenticação
- ✅ Tratamento de tarefas inexistentes

### 1.4. Supabase (supabase.ts)

**Arquivo:** `src/lib/supabase.ts`

**Casos de teste:**

- ✅ Inicialização do cliente Supabase
- ✅ insertTask com dados válidos insere no banco
- ✅ getTasks retorna tarefas do usuário
- ✅ updateTask atualiza tarefa existente
- ✅ deleteTask remove tarefa do banco
- ✅ Tratamento de erros de conexão

### 1.5. Utilitários de Tarefas (task-utils.ts)

**Arquivo:** `src/lib/task-utils.ts`

**Casos de teste adicionais:**

- ✅ calculateNextDueDate com padrão inválido retorna null
- ✅ calculateNextDueDate com data inválida lança erro
- ✅ getRecurrenceLabel com padrão desconhecido retorna string vazia
- ✅ Manipulação de fusos horários nas datas

## 2. Testes de Componentes (Component Tests)

### 2.1. Dashboard Page

**Arquivo:** `src/app/dashboard/page.tsx`

**Casos de teste:**

- ✅ Renderização correta com sessão autenticada
- ✅ Redirecionamento quando não autenticado
- ✅ Exibição do estado de carregamento
- ✅ Carregamento de tarefas locais do localStorage
- ✅ Salvamento de tarefas no localStorage
- ✅ Sincronização com Google Tasks
- ✅ Sincronização com Google Calendar
- ✅ Funcionalidade do Pomodoro Timer
- ✅ Funcionalidade do calendário mensal
- ✅ Edição de tarefas
- ✅ Criação de tarefas
- ✅ Exclusão de tarefas
- ✅ Alternância de status das tarefas
- ✅ Tratamento de erros de API

### 2.2. TaskItem Component

**Arquivo:** `src/components/TaskItem.tsx`

**Casos de teste adicionais:**

- ✅ Exibição de tarefas recorrentes com etiqueta
- ✅ Exibição de tarefas com categoria
- ✅ Exibição de tarefas com tags
- ✅ Exibição de tarefas com tempo estimado
- ✅ Formatação de datas em diferentes formatos
- ✅ Responsividade em dispositivos móveis

### 2.3. PomodoroTimer Component

**Arquivo:** `src/components/PomodoroTimer.tsx`

**Casos de teste adicionais:**

- ✅ Início automático após seleção de tarefa
- ✅ Notificações sonoras ao completar timer
- ✅ Contagem de sessões Pomodoro
- ✅ Pausa automática após período longo
- ✅ Integração com tarefas selecionadas

### 2.4. Calendar Component

**Arquivo:** `src/components/Calendar.tsx` _(assumindo que existe)_

**Casos de teste:**

- ✅ Renderização correta da grade de 6 semanas
- ✅ Destaque do dia atual
- ✅ Exibição de eventos nos dias corretos
- ✅ Navegação entre meses
- ✅ Exibição de dias de meses anteriores/próximos
- ✅ Responsividade em diferentes tamanhos de tela

## 3. Testes de Integração (Integration Tests)

### 3.1. API Routes

#### 3.1.1. Auth API

**Arquivo:** `src/app/api/auth/[...nextauth]/route.ts`

**Casos de teste:**

- ✅ Endpoint de login com Google
- ✅ Callback de autenticação
- ✅ Endpoint de logout
- ✅ Proteção de rotas não autenticadas
- ✅ Renovação automática de tokens

#### 3.1.2. Calendar API

**Arquivo:** `src/app/api/calendar/route.ts`

**Casos de teste:**

- ✅ GET /api/calendar retorna eventos futuros
- ✅ POST /api/calendar cria novo evento
- ✅ Validação de parâmetros obrigatórios
- ✅ Tratamento de erros de validação
- ✅ Limitação de resultados (maxResults)
- ✅ Proteção contra acesso não autorizado

#### 3.1.3. Google Tasks API

**Arquivo:** `src/app/api/google-tasks/route.ts`

**Casos de teste:**

- ✅ GET /api/google-tasks retorna lista de tarefas
- ✅ POST /api/google-tasks cria nova tarefa
- ✅ PUT /api/google-tasks atualiza tarefa existente
- ✅ DELETE /api/google-tasks remove tarefa
- ✅ Validação de campos obrigatórios
- ✅ Tratamento de tarefas inexistentes
- ✅ Proteção contra acesso não autorizado

#### 3.1.4. Parse Task API

**Arquivo:** `src/app/api/parse-task/route.ts`

**Casos de teste:**

- ✅ Processamento de texto simples
- ✅ Extração de prioridade (alta/média/baixa)
- ✅ Extração de tempo estimado
- ✅ Extração de datas
- ✅ Extração de padrões de recorrência
- ✅ Tratamento de entradas inválidas
- ✅ Performance com entradas longas

#### 3.1.5. Tasks API (Supabase)

**Arquivo:** `src/app/api/tasks/route.ts`

**Casos de teste:**

- ✅ GET /api/tasks retorna tarefas do usuário
- ✅ POST /api/tasks cria nova tarefa local
- ✅ PUT /api/tasks atualiza tarefa existente
- ✅ DELETE /api/tasks remove tarefa
- ✅ Filtragem por status (completas/pendentes)
- ✅ Ordenação por prioridade/data
- ✅ Proteção contra acesso não autorizado

### 3.2. Integrações Externas

#### 3.2.1. Google Calendar Integration

**Casos de teste:**

- ✅ Sincronização bidirecional de eventos
- ✅ Tratamento de conflitos de agenda
- ✅ Atualização em tempo real
- ✅ Recuperação de falhas de conexão
- ✅ Limite de requisições (rate limiting)

#### 3.2.2. Google Tasks Integration

**Casos de teste:**

- ✅ Sincronização de tarefas entre local e Google
- ✅ Mapeamento de status (completo/pendente)
- ✅ Sincronização de datas de vencimento
- ✅ Tratamento de listas de tarefas múltiplas
- ✅ Recuperação de falhas de sincronização

## 4. Testes End-to-End (E2E Tests)

### 4.1. Fluxos de Usuário

#### 4.1.1. Cadastro e Primeiro Acesso

**Casos de teste:**

- ✅ Registro via Google OAuth
- ✅ Permissões de acesso solicitadas
- ✅ Primeiro acesso ao dashboard
- ✅ Configuração inicial de preferências
- ✅ Tutorial de introdução

#### 4.1.2. Criação e Gerenciamento de Tarefas

**Casos de teste:**

- ✅ Criação de tarefa via entrada de texto natural
- ✅ Edição de tarefa existente
- ✅ Marcação de tarefa como completa
- ✅ Exclusão de tarefa
- ✅ Filtro por categorias e prioridades
- ✅ Busca textual em tarefas

#### 4.1.3. Integração com Google

**Casos de teste:**

- ✅ Conexão com Google Calendar
- ✅ Conexão com Google Tasks
- ✅ Sincronização inicial de dados
- ✅ Criação de evento/tarefa no Google
- ✅ Atualização de evento/tarefa no Google

#### 4.1.4. Pomodoro Workflow

**Casos de teste:**

- ✅ Seleção de tarefa para Pomodoro
- ✅ Início do timer Pomodoro
- ✅ Interrupção do timer
- ✅ Completar sessão Pomodoro
- ✅ Pausas curtas e longas automáticas

#### 4.1.5. Calendário Mensal

**Casos de teste:**

- ✅ Visualização mensal de tarefas
- ✅ Navegação entre meses
- ✅ Destaque de dias com eventos
- ✅ Adição de tarefa diretamente no calendário

### 4.2. Cenários de Erro

#### 4.2.1. Problemas de Rede

**Casos de teste:**

- ✅ Offline mode e cache local
- ✅ Recuperação automática de conexão
- ✅ Notificação de problemas de sincronização
- ✅ Queue de operações pendentes

#### 4.2.2. Erros de Autenticação

**Casos de teste:**

- ✅ Token expirado e renovação automática
- ✅ Logout automático após falha de autenticação
- ✅ Recuperação de sessão após reinício
- ✅ Tratamento de credenciais revogadas

#### 4.2.3. Limites de API

**Casos de teste:**

- ✅ Rate limiting do Google APIs
- ✅ Tratamento de quotas excedidas
- ✅ Retry mechanisms inteligentes
- ✅ Fallback para dados locais

## 5. Testes de Performance

### 5.1. Métricas de Performance

- ✅ Tempo de carregamento inicial < 3 segundos
- ✅ Tempo de resposta de APIs < 500ms
- ✅ Renderização de listas grandes (1000+ tarefas)
- ✅ Consumo de memória estável
- ✅ Scroll suave em listas longas

### 5.2. Testes de Carga

- ✅ Simultaneous users (100 usuários concorrentes)
- ✅ Operações repetidas (1000 operações seguidas)
- ✅ Sincronização de grandes volumes de dados
- ✅ Stress testing em condições adversas

## 6. Testes de Segurança

### 6.1. Autenticação e Autorização

- ✅ Proteção contra CSRF
- ✅ Validação de tokens JWT
- ✅ Proteção de rotas sensíveis
- ✅ Sanitização de entradas de usuário

### 6.2. Dados Sensíveis

- ✅ Criptografia de tokens em storage
- ✅ Proteção contra XSS
- ✅ Headers de segurança HTTP
- ✅ Content Security Policy

## 7. Testes de Acessibilidade (a11y)

### 7.1. Navegação por Teclado

- ✅ Todos os elementos interativos acessíveis via teclado
- ✅ Ordem lógica de tabulação
- ✅ Indicadores visuais de foco

### 7.2. Leitores de Tela

- ✅ Labels descritivas para elementos
- ✅ ARIA attributes corretamente configurados
- ✅ Anúncios de mudanças dinâmicas

### 7.3. Contraste e Legibilidade

- ✅ Contraste mínimo de 4.5:1 para texto
- ✅ Tamanhos de fonte escaláveis
- ✅ Suporte a zoom até 200%

## 8. Testes de Compatibilidade

### 8.1. Navegadores

- ✅ Chrome (última versão)
- ✅ Firefox (última versão)
- ✅ Safari (última versão)
- ✅ Edge (última versão)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

### 8.2. Dispositivos

- ✅ Desktop (1920x1080 e 4K)
- ✅ Tablet (iPad, Android tablets)
- ✅ Mobile (iPhone, Android phones)
- ✅ Modos paisagem e retrato

### 8.3. Sistemas Operacionais

- ✅ Windows 10/11
- ✅ macOS (últimas versões)
- ✅ Linux (Ubuntu, Fedora)
- ✅ iOS (últimas versões)
- ✅ Android (últimas versões)

## 9. Testes de Regressão

### 9.1. Funcionalidades Críticas

- ✅ Autenticação e sessão
- ✅ Sincronização de dados
- ✅ Criação/edição/exclusão de tarefas
- ✅ Timer Pomodoro
- ✅ Calendário mensal

### 9.2. Integrações Externas

- ✅ Google Calendar API
- ✅ Google Tasks API
- ✅ Supabase database operations

## 10. Cronograma de Implementação

### Fase 1: Testes de Unidade (Semana 1-2)

- Implementar testes unitários para bibliotecas faltantes
- Aumentar cobertura de código para 80%+

### Fase 2: Testes de Componentes (Semana 2-3)

- Criar testes para componentes faltantes
- Expandir testes existentes com casos edge

### Fase 3: Testes de Integração (Semana 3-4)

- Implementar testes de APIs
- Criar mocks para serviços externos

### Fase 4: Testes E2E (Semana 4-5)

- Desenvolver cenários de usuário completo
- Implementar testes de erro e recuperação

### Fase 5: Testes Especializados (Semana 5-6)

- Performance testing
- Security testing
- Accessibility testing
- Cross-browser compatibility

## 11. Métricas de Sucesso

### 11.1. Cobertura de Código

- ✅ 85%+ de cobertura geral
- ✅ 90%+ para componentes críticos
- ✅ 80%+ para APIs
- ✅ 100% para utilitários

### 11.2. Qualidade de Testes

- ✅ 0 testes flaky
- ✅ Tempo de execução < 10 minutos
- ✅ Relatórios claros de falhas
- ✅ Fácil manutenção dos testes

### 11.3. Performance

- ✅ Build time < 5 minutos
- ✅ Deploy time < 2 minutos
- ✅ Tempo de resposta médio < 300ms

## 12. Ferramentas e Infraestrutura

### 12.1. Stack de Testes

- **Unit Testing:** Jest + React Testing Library
- **Component Testing:** Cypress Component Testing
- **E2E Testing:** Cypress E2E
- **API Testing:** Jest + Supertest
- **Performance:** Lighthouse, WebPageTest
- **Security:** OWASP ZAP, Snyk
- **Accessibility:** axe-core, pa11y

### 12.2. CI/CD Pipeline

- ✅ Execução automática de todos os testes em PRs
- ✅ Bloqueio de deploy em falhas de testes
- ✅ Geração automática de relatórios de cobertura
- ✅ Notificações de status em canais Slack/Discord

### 12.3. Monitoramento Contínuo

- ✅ Tracking de métricas de performance em produção
- ✅ Alertas para regressões de performance
- ✅ Monitoramento de erros em tempo real
- ✅ Feedback loop com usuários reais

---

_Documento criado em Novembro 2025_
