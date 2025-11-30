# FocusFlow - QA Testing Guide

Este documento explica como executar os diferentes níveis de testes no projeto FocusFlow.

## Pirâmide de Testes

O FocusFlow utiliza uma abordagem de pirâmide de testes com os seguintes níveis:

1. **Testes Unitários e de Integração** (Base da pirâmide) - Jest + React Testing Library
2. **Testes de Componentes e E2E** (Meio da pirâmide) - Cypress
3. **Testes de Aceitação** (Topo da pirâmide) - Robot Framework

## Testes Unitários e de Integração (Jest)

### Executar todos os testes unitários:
```bash
npm run test
```

### Executar testes em modo watch:
```bash
npm run test:watch
```

### Executar testes com cobertura:
```bash
npm run test:coverage
```

### Estrutura dos testes unitários:
- Pasta: `__tests__/unit/`
- Arquivos: `*.test.ts` ou `*.test.tsx`

## Testes de Componentes e E2E (Cypress)

### Abrir o Cypress UI:
```bash
npx cypress open
```

### Executar testes de componentes em modo headless:
```bash
npx cypress run --component
```

### Executar testes E2E em modo headless:
```bash
npx cypress run --e2e
```

### Estrutura dos testes Cypress:
- Testes de componentes: `cypress/component/`
- Testes E2E: `cypress/e2e/`
- Arquivos: `*.cy.ts` ou `*.cy.tsx`

## Testes de Aceitação (Robot Framework)

### Executar testes Robot:
```bash
robot tests/robot/
```

### Executar testes Robot com output detalhado:
```bash
robot -d results tests/robot/
```

### Estrutura dos testes Robot:
- Pasta: `tests/robot/`
- Arquivos: `*.robot`

## Shift Left Testing (Husky + Lint-staged)

### Configuração automática:
O Husky está configurado para executar automaticamente os testes antes de cada commit.

### Hook de pre-commit:
- Arquivo: `.husky/pre-commit`
- Executa: `npx lint-staged`
- Configuração: `lint-staged.config.js`

### O que é executado no pre-commit:
1. ESLint para correção automática de estilo
2. Testes unitários relacionados aos arquivos modificados

## Comandos Úteis

### Executar todos os testes:
```bash
npm test && npx cypress run --component && npx cypress run --e2e
```

### Verificar cobertura de testes:
```bash
npm run test:coverage
```

### Limpar cache de testes:
```bash
jest --clearCache
```

## Estrutura de Pastas de Testes

```
project/
├── __tests__/
│   └── unit/
│       ├── date-validation.test.ts
│       └── TaskItem.test.tsx
├── cypress/
│   ├── component/
│   │   └── PomodoroTimer.cy.tsx
│   └── e2e/
│       └── login-and-create-task.cy.ts
├── tests/
│   └── robot/
│       └── parse-task-api.robot
├── .husky/
│   └── pre-commit
└── README_QA.md
```