# Implementação dos Testes - FocusFlow

## Estratégia de Implementação

Este documento detalha a implementação prática dos testes identificados no plano completo, com foco em criar cobertura para áreas atualmente sem testes.

## 1. Testes Unitários para Bibliotecas de Integração

### 1.1. Testes para Autenticação (auth.test.ts)

**Arquivo:** `__tests__/unit/auth.test.ts`

```typescript
/**
 * Auth Library Test Suite
 * Tests for NextAuth configuration and token management
 */

import { authOptions } from "../../src/lib/auth";

describe("Auth Library", () => {
  describe("Configuration", () => {
    it("should configure Google provider correctly", () => {
      expect(authOptions.providers).toHaveLength(1);
      expect(authOptions.providers[0].id).toBe("google");
    });

    it("should have proper callbacks configured", () => {
      expect(authOptions.callbacks).toBeDefined();
      expect(authOptions.callbacks.jwt).toBeDefined();
      expect(authOptions.callbacks.session).toBeDefined();
    });
  });

  describe("Token Management", () => {
    it("should handle initial sign in", async () => {
      const account = {
        access_token: "test-token",
        refresh_token: "test-refresh",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const token = await (authOptions.callbacks.jwt as Function)({
        token: {},
        account,
      });

      expect(token.accessToken).toBe(account.access_token);
      expect(token.refreshToken).toBe(account.refresh_token);
      expect(token.expiresAt).toBe(account.expires_at);
    });

    it("should return existing token if not expired", async () => {
      const existingToken = {
        accessToken: "existing-token",
        refreshToken: "existing-refresh",
        expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      const token = await (authOptions.callbacks.jwt as Function)({
        token: existingToken,
      });

      expect(token).toEqual(existingToken);
    });
  });
});
```

### 1.2. Testes para Google Calendar (google-calendar.test.ts)

**Arquivo:** `__tests__/unit/google-calendar.test.ts`

```typescript
/**
 * Google Calendar Library Test Suite
 * Tests for Google Calendar API integration
 */

import { getUpcomingEvents, createEvent } from "../../src/lib/google-calendar";

// Mock the googleapis library
jest.mock("googleapis", () => ({
  google: {
    calendar: () => ({
      events: {
        list: jest.fn(),
        insert: jest.fn(),
      },
    }),
  },
}));

describe("Google Calendar Library", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUpcomingEvents", () => {
    it("should fetch upcoming events with valid token", async () => {
      const mockEvents = [
        {
          id: "1",
          summary: "Test Event",
          start: { dateTime: "2025-12-01T10:00:00Z" },
        },
      ];

      const mockCalendar = {
        events: {
          list: jest.fn().mockResolvedValue({ data: { items: mockEvents } }),
        },
      };

      // Mock the google.calendar() factory
      const { google } = require("googleapis");
      (google.calendar as jest.Mock) = jest.fn(() => mockCalendar);

      const result = await getUpcomingEvents("valid-token", 10);

      expect(result).toEqual(mockEvents);
      expect(mockCalendar.events.list).toHaveBeenCalledWith({
        calendarId: "primary",
        timeMin: expect.any(String),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });
    });

    it("should handle API errors gracefully", async () => {
      const mockCalendar = {
        events: {
          list: jest.fn().mockRejectedValue(new Error("API Error")),
        },
      };

      const { google } = require("googleapis");
      (google.calendar as jest.Mock) = jest.fn(() => mockCalendar);

      await expect(getUpcomingEvents("invalid-token", 10)).rejects.toThrow(
        "API Error",
      );
    });
  });

  describe("createEvent", () => {
    it("should create event with valid data", async () => {
      const eventData = {
        summary: "New Event",
        description: "Test Description",
        start: { dateTime: "2025-12-01T10:00:00Z" },
        end: { dateTime: "2025-12-01T11:00:00Z" },
      };

      const mockCreatedEvent = { id: "new-event-id", ...eventData };
      const mockCalendar = {
        events: {
          insert: jest.fn().mockResolvedValue({ data: mockCreatedEvent }),
        },
      };

      const { google } = require("googleapis");
      (google.calendar as jest.Mock) = jest.fn(() => mockCalendar);

      const result = await createEvent("valid-token", eventData);

      expect(result).toEqual(mockCreatedEvent);
      expect(mockCalendar.events.insert).toHaveBeenCalledWith({
        calendarId: "primary",
        requestBody: eventData,
      });
    });
  });
});
```

### 1.3. Testes para Google Tasks (google-tasks.test.ts)

**Arquivo:** `__tests__/unit/google-tasks.test.ts`

