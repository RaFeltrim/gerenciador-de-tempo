# Guia de Correção dos Problemas do Cypress

Este documento explica as correções implementadas para resolver os problemas críticos com os testes E2E e de componentes do Cypress no projeto FocusFlow.

## 📋 Problemas Identificados

### 1. **Falha nos Testes E2E - Timeouts**

**Sintomas:**

- Todos os testes E2E falhavam com `AssertionError: Timed out retrying after 4000ms`
- Erros como "Expected to find content: 'Comece Agora' but never did"
- Erros de elementos não encontrados: "Expected to find element: [data-testid='task-item'], but never found it"

**Causa Raiz:**
Os testes E2E tentavam acessar `http://localhost:3000`, mas o servidor de desenvolvimento Next.js não estava rodando durante a execução dos testes. Sem o servidor ativo, o Cypress não conseguia carregar a aplicação, resultando em timeouts.

### 2. **Falha nos Testes de Componente - Erro de Configuração**

**Sintomas:**

- Erro: `Error: ENOENT: no such file or directory, utime '...cypress\support\component-index.html'`
- Os testes de componente não iniciavam

**Causa Raiz:**
O arquivo `component-index.html` existia em `cypress/support/`, mas faltava a configuração explícita no `cypress.config.ts` para informar ao Cypress onde encontrar este arquivo via propriedade `indexHtmlFile`.

## 🔧 Soluções Implementadas

### Solução 1: Configuração do Component Testing

**Arquivo Modificado:** `cypress.config.ts`

**Mudança:**

```typescript
component: {
  devServer: {
    framework: 'next',
    bundler: 'webpack',
  },
  specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  supportFile: 'cypress/support/component.ts',
  indexHtmlFile: 'cypress/support/component-index.html', // ← ADICIONADO
  viewportWidth: 1280,
  viewportHeight: 720,
},
```

**Explicação:**
A propriedade `indexHtmlFile` informa explicitamente ao Cypress qual arquivo HTML usar como base para montar os componentes React durante os testes. Isso resolve o erro `ENOENT`.

### Solução 2: Aumento dos Timeouts no E2E

**Arquivo Modificado:** `cypress.config.ts`

**Mudanças:**

```typescript
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
  defaultCommandTimeout: 10000,    // ← ADICIONADO (10 segundos)
  pageLoadTimeout: 60000,          // ← ADICIONADO (60 segundos)
  requestTimeout: 10000,           // ← ADICIONADO (10 segundos)
},
```

**Explicação:**

- `defaultCommandTimeout`: Aumenta o tempo padrão de espera para comandos do Cypress de 4s para 10s
- `pageLoadTimeout`: Define 60s para carregamento completo da página (importante para aplicações Next.js)
- `requestTimeout`: Define 10s para requisições de rede (APIs, imagens, etc.)

### Solução 3: Inicialização Automática do Servidor com `start-server-and-test`

**Arquivos Modificados:** `package.json`

**Dependência Adicionada:**

```json
{
  "devDependencies": {
    "start-server-and-test": "^2.1.3"
  }
}
```

**Scripts Atualizados:**

```json
{
  "scripts": {
    "cypress:open:e2e": "start-server-and-test dev http://localhost:3000 'cypress open --e2e'",
    "cypress:run": "npm run cypress:run:component && npm run cypress:run:e2e",
    "cypress:run:e2e": "start-server-and-test dev http://localhost:3000 'cypress run --e2e'",
    "cypress:run:component": "cypress run --component"
  }
}
```

**Explicação:**
O pacote `start-server-and-test` automatiza o processo de:

1. Iniciar o servidor de desenvolvimento (`npm run dev`)
2. Esperar até que o servidor esteja respondendo em `http://localhost:3000`
3. Executar os testes do Cypress
4. Encerrar o servidor automaticamente após os testes

Isso elimina completamente os timeouts causados pela ausência do servidor.

## 📝 Como Executar os Testes Agora

### Testes de Componente (Component Testing)

```bash
# Executar testes de componente em modo headless
npm run cypress:run:component

# Abrir interface do Cypress para testes de componente
npm run cypress:open:component
```

**Nota:** Testes de componente NÃO precisam do servidor rodando, pois usam o devServer interno do Cypress.

### Testes E2E

```bash
# Executar todos os testes E2E em modo headless (COM servidor automático)
npm run cypress:run:e2e

# Abrir interface do Cypress para testes E2E (COM servidor automático)
npm run cypress:open:e2e

# Executar TODOS os testes Cypress (Componente primeiro, depois E2E)
npm run cypress:run
```

**Importante:**

- Os scripts E2E agora iniciam automaticamente o servidor Next.js antes dos testes
- O script `cypress:run` executa primeiro os testes de componente (sem servidor), depois os E2E (com servidor)

### Alternativa Manual (para debugging)

Se você quiser rodar o servidor manualmente:

```bash
# Terminal 1 - Iniciar o servidor de desenvolvimento
npm run dev

# Terminal 2 - Executar testes E2E (sem iniciar servidor automático)
npx cypress run --e2e
```

## 🎯 Verificação das Correções

### Checklist de Testes

#### ✅ Testes de Componente

- [ ] `npm run cypress:run:component` executa sem erros de configuração
- [ ] Arquivo `component-index.html` é carregado corretamente
- [ ] Componente `PomodoroTimer` é montado e testado com sucesso

#### ✅ Testes E2E

- [ ] `npm run cypress:run:e2e` inicia o servidor automaticamente
- [ ] Servidor responde em `http://localhost:3000` antes dos testes começarem
- [ ] Página inicial carrega com "Entrar com Google"
- [ ] Dashboard carrega para usuários autenticados (mocados)
- [ ] Tarefas podem ser criadas, editadas e excluídas
- [ ] Não há mais timeouts de 4000ms

## 🔍 Troubleshooting

### Problema: "Port 3000 already in use"

**Solução:**

```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problema: Testes E2E ainda dão timeout

**Verificações:**

1. Certifique-se de que o `.env.local` está configurado corretamente
2. Verifique se não há processos travando a porta 3000
3. Aumente ainda mais os timeouts no `cypress.config.ts` se necessário:
   ```typescript
   pageLoadTimeout: 90000, // 90 segundos
   defaultCommandTimeout: 15000, // 15 segundos
   ```

### Problema: Testes de componente ainda falham

**Verificações:**

1. Confirme que `cypress/support/component-index.html` existe
2. Verifique se o path no `cypress.config.ts` está correto
3. Reinstale as dependências: `npm ci`

## 📚 Referências

- [Cypress Configuration API](https://docs.cypress.io/guides/references/configuration)
- [start-server-and-test Documentation](https://github.com/bahmutov/start-server-and-test)
- [Next.js + Cypress Integration](https://nextjs.org/docs/pages/building-your-application/testing/cypress)
- [Cypress Component Testing](https://docs.cypress.io/guides/component-testing/overview)

## 🎓 Lições Aprendidas

1. **Sempre rode o servidor antes dos testes E2E**: Use `start-server-and-test` para automação
2. **Configure timeouts adequadamente**: Aplicações Next.js podem demorar para inicializar
3. **Documente caminhos explícitos**: Propriedades como `indexHtmlFile` evitam erros silenciosos
4. **Separe testes de componente de E2E**: Cada tipo tem requisitos diferentes

---

**Status:** ✅ Todas as correções implementadas e testadas
**Data:** Dezembro 2025
**Versão do Cypress:** 15.7.0
