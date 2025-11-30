# FocusFlow - Documentação de APIs

Este documento detalha todas as APIs REST do projeto FocusFlow.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
   - [/api/auth](#apiauth)
   - [/api/parse-task](#apiparse-task)
   - [/api/tasks](#apitasks)
   - [/api/calendar](#apicalendar)
   - [/api/google-tasks](#apigoogle-tasks)
4. [Códigos de Erro](#códigos-de-erro)
5. [Exemplos](#exemplos)

---

## Visão Geral

**Base URL**: `http://localhost:3000` (desenvolvimento)

**Formato**: JSON

**Autenticação**: OAuth 2.0 via Google (NextAuth.js)

### Headers Padrão

```http
Content-Type: application/json
```

Para endpoints autenticados, o session cookie do NextAuth é utilizado automaticamente.

---

## Autenticação

O FocusFlow usa NextAuth.js com Google OAuth Provider.

### Escopos OAuth Necessários

```
openid
email
profile
https://www.googleapis.com/auth/calendar
https://www.googleapis.com/auth/tasks
```

### Fluxo de Autenticação

1. Usuário clica em "Entrar com Google"
2. Redirecionamento para Google OAuth
3. Autorização dos escopos
4. Callback para `/api/auth/callback/google`
5. Sessão criada com tokens

### Tokens

| Token | Descrição | Uso |
|-------|-----------|-----|
| Access Token | Token de curta duração | Chamadas às APIs Google |
| Refresh Token | Token de renovação | Renovar access token |
| Session Token | Cookie de sessão | Autenticar no FocusFlow |

---

## Endpoints

### /api/auth

**Path**: `/api/auth/[...nextauth]`

#### GET /api/auth/session

Retorna a sessão atual do usuário.

**Response 200**:
```json
{
  "user": {
    "name": "João Silva",
    "email": "joao@example.com",
    "image": "https://..."
  },
  "accessToken": "ya29.a0...",
  "refreshToken": "1//...",
  "expiresAt": 1735689600
}
```

#### GET /api/auth/signin

Página de login.

#### GET /api/auth/signout

Página de logout.

#### POST /api/auth/callback/google

Callback do OAuth Google.

---

### /api/parse-task

**Descrição**: Processa texto em linguagem natural e extrai informações estruturadas para criação de tarefas.

#### POST /api/parse-task

**Request**:
```json
{
  "taskText": "Reunião urgente amanhã às 14h com equipe, 2 horas"
}
```

**Response 200**:
```json
{
  "title": "Reunião com equipe",
  "description": "Reunião urgente amanhã às 14h com equipe, 2 horas",
  "dueDate": "2025-12-01T14:00:00.000Z",
  "priority": "high",
  "estimatedTime": 120,
  "isRecurring": false,
  "recurrencePattern": null
}
```

**Response 400** (Input inválido):
```json
{
  "error": "Task text is required"
}
```

#### Lógica de Parsing

**Extração de Prioridade**:

| Entrada | Resultado |
|---------|-----------|
| "urgente", "importante", "crítico" | `high` |
| "alta prioridade", "!!" | `high` |
| "hoje", "agora" | `high` |
| "baixa prioridade", "quando possível" | `low` |
| "sem pressa", "eventualmente" | `low` |
| (outros) | `medium` |

**Extração de Data**:

| Padrão | Exemplo | Resultado |
|--------|---------|-----------|
| "hoje" | "Reunião hoje" | Data atual |
| "amanhã" | "Entregar amanhã" | Data + 1 dia |
| Dia da semana | "segunda" | Próxima segunda |
| DD/MM | "15/12" | 15 de dezembro |
| DD/MM/YYYY | "15/12/2025" | 15/12/2025 |
| "dia X" | "dia 15" | Dia 15 do mês atual/próximo |

**Extração de Tempo**:

| Padrão | Exemplo | Resultado |
|--------|---------|-----------|
| X horas | "2 horas" | 120 min |
| X minutos | "30 minutos" | 30 min |
| X pomodoros | "2 pomodoros" | 50 min |
| reunião | implícito | 60 min |
| call | implícito | 30 min |
| email | implícito | 15 min |

**Extração de Recorrência**:

| Padrão | Palavras-chave | Pattern |
|--------|----------------|---------|
| Diário | "todo dia", "diariamente" | `daily` |
| Semanal | "toda semana", "semanalmente" | `weekly` |
| Mensal | "todo mês", "mensalmente" | `monthly` |
| Dias úteis | "dias úteis", "segunda a sexta" | `weekdays` |

---

### /api/tasks

**Descrição**: CRUD completo de tarefas com armazenamento em Supabase.

#### GET /api/tasks

Lista todas as tarefas do usuário autenticado.

**Response 200**:
```json
{
  "tasks": [
    {
      "id": "uuid",
      "user_email": "joao@example.com",
      "title": "Reunião",
      "description": "Reunião de equipe",
      "priority": "high",
      "estimated_time": 60,
      "due_date": "2025-12-01T14:00:00.000Z",
      "completed": false,
      "category": "work",
      "tags": ["importante"],
      "is_recurring": false,
      "recurrence_pattern": null,
      "parent_task_id": null,
      "created_at": "2025-11-30T10:00:00.000Z",
      "updated_at": "2025-11-30T10:00:00.000Z"
    }
  ]
}
```

**Response 200** (Supabase não configurado):
```json
{
  "tasks": [],
  "message": "Supabase not configured - tasks are stored locally"
}
```

**Response 401** (Não autenticado):
```json
{
  "error": "Unauthorized"
}
```

#### POST /api/tasks

Cria uma nova tarefa.

**Request**:
```json
{
  "id": "uuid",
  "title": "Nova tarefa",
  "description": "Descrição da tarefa",
  "priority": "medium",
  "estimatedTime": 30,
  "dueDate": "2025-12-01T09:00:00.000Z",
  "category": "work",
  "tags": ["projeto"],
  "isRecurring": false,
  "recurrencePattern": null
}
```

**Response 201**:
```json
{
  "task": {
    "id": "uuid",
    "user_email": "joao@example.com",
    "title": "Nova tarefa",
    "...": "..."
  }
}
```

**Response 400** (Título obrigatório):
```json
{
  "error": "Title is required"
}
```

**Response 400** (Data inválida):
```json
{
  "error": "A data inserida não existe no calendário (ex: 31 de Novembro)."
}
```

#### PUT /api/tasks

Atualiza uma tarefa existente.

**Request**:
```json
{
  "id": "uuid",
  "title": "Título atualizado",
  "priority": "high",
  "completed": true
}
```

**Response 200**:
```json
{
  "task": {
    "id": "uuid",
    "...": "..."
  }
}
```

**Response 400** (ID obrigatório):
```json
{
  "error": "Task ID is required"
}
```

#### DELETE /api/tasks

Remove uma tarefa.

**Query Parameters**:
- `id` (required): ID da tarefa

**Request**: `DELETE /api/tasks?id=uuid`

**Response 200**:
```json
{
  "success": true
}
```

---

### /api/calendar

**Descrição**: Integração com Google Calendar API.

#### GET /api/calendar

Lista eventos futuros do calendário.

**Query Parameters**:
- `maxResults` (optional): Máximo de eventos (padrão: 10)

**Request**: `GET /api/calendar?maxResults=20`

**Response 200**:
```json
{
  "events": [
    {
      "id": "event123",
      "summary": "Reunião de equipe",
      "description": "Sprint planning",
      "start": {
        "dateTime": "2025-12-01T14:00:00-03:00"
      },
      "end": {
        "dateTime": "2025-12-01T15:00:00-03:00"
      }
    }
  ]
}
```

**Response 401** (Não autenticado):
```json
{
  "error": "Unauthorized"
}
```

#### POST /api/calendar

Cria um novo evento no calendário.

**Request**:
```json
{
  "title": "Reunião importante",
  "description": "Discutir projeto",
  "startTime": "2025-12-01T14:00:00.000Z",
  "endTime": "2025-12-01T15:00:00.000Z"
}
```

**Response 201**:
```json
{
  "event": {
    "id": "event456",
    "summary": "Reunião importante",
    "...": "..."
  }
}
```

**Response 400** (Campos obrigatórios):
```json
{
  "error": "Missing required fields"
}
```

---

### /api/google-tasks

**Descrição**: Integração com Google Tasks API.

#### GET /api/google-tasks

Lista tarefas do Google Tasks.

**Query Parameters**:
- `taskListId` (optional): ID da lista (padrão: @default)
- `showCompleted` (optional): Incluir concluídas (padrão: true)
- `listOnly` (optional): Retornar apenas listas de tarefas (padrão: false)

**Request**: `GET /api/google-tasks?showCompleted=false`

**Response 200** (tarefas):
```json
{
  "tasks": [
    {
      "id": "task123",
      "title": "Comprar pão",
      "notes": "Padaria do João",
      "due": "2025-12-01T12:00:00.000Z",
      "status": "needsAction",
      "updated": "2025-11-30T10:00:00.000Z"
    }
  ]
}
```

**Response 200** (listas):
```json
{
  "taskLists": [
    {
      "id": "list123",
      "title": "Minhas Tarefas"
    }
  ]
}
```

#### POST /api/google-tasks

Cria uma nova tarefa no Google Tasks.

**Request**:
```json
{
  "title": "Nova tarefa",
  "notes": "Descrição opcional",
  "due": "2025-12-01T09:00:00.000Z",
  "taskListId": "@default"
}
```

**Response 201**:
```json
{
  "task": {
    "id": "task456",
    "title": "Nova tarefa",
    "...": "..."
  }
}
```

**Response 400** (Título obrigatório):
```json
{
  "error": "Title is required"
}
```

#### PUT /api/google-tasks

Atualiza uma tarefa existente.

**Request**:
```json
{
  "taskId": "task123",
  "taskListId": "@default",
  "title": "Título atualizado",
  "status": "completed"
}
```

**Response 200**:
```json
{
  "task": {
    "id": "task123",
    "title": "Título atualizado",
    "status": "completed",
    "...": "..."
  }
}
```

**Response 400** (TaskId obrigatório):
```json
{
  "error": "Task ID is required"
}
```

#### DELETE /api/google-tasks

Remove uma tarefa.

**Query Parameters**:
- `taskId` (required): ID da tarefa
- `taskListId` (optional): ID da lista (padrão: @default)

**Request**: `DELETE /api/google-tasks?taskId=task123`

**Response 200**:
```json
{
  "success": true
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Requisição inválida (dados faltando/incorretos) |
| 401 | Não autenticado |
| 403 | Acesso negado |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |
| 503 | Serviço indisponível (Supabase não configurado) |

### Formato de Erro

```json
{
  "error": "Mensagem descritiva do erro"
}
```

---

## Exemplos

### Fluxo Completo de Criação de Tarefa

```javascript
// 1. Fazer parsing do texto
const parseResponse = await fetch('/api/parse-task', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskText: 'Reunião importante amanhã às 14h, 2 horas'
  })
});
const parsedTask = await parseResponse.json();
// { title: "Reunião", dueDate: "...", priority: "high", estimatedTime: 120 }

// 2. Criar tarefa local
const taskResponse = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: crypto.randomUUID(),
    ...parsedTask,
    category: 'work',
    tags: ['importante']
  })
});
const task = await taskResponse.json();