```typescript
/**
 * Google Tasks Library Test Suite
 * Tests for Google Tasks API integration
 */

import {
  getTaskLists,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../../src/lib/google-tasks";

// Mock the googleapis library
jest.mock("googleapis", () => ({
  google: {
    tasks: () => ({
      tasklists: {
        list: jest.fn(),
      },
      tasks: {
        list: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }),
  },
}));

describe("Google Tasks Library", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getTaskLists", () => {
    it("should fetch task lists with valid token", async () => {
      const mockTaskLists = [
        { id: "list1", title: "My Tasks" },
        { id: "list2", title: "Work Tasks" },
      ];

      const mockTasks = {
        tasklists: {
          list: jest.fn().mockResolvedValue({ data: { items: mockTaskLists } }),
        },
      };

      const { google } = require("googleapis");
      (google.tasks as jest.Mock) = jest.fn(() => mockTasks);

      const result = await getTaskLists("valid-token");

      expect(result).toEqual(mockTaskLists);
      expect(mockTasks.tasklists.list).toHaveBeenCalled();
    });
  });

  describe("getTasks", () => {
    it("should fetch tasks with valid token", async () => {
      const mockTasks = [
        { id: "task1", title: "Complete project", status: "needsAction" },
        { id: "task2", title: "Review code", status: "completed" },
      ];

      const mockTasksApi = {
        tasks: {
          list: jest.fn().mockResolvedValue({ data: { items: mockTasks } }),
        },
      };

      const { google } = require("googleapis");
      (google.tasks as jest.Mock) = jest.fn(() => mockTasksApi);

      const result = await getTasks("valid-token", "@default", true);

      expect(result).toEqual(mockTasks);
      expect(mockTasksApi.tasks.list).toHaveBeenCalledWith({
        tasklist: "@default",
        showCompleted: true,
      });
    });
  });

  describe("createTask", () => {
    it("should create task with valid data", async () => {
      const taskData = {
        title: "New Task",
        notes: "Task description",
        due: "2025-12-01",
      };

      const mockCreatedTask = {
        id: "new-task-id",
        ...taskData,
        status: "needsAction",
      };
      const mockTasksApi = {
        tasks: {
          insert: jest.fn().mockResolvedValue({ data: mockCreatedTask }),
        },
      };

      const { google } = require("googleapis");
      (google.tasks as jest.Mock) = jest.fn(() => mockTasksApi);

      const result = await createTask("valid-token", taskData);

      expect(result).toEqual(mockCreatedTask);
      expect(mockTasksApi.tasks.insert).toHaveBeenCalledWith({
        tasklist: "@default",
        requestBody: taskData,
      });
    });
  });

  describe("updateTask", () => {
    it("should update existing task", async () => {
      const taskId = "task1";
      const updates = { status: "completed" };

      const mockUpdatedTask = {
        id: taskId,
        title: "Task",
        status: "completed",
      };
      const mockTasksApi = {
        tasks: {
          update: jest.fn().mockResolvedValue({ data: mockUpdatedTask }),
        },
      };

      const { google } = require("googleapis");
      (google.tasks as jest.Mock) = jest.fn(() => mockTasksApi);

      const result = await updateTask("valid-token", taskId, updates);

      expect(result).toEqual(mockUpdatedTask);
      expect(mockTasksApi.tasks.update).toHaveBeenCalledWith({
        tasklist: "@default",
        task: taskId,
        requestBody: updates,
      });
    });
  });

  describe("deleteTask", () => {
    it("should delete existing task", async () => {
      const taskId = "task1";
      const mockTasksApi = {
        tasks: {
          delete: jest.fn().mockResolvedValue({}),
        },
      };

      const { google } = require("googleapis");
      (google.tasks as jest.Mock) = jest.fn(() => mockTasksApi);

      await expect(deleteTask("valid-token", taskId)).resolves.not.toThrow();
      expect(mockTasksApi.tasks.delete).toHaveBeenCalledWith({
        tasklist: "@default",
        task: taskId,
      });
    });
  });
});
```

## 2. Testes de Componentes Adicionais

### 2.1. Testes para o Dashboard Component

**Arquivo:** `__tests__/unit/Dashboard.test.tsx`

