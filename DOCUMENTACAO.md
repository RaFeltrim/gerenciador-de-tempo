# FocusFlow - Documentação Técnica Completa

## Visão Geral do Projeto

FocusFlow é uma aplicação de gerenciamento de tempo e tarefas com inteligência artificial integrada. A aplicação transforma linguagem natural em tarefas estruturadas e integra-se perfeitamente com Google Calendar e Google Tasks.

## Índice

1. [Arquitetura](#arquitetura)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Componentes](#componentes)
5. [APIs](#apis)
6. [Bibliotecas Utilitárias](#bibliotecas-utilitárias)
7. [Testes](#testes)
8. [Segurança](#segurança)
9. [Configuração e Instalação](#configuração-e-instalação)
10. [Guia de Contribuição](#guia-de-contribuição)

---

## Arquitetura

### Diagrama de Alto Nível

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Landing   │  │  Dashboard  │  │      Components         │  │
│  │    Page     │  │    Page     │  │  - PomodoroTimer        │  │
│  └─────────────┘  └─────────────┘  │  - TaskItem             │  │
│                                    │  - Button (UI)          │  │
│                                    └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Routes (Next.js)                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ /api/auth      │  │ /api/tasks     │  │ /api/parse-task  │   │
│  │ (NextAuth.js)  │  │ (CRUD)         │  │ (NLP)            │   │
│  └────────────────┘  └────────────────┘  └──────────────────┘   │
│  ┌────────────────┐  ┌────────────────────────────────────────┐ │
│  │ /api/calendar  │  │ /api/google-tasks                      │ │
│  │ (Google Cal)   │  │ (Google Tasks API)                     │ │
│  └────────────────┘  └────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Serviços Externos                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │    Google      │  │    Google      │  │    Supabase      │   │
│  │   OAuth 2.0    │  │  Calendar API  │  │   (Database)     │   │
│  └────────────────┘  └────────────────┘  └──────────────────┘   │
│  ┌────────────────┐                                             │
│  │  Google Tasks  │                                             │
│  │     API        │                                             │
│  └────────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Autenticação**: Usuário faz login via Google OAuth
2. **Criação de Tarefa**: Texto em linguagem natural é enviado para `/api/parse-task`
3. **Processamento NLP**: API extrai título, data, prioridade, duração e padrões de recorrência
4. **Armazenamento**: Tarefa é salva no localStorage (fallback) ou Supabase
5. **Sincronização**: Opcionalmente sincroniza com Google Calendar e Tasks

---

## Stack Tecnológico

| Categoria | Tecnologia | Versão |
|-----------|-----------|--------|
| **Framework** | Next.js | 14.0.0 |
| **UI Library** | React | 18.2.0 |
| **Linguagem** | TypeScript | 5.2.2 |
| **Estilização** | Tailwind CSS | 3.3.5 |
| **Autenticação** | NextAuth.js | 4.24.13 |
| **Database** | Supabase | 2.86.0 |
| **Google APIs** | googleapis | 166.0.0 |
| **Ícones** | Lucide React | 0.555.0 |
| **Testes Unit** | Jest | 30.2.0 |
| **Testes E2E** | Cypress | 15.7.0 |
| **Testes Aceitação** | Robot Framework | - |

---

## Estrutura do Projeto

```
gerenciador-de-tempo/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/[...nextauth]/   # Autenticação
│   │   │   ├── calendar/             # Google Calendar
│   │   │   ├── google-tasks/         # Google Tasks
│   │   │   ├── parse-task/           # Processamento NLP
│   │   │   └── tasks/                # CRUD de tarefas
│   │   ├── dashboard/                # Página principal
│   │   ├── globals.css               # Estilos globais
│   │   ├── layout.tsx                # Layout root
│   │   ├── page.tsx                  # Landing page
│   │   └── providers.tsx             # Context providers
│   │
│   ├── components/                   # Componentes reutilizáveis
│   │   ├── PomodoroTimer.tsx         # Timer Pomodoro
│   │   ├── TaskItem.tsx              # Item de tarefa
│   │   └── ui/                       # Componentes UI base
│   │       └── button.tsx            # Botão reutilizável
│   │
│   └── lib/                          # Utilitários e helpers
│       ├── auth.ts                   # Configuração NextAuth
│       ├── date-validation.ts        # Validação de datas
│       ├── google-calendar.ts        # Cliente Google Calendar
│       ├── google-tasks.ts           # Cliente Google Tasks
│       ├── supabase.ts               # Cliente Supabase
│       └── task-utils.ts             # Utilitários de tarefas
│
├── __tests__/                        # Testes unitários (Jest)
│   ├── unit/                         # Testes por unidade
│   │   ├── Button.test.tsx
│   │   ├── date-validation.test.ts
│   │   ├── parse-task.test.ts
│   │   ├── PomodoroTimer.test.tsx
│   │   ├── task-utils.test.ts
│   │   └── TaskItem.test.tsx
│   └── date-validation.test.ts
│
├── cypress/                          # Testes Cypress
│   ├── component/                    # Testes de componentes
│   │   └── PomodoroTimer.cy.tsx
│   └── e2e/                          # Testes end-to-end
│       └── login-and-create-task.cy.ts
│
├── tests/                            # Testes de aceitação
│   └── robot/
│       └── parse-task-api.robot
│
├── types/                            # Definições TypeScript
│   └── next-auth.d.ts
│
└── Arquivos de Configuração
    ├── jest.config.js
    ├── jest.setup.ts
    ├── next.config.js
    ├── tailwind.config.js
    ├── tsconfig.json
    └── package.json
```

---

## Componentes

### 1. PomodoroTimer

**Localização**: `src/components/PomodoroTimer.tsx`

**Descrição**: Componente de timer baseado na técnica Pomodoro (25 minutos de foco).

**Props**:
```typescript
interface PomodoroTimerProps {
  initialTime?: number;      // Tempo inicial em segundos (padrão: 25 * 60)
  onTimerEnd?: () => void;   // Callback quando timer chega a zero
}
```

**Funcionalidades**:
- ▶️ Iniciar/Pausar contagem regressiva
- 🔄 Resetar para tempo inicial
- 📊 Exibição formatada (MM:SS)
- 🔔 Callback ao finalizar

**Exemplo de Uso**:
```tsx
<PomodoroTimer 
  initialTime={25 * 60} 
  onTimerEnd={() => alert('Pausa!')} 
/>
```

---

### 2. TaskItem

**Localização**: `src/components/TaskItem.tsx`

**Descrição**: Componente para exibição de uma tarefa individual com todas suas informações e ações.

**Props**:
```typescript
interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStartTimer?: (id: string) => void;
}
```

**Interface Task**:
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number | null;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  category?: string | null;
  tags?: string[];
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern | null;
  parentTaskId?: string | null;
}
```

**Categorias Disponíveis**:
| ID | Nome | Cor |
|----|------|-----|
| work | Trabalho | Azul |
| personal | Pessoal | Roxo |
| study | Estudo | Verde |
| health | Saúde | Vermelho |
| finance | Finanças | Âmbar |
| other | Outros | Cinza |

---

### 3. Button

**Localização**: `src/components/ui/button.tsx`

**Descrição**: Componente de botão reutilizável com variantes e tamanhos.

**Props**:
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}
```

**Variantes**:
- `default`: Botão primário com fundo colorido
- `destructive`: Vermelho para ações perigosas
- `outline`: Apenas borda
- `secondary`: Estilo secundário
- `ghost`: Transparente com hover
- `link`: Estilo de link

---

## APIs

### 1. `/api/auth/[...nextauth]`

**Métodos**: GET, POST

**Descrição**: Endpoint de autenticação via NextAuth.js com provider Google.

**Escopos OAuth**:
- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/tasks`

**Fluxo de Tokens**:
1. Usuário autoriza via Google
2. Access token e refresh token são armazenados
3. Token é renovado automaticamente quando expira

---

### 2. `/api/parse-task`

**Método**: POST

**Descrição**: Processa texto em linguagem natural e extrai informações estruturadas.

**Request Body**:
```json
{
  "taskText": "Reunião urgente amanhã às 14h, 2 horas"
}
```

**Response**:
```json
{
  "title": "Reunião",
  "description": "Reunião urgente amanhã às 14h, 2 horas",
  "dueDate": "2025-12-01T14:00:00.000Z",
  "priority": "high",
  "estimatedTime": 120,
  "isRecurring": false,
  "recurrencePattern": null
}
```

**Palavras-chave de Prioridade**:

| Alta | Média | Baixa |
|------|-------|-------|
| urgente | (padrão) | baixa prioridade |
| importante | | quando possível |
| crítico | | sem pressa |
| alta prioridade | | eventualmente |
| hoje | | opcional |
| !! | | |

**Palavras-chave de Tempo**:
- `X horas/hora/h` → X * 60 minutos
- `X minutos/minuto/min` → X minutos
- `X pomodoros/pomodoro` → X * 25 minutos

**Palavras-chave de Recorrência**:
| Padrão | Palavras-chave |
|--------|----------------|
| Diário | todo dia, diariamente, every day |
| Semanal | toda semana, semanalmente, weekly |
| Mensal | todo mês, mensalmente, monthly |
| Dias úteis | dias úteis, segunda a sexta, weekdays |

---

### 3. `/api/tasks`

**Métodos**: GET, POST, PUT, DELETE

**Descrição**: CRUD completo de tarefas com integração Supabase.

#### GET
Retorna todas as tarefas do usuário autenticado.

#### POST
```json
{
  "id": "uuid",
  "title": "Título",
  "description": "Descrição",
  "priority": "medium",
  "estimatedTime": 30,
  "dueDate": "2025-12-01T09:00:00.000Z",
  "category": "work",
  "tags": ["importante"],
  "isRecurring": false,
  "recurrencePattern": null
}
```

#### PUT
Atualiza campos específicos de uma tarefa existente.

#### DELETE
Remove uma tarefa por ID (query parameter).

---

### 4. `/api/calendar`

**Métodos**: GET, POST

**Descrição**: Integração com Google Calendar.

#### GET
Retorna próximos eventos do calendário.

**Query Params**:
- `maxResults`: Número máximo de eventos (padrão: 10)

#### POST
Cria novo evento no calendário.

**Request Body**:
```json
{
  "title": "Reunião",
  "description": "Reunião de equipe",
  "startTime": "2025-12-01T14:00:00.000Z",
  "endTime": "2025-12-01T15:00:00.000Z"
}
```

---

### 5. `/api/google-tasks`

**Métodos**: GET, POST, PUT, DELETE

**Descrição**: Integração com Google Tasks API.

#### GET
Lista tarefas do Google Tasks.

**Query Params**:
- `taskListId`: ID da lista (padrão: @default)
- `showCompleted`: Incluir concluídas (padrão: true)
- `listOnly`: Retornar apenas listas

#### POST
Cria nova tarefa no Google Tasks.

#### PUT
Atualiza status ou detalhes de uma tarefa.

#### DELETE
Remove uma tarefa.

---

## Bibliotecas Utilitárias

### 1. date-validation.ts

**Funções Exportadas**:

| Função | Descrição | Parâmetros | Retorno |
|--------|-----------|------------|---------|
| `isLeapYear(year)` | Verifica se é ano bissexto | `year: number` | `boolean` |
| `getDaysInMonth(month, year)` | Dias no mês | `month: number, year: number` | `number` |
| `isValidDate(day, month, year)` | Valida data do calendário | `day, month, year: number` | `boolean` |
| `validateDateString(dateString)` | Valida formato DD/MM/YYYY | `dateString: string` | `{ valid, day?, month?, year?, error? }` |
| `validateISODateString(isoString)` | Valida ISO date string | `isoString: string \| null` | `{ valid, error? }` |

**Validações Incluídas**:
- ❌ Datas inexistentes (31/11)
- ❌ 29 de fevereiro em anos não bissextos
- ❌ Dias negativos ou zero
- ❌ Meses fora do range 1-12
- ❌ Valores não inteiros

---

### 2. task-utils.ts

**Tipos**:
```typescript
type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'weekdays';
```

**Funções**:

| Função | Descrição |
|--------|-----------|
| `calculateNextDueDate(currentDueDate, pattern)` | Calcula próxima data para tarefas recorrentes |
| `getRecurrenceLabel(pattern)` | Retorna label em português do padrão |

**Labels de Recorrência**:
- `daily` → "Diário"
- `weekly` → "Semanal"
- `monthly` → "Mensal"
- `weekdays` → "Dias úteis"

---

### 3. supabase.ts

**Funções de Verificação**:
- `isSupabaseConfigured()`: Verifica se credenciais estão configuradas
- `getSupabaseClient()`: Retorna cliente Supabase ou null

**Operações CRUD**:
```typescript
const taskOperations = {
  getTasks(userEmail: string): Promise<DbTask[]>,
  createTask(task: Omit<DbTask, 'created_at' | 'updated_at'>): Promise<DbTask | null>,
  updateTask(id: string, userEmail: string, updates: Partial<DbTask>): Promise<DbTask | null>,
  deleteTask(id: string, userEmail: string): Promise<boolean>,
  toggleTaskCompletion(id: string, userEmail: string, completed: boolean): Promise<DbTask | null>,
  completeRecurringTask(task: DbTask): Promise<{ completedTask: DbTask | null; nextTask: DbTask | null }>
}
```

---

### 4. google-calendar.ts

**Funções**:
- `getGoogleCalendarClient(accessToken)`: Cria cliente autenticado
- `getUpcomingEvents(accessToken, maxResults)`: Lista eventos futuros
- `createEvent(accessToken, event)`: Cria evento
- `updateEvent(accessToken, eventId, event)`: Atualiza evento
- `deleteEvent(accessToken, eventId)`: Remove evento

---

### 5. google-tasks.ts

**Funções**:
- `getGoogleTasksClient(accessToken)`: Cria cliente autenticado
- `getTaskLists(accessToken)`: Lista de task lists
- `getTasks(accessToken, taskListId, showCompleted)`: Lista tarefas
- `createTask(accessToken, task, taskListId)`: Cria tarefa
- `updateTask(accessToken, taskId, updates, taskListId)`: Atualiza tarefa
- `deleteTask(accessToken, taskId, taskListId)`: Remove tarefa
- `completeTask(accessToken, taskId, taskListId)`: Marca como concluída
- `moveTask(accessToken, taskId, taskListId, previousTaskId?, parentTaskId?)`: Reordena tarefa

---

## Testes

### Estrutura de Testes

```
Pirâmide de Testes
        /\
       /  \     Aceitação (Robot Framework)
      /----\    E2E (Cypress)
     /      \   Componentes (Cypress)
    /--------\  Integração (Jest)
   /          \ Unitários (Jest)
  /__________\
```

### Testes Unitários (Jest)

**Localização**: `__tests__/unit/`

**Suites de Teste**:

| Suite | Arquivo | Testes |
|-------|---------|--------|
| Date Validation | `date-validation.test.ts` | 53 |
| Task Utils | `task-utils.test.ts` | 16 |
| PomodoroTimer | `PomodoroTimer.test.tsx` | 20 |
| TaskItem | `TaskItem.test.tsx` | 8 |
| Button | `Button.test.tsx` | 15 |
| Parse Task | `parse-task.test.ts` | 24 |

**Executar Testes**:
```bash
npm test                # Executa todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com relatório de cobertura
```

### Testes E2E (Cypress)

**Localização**: `cypress/e2e/`

**Cenários**:
- Login com Google
- Criação de tarefa
- Logout

**Executar**:
```bash
npx cypress open        # Interface gráfica
npx cypress run --e2e   # Headless
```

### Testes de Componentes (Cypress)

**Localização**: `cypress/component/`

**Componentes Testados**:
- PomodoroTimer

**Executar**:
```bash
npx cypress run --component
```

### Testes de Aceitação (Robot Framework)

**Localização**: `tests/robot/`

**Test Cases**:
- Enviar texto simples e receber dados estruturados
- Enviar tarefa com prioridade e tempo
- Enviar tarefa com data

**Executar**:
```bash
robot tests/robot/
```

---

## Segurança

### Autenticação

- OAuth 2.0 com Google
- Tokens armazenados em session (não localStorage)
- Refresh automático de tokens expirados

### Validação de Dados

- Validação de datas estrita (evita rollover do JavaScript)
- Sanitização de inputs em APIs
- Verificação de autenticação em todas as rotas protegidas

### Boas Práticas

- Variáveis de ambiente para credenciais
- HTTPS obrigatório em produção
- Headers de segurança via Next.js

---

## Configuração e Instalação

### Pré-requisitos

- Node.js v16+
- Conta Google Cloud Console
- Conta Supabase (opcional)

### Variáveis de Ambiente

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret

# Supabase (opcional)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

### Instalação

```bash
# Clone
git clone https://github.com/RaFeltrim/gerenciador-de-tempo.git
cd gerenciador-de-tempo

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start
```

---

## Guia de Contribuição

### Fluxo de Trabalho

1. Fork do repositório
2. Criar branch (`git checkout -b feature/MinhaFeature`)
3. Implementar mudanças
4. Escrever/atualizar testes
5. Executar testes (`npm test`)
6. Commit (`git commit -m 'Adiciona MinhaFeature'`)
7. Push (`git push origin feature/MinhaFeature`)
8. Abrir Pull Request

### Padrões de Código

- TypeScript strict mode
- ESLint para linting
- Prettier para formatação
- Commits semânticos

### Hooks de Pre-commit

O projeto usa Husky + lint-staged:
- Linting automático
- Testes relacionados aos arquivos modificados

---

## Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

<p align="center">
  Feito com ❤️ por Rafael Feltrim
</p>