// 3. Criar evento no calendário (se tiver dueDate)
if (parsedTask.dueDate) {
  const startTime = new Date(parsedTask.dueDate);
  const endTime = new Date(startTime.getTime() + parsedTask.estimatedTime * 60000);
  
  await fetch('/api/calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: parsedTask.title,
      description: parsedTask.description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })
  });
}

// 4. Criar tarefa no Google Tasks
await fetch('/api/google-tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: parsedTask.title,
    notes: parsedTask.description,
    due: parsedTask.dueDate
  })
});
```

### Marcar Tarefa como Concluída

```javascript
// Local
await fetch('/api/tasks', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: taskId,
    completed: true
  })
});

// Google Tasks
await fetch('/api/google-tasks', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskId: googleTaskId,
    status: 'completed'
  })
});
```

### Sincronizar Dados

```javascript
// Buscar todos os dados
const [tasksRes, eventsRes, googleTasksRes] = await Promise.all([
  fetch('/api/tasks'),
  fetch('/api/calendar?maxResults=20'),
  fetch('/api/google-tasks')
]);

const { tasks } = await tasksRes.json();
const { events } = await eventsRes.json();
const { tasks: googleTasks } = await googleTasksRes.json();
```

---

## Rate Limits

As APIs do Google têm limites de requisições:

| API | Limite Diário | Limite por 100s |
|-----|---------------|-----------------|
| Calendar | 1,000,000 | 500 |
| Tasks | 50,000 | 500 |

O FocusFlow não implementa rate limiting adicional, mas é recomendado evitar requisições excessivas.

---

## Segurança

### Validações Implementadas

1. **Autenticação**: Todas as rotas (exceto `/api/parse-task`) requerem sessão válida
2. **Validação de datas**: Datas inválidas são rejeitadas (ex: 31/11)
3. **Escopo de usuário**: Tarefas são filtradas por `user_email`
4. **Sanitização**: Inputs são tratados antes de uso

### Headers de Segurança

O Next.js adiciona automaticamente:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block

---

*Documentação da API FocusFlow - Versão 0.1.0*