```typescript
/**
 * Dashboard Component Test Suite
 * Tests for the main dashboard functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import Dashboard from '../../src/app/dashboard/page';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn()
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn()
  })
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  LogOut: () => <div data-testid="logout-icon">Logout</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  // ... outros ícones
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Authentication States', () => {
    it('should show loading state when session is loading', () => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'loading'
      });

      render(<Dashboard />);

      expect(screen.getByText('Carregando...')).toBeInTheDocument();
    });

    it('should redirect when unauthenticated', () => {
      const mockPush = jest.fn();
      jest.spyOn(require('next/navigation'), 'useRouter').mockImplementation(() => ({
        push: mockPush
      }));

      (useSession as jest.Mock).mockReturnValue({
        data: null,
        status: 'unauthenticated'
      });

      render(<Dashboard />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should render dashboard when authenticated', async () => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            name: 'Test User',
            email: 'test@example.com',
            image: 'test-image-url'
          },
          accessToken: 'test-token'
        },
        status: 'authenticated'
      });

      render(<Dashboard />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('FocusFlow')).toBeInTheDocument();
      });

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('Task Management', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: { name: 'Test User', email: 'test@example.com' },
          accessToken: 'test-token'
        },
        status: 'authenticated'
      });
    });

    it('should display task statistics', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Tarefas Locais')).toBeInTheDocument();
        expect(screen.getByText('Concluídas')).toBeInTheDocument();
        expect(screen.getByText('Google Tasks')).toBeInTheDocument();
        expect(screen.getByText('Eventos')).toBeInTheDocument();
      });
    });

    it('should render task creation form', async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ex: Reunião com cliente/i)).toBeInTheDocument();
        expect(screen.getByText('Nova Tarefa')).toBeInTheDocument();
      });
    });
  });
});
```

## 3. Testes de Integração para APIs

### 3.1. Testes para Calendar API Route

**Arquivo:** `__tests__/integration/calendar-api.test.ts`

```typescript
/**
 * Calendar API Integration Test Suite
 * Tests for /api/calendar endpoints
 */

import { createMocks } from "node-mocks-http";
import { GET, POST } from "../../src/app/api/calendar/route";
import { getServerSession } from "next-auth";

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock google-calendar library
jest.mock("../../src/lib/google-calendar", () => ({
  getUpcomingEvents: jest.fn(),
  createEvent: jest.fn(),
}));

describe("Calendar API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/calendar", () => {
    it("should return 401 when not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "GET",
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: "Unauthorized" });
    });

    it("should return events when authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const mockEvents = [{ id: "1", summary: "Test Event" }];

      const { getUpcomingEvents } = require("../../src/lib/google-calendar");
      (getUpcomingEvents as jest.Mock).mockResolvedValue(mockEvents);

      const { req, res } = createMocks({
        method: "GET",
        query: { maxResults: "10" },
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ events: mockEvents });
    });

    it("should handle API errors gracefully", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const { getUpcomingEvents } = require("../../src/lib/google-calendar");
      (getUpcomingEvents as jest.Mock).mockRejectedValue(
        new Error("API Error"),
      );

      const { req, res } = createMocks({
        method: "GET",
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Failed to fetch events",
      });
    });
  });

  describe("POST /api/calendar", () => {
    it("should return 401 when not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "POST",
        body: {
          title: "Test Event",
          startTime: "2025-12-01T10:00:00Z",
          endTime: "2025-12-01T11:00:00Z",
        },
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: "Unauthorized" });
    });

    it("should create event when authenticated with valid data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const mockEvent = { id: "new-event", summary: "Test Event" };
      const { createEvent } = require("../../src/lib/google-calendar");
      (createEvent as jest.Mock).mockResolvedValue(mockEvent);

      const { req, res } = createMocks({
        method: "POST",
        body: {
          title: "Test Event",
          description: "Test Description",
          startTime: "2025-12-01T10:00:00Z",
          endTime: "2025-12-01T11:00:00Z",
        },
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({ event: mockEvent });
    });

    it("should return 400 for missing required fields", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const { req, res } = createMocks({
        method: "POST",
        body: {
          // Missing title
          startTime: "2025-12-01T10:00:00Z",
          endTime: "2025-12-01T11:00:00Z",
        },
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing required fields",
      });
    });
  });
});
```

### 3.2. Testes para Google Tasks API Route

**Arquivo:** `__tests__/integration/google-tasks-api.test.ts`

