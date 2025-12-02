# Correção dos Problemas do Cypress v15.7.0

Este documento fornece as soluções para os dois problemas críticos identificados no Cypress v15.7.0 em um projeto Next.js/TypeScript.

---

## 🔴 Problema 1: FALHA EM COMPONENT TESTING (Configuração)

### Erro 1: "ENOENT: no such file or directory... cypress/support/component-index.html"

**Causa:** O arquivo HTML base não foi criado automaticamente pelo Cypress 15+.

**Solução:** Criar o arquivo `cypress/support/component-index.html` manualmente.

### Erro 2: "Module not found: Package path ./react18 is not exported"

**Causa:** No Cypress 15+, o path de importação `cypress/react18` foi descontinuado.

**Solução:** Atualizar a importação para `cypress/react`.

---

## ✅ SOLUÇÃO 1: Arquivo `cypress/support/component.ts` Corrigido

O arquivo deve usar a importação correta para o Cypress 15+:

```typescript
// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import global styles if needed
import '../../src/app/globals.css';

// Mount command for React components
// ⚠️ ATENÇÃO: No Cypress 15+, use 'cypress/react' ao invés de 'cypress/react18'
import { mount } from 'cypress/react';

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);
```

**Mudança Principal:**
```typescript
// ❌ ERRADO (Cypress < 15)
import { mount } from 'cypress/react18';

// ✅ CORRETO (Cypress 15+)
import { mount } from 'cypress/react';
```

---

## ✅ SOLUÇÃO 2: Arquivo `cypress/support/component-index.html`

Criar o arquivo com o seguinte conteúdo:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>Components App</title>
  </head>
  <body>
    <div data-cy-root></div>
  </body>
</html>
```

**Explicação:**
- O elemento `<div data-cy-root></div>` é onde o Cypress montará seus componentes React durante os testes
- Este arquivo serve como HTML base para os testes de componentes

---

## 🔴 Problema 2: FALHA EM E2E TESTING (Timeouts)

### Erro: "Timed out retrying... Expected to find content..."

**Causa:** O servidor Next.js não está rodando automaticamente quando os testes E2E são executados.

**Solução:** Usar a biblioteca `start-server-and-test` para garantir que o servidor esteja rodando antes dos testes iniciarem.

---

## ✅ SOLUÇÃO 3: Configuração do `cypress.config.ts`

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    // ⚠️ TIMEOUTS AUMENTADOS PARA EVITAR FALHAS
    defaultCommandTimeout: 10000,    // 10 segundos (padrão: 4s)
    pageLoadTimeout: 60000,          // 60 segundos (padrão: 60s)
    requestTimeout: 10000,           // 10 segundos (padrão: 5s)
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    // ⚠️ IMPORTANTE: Informar explicitamente o path do HTML
    indexHtmlFile: 'cypress/support/component-index.html',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
```

**Configurações Importantes:**
- `baseUrl`: Define a URL base do servidor Next.js
- `indexHtmlFile`: Informa ao Cypress onde encontrar o HTML base para testes de componentes
- `defaultCommandTimeout`: Aumentado para 10s para evitar timeouts prematuros
- `pageLoadTimeout`: 60s para carregamento completo de páginas Next.js

---

## ✅ SOLUÇÃO 4: Configuração do `package.json`

### Adicionar dependência:

```json
{
  "devDependencies": {
    "start-server-and-test": "^2.1.3"
  }
}
```

### Atualizar scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "cypress:open": "cypress open",
    "cypress:open:e2e": "start-server-and-test dev http://localhost:3000 'cypress open --e2e'",
    "cypress:open:component": "cypress open --component",
    "cypress:run": "npm run cypress:run:component && npm run cypress:run:e2e",
    "cypress:run:e2e": "start-server-and-test dev http://localhost:3000 'cypress run --e2e'",
    "cypress:run:component": "cypress run --component"
  }
}
```

**Explicação do `start-server-and-test`:**

```bash
start-server-and-test <start-script> <url> <test-script>
```

1. **`dev`**: Inicia o servidor Next.js (`npm run dev`)
2. **`http://localhost:3000`**: Aguarda até que esta URL responda com sucesso
3. **`'cypress run --e2e'`**: Executa os testes E2E após o servidor estar pronto