```typescript
/**
 * Google Tasks API Integration Test Suite
 * Tests for /api/google-tasks endpoints
 */

import { createMocks } from "node-mocks-http";
import { GET, POST, PUT, DELETE } from "../../src/app/api/google-tasks/route";
import { getServerSession } from "next-auth";

// Mock next-auth
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock google-tasks library
jest.mock("../../src/lib/google-tasks", () => ({
  getTaskLists: jest.fn(),
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe("Google Tasks API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/google-tasks", () => {
    it("should return 401 when not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "GET",
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: "Unauthorized" });
    });

    it("should return tasks when authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const mockTasks = [
        { id: "1", title: "Test Task", status: "needsAction" },
      ];

      const { getTasks } = require("../../src/lib/google-tasks");
      (getTasks as jest.Mock).mockResolvedValue(mockTasks);

      const { req, res } = createMocks({
        method: "GET",
      });

      await GET(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ tasks: mockTasks });
    });
  });

  describe("POST /api/google-tasks", () => {
    it("should return 401 when not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "POST",
        body: { title: "New Task" },
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: "Unauthorized" });
    });

    it("should create task when authenticated with valid data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const mockTask = {
        id: "new-task",
        title: "New Task",
        status: "needsAction",
      };
      const { createTask } = require("../../src/lib/google-tasks");
      (createTask as jest.Mock).mockResolvedValue(mockTask);

      const { req, res } = createMocks({
        method: "POST",
        body: {
          title: "New Task",
          notes: "Task description",
          due: "2025-12-01",
        },
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({ task: mockTask });
    });

    it("should return 400 for missing title", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const { req, res } = createMocks({
        method: "POST",
        body: {
          // Missing title
          notes: "Task description",
        },
      });

      await POST(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Title is required",
      });
    });
  });

  describe("PUT /api/google-tasks", () => {
    it("should return 401 when not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "PUT",
        body: { taskId: "task1", status: "completed" },
      });

      await PUT(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: "Unauthorized" });
    });

    it("should update task when authenticated with valid data", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const mockTask = {
        id: "task1",
        title: "Updated Task",
        status: "completed",
      };
      const { updateTask } = require("../../src/lib/google-tasks");
      (updateTask as jest.Mock).mockResolvedValue(mockTask);

      const { req, res } = createMocks({
        method: "PUT",
        body: {
          taskId: "task1",
          status: "completed",
        },
      });

      await PUT(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ task: mockTask });
    });

    it("should return 400 for missing taskId", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const { req, res } = createMocks({
        method: "PUT",
        body: {
          // Missing taskId
          status: "completed",
        },
      });

      await PUT(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Task ID is required",
      });
    });
  });

  describe("DELETE /api/google-tasks", () => {
    it("should return 401 when not authenticated", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: "DELETE",
        query: { taskId: "task1" },
      });

      await DELETE(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({ error: "Unauthorized" });
    });

    it("should delete task when authenticated with valid taskId", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const { deleteTask } = require("../../src/lib/google-tasks");
      (deleteTask as jest.Mock).mockResolvedValue(undefined);

      const { req, res } = createMocks({
        method: "DELETE",
        query: { taskId: "task1" },
      });

      await DELETE(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ success: true });
    });

    it("should return 400 for missing taskId", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        accessToken: "valid-token",
      });

      const { req, res } = createMocks({
        method: "DELETE",
        query: {
          // Missing taskId
        },
      });

      await DELETE(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Task ID is required",
      });
    });
  });
});
```

## 4. Estrutura de Diretórios para Testes

```
__tests__/
├── unit/
│   ├── auth.test.ts
│   ├── google-calendar.test.ts
│   ├── google-tasks.test.ts
│   ├── supabase.test.ts
│   ├── Dashboard.test.tsx
│   └── ... (testes existentes)
├── integration/
│   ├── calendar-api.test.ts
│   ├── google-tasks-api.test.ts
│   ├── parse-task-api.test.ts
│   └── tasks-api.test.ts
└── e2e/
    ├── auth-flow.cy.ts
    ├── task-management.cy.ts
    ├── google-integration.cy.ts
    └── pomodoro-workflow.cy.ts
```

## 5. Configuração Adicional Necessária

### 5.1. Atualização do jest.config.js

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapping: {
    "^@/components/(.*)$": "<rootDir>/src/components/$1",
    "^@/lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@/app/(.*)$": "<rootDir>/src/app/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/app/providers.tsx",
  ],
  testMatch: [
    "<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
};
```

### 5.2. Dependências Adicionais

Adicionar ao `package.json`:

```json
{
  "devDependencies": {
    "node-mocks-http": "^1.15.0",
    "supertest": "^7.0.0"
  }
}
```

## 6. Scripts de Teste Adicionais

Atualizar `package.json`:

```json
{
  "scripts": {
    "test:unit": "jest __tests__/unit",
    "test:integration": "jest __tests__/integration",
    "test:e2e": "cypress run --e2e",
    "test:component": "cypress run --component",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:component",
    "test:ci": "npm run test:all && npm run test:e2e"
  }
}
```

## 7. Próximos Passos

1. **Implementar testes unitários primeiro** - Começar com as bibliotecas de integração
2. **Criar testes de componentes** - Focar no Dashboard e componentes principais
3. **Desenvolver testes de integração** - Validar as APIs com mocks
4. **Configurar testes E2E** - Automatizar fluxos completos de usuário
5. **Monitorar cobertura** - Garantir que novas funcionalidades tenham testes

Esta implementação fornecerá uma cobertura abrangente que vai além do que atualmente existe no projeto.