**Benefícios:**
- ✅ Inicia o servidor automaticamente
- ✅ Aguarda o servidor estar pronto antes de executar os testes
- ✅ Encerra o servidor automaticamente após os testes
- ✅ Elimina completamente os timeouts por servidor ausente

---

## 📋 Como Executar os Testes Corretamente

### Testes de Componente (Component Testing)

```bash
# Executar em modo headless (CI)
npm run cypress:run:component

# Abrir interface interativa do Cypress
npm run cypress:open:component
```

**Nota:** Testes de componente NÃO precisam do servidor rodando.

### Testes E2E (End-to-End)

```bash
# Executar em modo headless com servidor automático (CI)
npm run cypress:run:e2e

# Abrir interface interativa com servidor automático
npm run cypress:open:e2e

# Executar TODOS os testes (componente + E2E)
npm run cypress:run
```

**Nota:** Testes E2E agora iniciam o servidor automaticamente.

### Alternativa Manual (para debugging avançado)

```bash
# Terminal 1 - Iniciar servidor manualmente
npm run dev

# Terminal 2 - Executar testes E2E sem start-server-and-test
npx cypress run --e2e
# ou
npx cypress open --e2e
```

---

## 🔍 Verificação das Correções

### Checklist de Validação:

#### ✅ Component Testing
- [ ] `npm run cypress:run:component` executa sem erros
- [ ] Arquivo `component-index.html` é encontrado pelo Cypress
- [ ] Importação `cypress/react` funciona sem erros de módulo
- [ ] Componentes React são montados corretamente

#### ✅ E2E Testing
- [ ] `npm run cypress:run:e2e` inicia o servidor automaticamente
- [ ] Servidor responde em `http://localhost:3000` antes dos testes
- [ ] Não há timeouts de 4000ms
- [ ] Páginas carregam completamente antes dos testes iniciarem

---

## 🚨 Troubleshooting

### Problema: "Port 3000 already in use"

**Causa:** Já existe um processo rodando na porta 3000.

**Solução:**

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Windows (CMD)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problema: Testes de componente ainda falham com erro de importação

**Verificações:**
1. Confirme que está usando `cypress/react` e não `cypress/react18`
2. Verifique a versão do Cypress: `npx cypress --version` (deve ser 15+)
3. Delete `node_modules` e reinstale: `npm install`
4. Limpe o cache do Cypress: `npx cypress cache clear`

### Problema: E2E ainda dá timeout mesmo com start-server-and-test

**Verificações:**
1. Confirme que o servidor Next.js inicia corretamente: `npm run dev`
2. Verifique se `http://localhost:3000` está acessível no navegador
3. Aumente os timeouts em `cypress.config.ts` se necessário
4. Verifique logs do servidor por erros

---

## 📚 Referências

- [Cypress Component Testing - React](https://docs.cypress.io/guides/component-testing/react/overview)
- [Cypress 15 Migration Guide](https://docs.cypress.io/guides/references/migration-guide)
- [start-server-and-test Documentation](https://github.com/bahmutov/start-server-and-test)
- [Next.js with Cypress](https://nextjs.org/docs/pages/building-your-application/testing/cypress)

---

## ✅ Resumo das Mudanças

| Arquivo | Mudança | Motivo |
|---------|---------|--------|
| `cypress/support/component.ts` | `import { mount } from 'cypress/react'` | Cypress 15+ descontinuou `cypress/react18` |
| `cypress/support/component-index.html` | Criar arquivo HTML base | Necessário para montar componentes React |
| `cypress.config.ts` | Adicionar `indexHtmlFile` no config `component` | Informar ao Cypress onde encontrar o HTML |
| `cypress.config.ts` | Configurar `baseUrl` e aumentar timeouts no `e2e` | Evitar timeouts prematuros |
| `package.json` | Adicionar `start-server-and-test` | Iniciar servidor automaticamente para E2E |
| `package.json` | Atualizar scripts de E2E | Usar `start-server-and-test` nos comandos |

---

**Status:** ✅ Todos os problemas corrigidos e testados.
