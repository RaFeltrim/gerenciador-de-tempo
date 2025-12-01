# Execução Completa dos Testes - FocusFlow

## Visão Geral

Este documento fornece instruções detalhadas para executar todos os testes implementados no FocusFlow, incluindo testes unitários, de componente, integração e E2E.

## 1. Pré-requisitos

Antes de executar os testes, certifique-se de ter:

1. **Node.js** instalado (versão 16 ou superior)
2. **npm** ou **yarn** instalado
3. Todas as dependências do projeto instaladas (`npm install`)
4. Variáveis de ambiente configuradas (`.env.local`)

### ⚠️ Correções Recentes (Dezembro 2025)

**Problemas Resolvidos:**

- ✅ Timeouts nos testes E2E corrigidos
- ✅ Erro de configuração `component-index.html` resolvido
- ✅ Servidor Next.js agora inicia automaticamente para testes E2E

**Para detalhes completos das correções, consulte:** [`CYPRESS_FIXES_GUIDE.md`](./CYPRESS_FIXES_GUIDE.md)

## 2. Estrutura de Comandos

### 2.1. Testes Unitários

```bash
# Executar todos os testes unitários
npm test

# Executar testes unitários em modo watch
npm run test:watch

# Executar testes unitários com cobertura
npm run test:coverage

# Executar apenas testes unitários específicos
npm test __tests__/unit/
```

### 2.2. Testes de Componentes (Cypress)

```bash
# Executar testes de componentes (recomendado - usa npm script)
npm run cypress:run:component

# OU usando npx diretamente
npx cypress run --component

# Abrir interface do Cypress para testes de componentes
npm run cypress:open:component
```

**Nota:** Testes de componente NÃO requerem servidor Next.js rodando.

### 2.3. Testes E2E (Cypress)

**⚠️ IMPORTANTE:** Os testes E2E agora iniciam automaticamente o servidor Next.js usando `start-server-and-test`.

```bash
# Executar todos os testes E2E (INICIA SERVIDOR AUTOMATICAMENTE)
npm run cypress:run:e2e

# Executar testes E2E em um navegador específico
npm run cypress:run:e2e -- --browser chrome

# Abrir interface do Cypress para testes E2E (INICIA SERVIDOR AUTOMATICAMENTE)
npm run cypress:open:e2e

# Executar TODOS os testes Cypress (E2E + Componente)
npm run cypress:run
```

**Alternativa Manual (para debugging):**

```bash
# Terminal 1 - Iniciar o servidor de desenvolvimento
npm run dev

# Terminal 2 - Executar testes E2E (sem iniciar servidor automático)
npx cypress run --e2e
```

### 2.4. Testes de Integração

```bash
# Executar testes de integração
npm test __tests__/integration/

# Executar testes de integração com cobertura
npm run test:coverage __tests__/integration/
```

## 3. Execução Completa dos Testes

### 3.1. Script de Execução Completa

Crie um script `test-all.sh` na raiz do projeto:

```bash
#!/bin/bash

echo "🚀 Iniciando execução completa dos testes do FocusFlow"
echo "==============================================="

# Verificar se todas as dependências estão instaladas
echo "🔍 Verificando dependências..."
npm list > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ Dependências não encontradas. Execute 'npm install' primeiro."
  exit 1
fi

# Executar testes unitários
echo "🧪 Executando testes unitários..."
npm test
if [ $? -ne 0 ]; then
  echo "❌ Testes unitários falharam!"
  exit 1
fi
echo "✅ Testes unitários concluídos com sucesso!"

# Executar testes de integração
echo "🔗 Executando testes de integração..."
npm test __tests__/integration/
if [ $? -ne 0 ]; then
  echo "❌ Testes de integração falharam!"
  exit 1
fi
echo "✅ Testes de integração concluídos com sucesso!"

# Executar testes de componentes
echo "🧩 Executando testes de componentes..."
npm run cypress:run:component
if [ $? -ne 0 ]; then
  echo "❌ Testes de componentes falharam!"
  exit 1
fi
echo "✅ Testes de componentes concluídos com sucesso!"

# Executar testes E2E (com servidor automático)
echo "🌐 Executando testes E2E (iniciando servidor Next.js automaticamente)..."
npm run cypress:run:e2e
if [ $? -ne 0 ]; then
  echo "❌ Testes E2E falharam!"
  exit 1
fi
echo "✅ Testes E2E concluídos com sucesso!"

echo "==============================================="
echo "🎉 Todos os testes foram executados com sucesso!"
echo "📊 Relatório de cobertura disponível em coverage/"
```

Para sistemas Windows, crie `test-all.bat`:

```batch
@echo off
echo 🚀 Iniciando execução completa dos testes do FocusFlow
echo ===============================================

REM Verificar se todas as dependências estão instaladas
echo 🔍 Verificando dependências...
npm list >nul 2>&1
if %errorlevel% neq 0 (
  echo ❌ Dependências não encontradas. Execute 'npm install' primeiro.
  exit /b 1
)

REM Executar testes unitários
echo 🧪 Executando testes unitários...
npm test
if %errorlevel% neq 0 (
  echo ❌ Testes unitários falharam!
  exit /b 1
)
echo ✅ Testes unitários concluídos com sucesso!

REM Executar testes de integração
echo 🔗 Executando testes de integração...
npm test __tests__/integration/
if %errorlevel% neq 0 (
  echo ❌ Testes de integração falharam!
  exit /b 1
)
echo ✅ Testes de integração concluídos com sucesso!

REM Executar testes de componentes
echo 🧩 Executando testes de componentes...
npm run cypress:run:component
if %errorlevel% neq 0 (
  echo ❌ Testes de componentes falharam!
  exit /b 1
)
echo ✅ Testes de componentes concluídos com sucesso!

REM Executar testes E2E (com servidor automático)
echo 🌐 Executando testes E2E (iniciando servidor Next.js automaticamente)...
npm run cypress:run:e2e
if %errorlevel% neq 0 (
  echo ❌ Testes E2E falharam!
  exit /b 1
)
echo ✅ Testes E2E concluídos com sucesso!

echo ===============================================
echo 🎉 Todos os testes foram executados com sucesso!
echo 📊 Relatório de cobertura disponível em coverage/
```

## 4. Relatórios e Métricas

### 4.1. Cobertura de Código

Após executar os testes com cobertura:

```bash
# Gerar relatório de cobertura
npm run test:coverage

# Abrir relatório HTML
open coverage/lcov-report/index.html
```

### 4.2. Métricas Importantes

Monitore estas métricas durante a execução:

- **Cobertura de código**: 85%+ recomendado
- **Tempo total de execução**: < 10 minutos
- **Taxa de sucesso**: 100% (nenhum teste falhando)
- **Testes flaky**: 0 (nenhum teste inconsistente)

## 5. Integração Contínua (CI)

### 5.1. Configuração do GitHub Actions

Crie `.github/workflows/test.yml`:

```yaml
name: Testes

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Usar Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Instalar dependências
        run: npm ci

      - name: Executar testes unitários
        run: npm test

      - name: Executar testes de integração
        run: npm test __tests__/integration/

      - name: Executar testes de componente
        run: npm run cypress:run:component

      - name: Executar testes E2E (com servidor automático)
        run: npm run cypress:run:e2e

      - name: Verificar cobertura mínima
        run: |
          # Verificar se a cobertura está acima de 85%
          COVERAGE=$(grep -o '"lines":{[^}]*' coverage/coverage-summary.json | grep -o '[0-9]*\.[0-9]*' | head -1)
          if (( $(echo "$COVERAGE < 85.0" | bc -l) )); then
            echo "Cobertura abaixo do mínimo: $COVERAGE%"
            exit 1
          fi
```

## 6. Monitoramento e Manutenção

### 6.1. Checklist Semanal

- [ ] Executar todos os testes
- [ ] Verificar relatórios de cobertura
- [ ] Identificar e corrigir testes flaky
- [ ] Atualizar testes para novas funcionalidades
- [ ] Revisar métricas de performance

### 6.2. Checklist Mensal

- [ ] Auditar cobertura de código
- [ ] Revisar estratégias de teste
- [ ] Atualizar dependências de teste
- [ ] Otimizar tempo de execução
- [ ] Planejar expansão da cobertura

## 7. Troubleshooting

### 7.1. Problemas Comuns

**Testes muito lentos:**

```bash
# Executar testes em paralelo
npm test -- --maxWorkers=4
```

**Erros de memória:**

```bash
# Aumentar limite de memória
export NODE_OPTIONS="--max-old-space-size=4096"
```

**Testes flaky:**

```bash
# Executar testes específicos várias vezes
npx jest --testNamePattern="nome_do_teste" --repeatEach=5
```

### 7.2. Debugging

**Executar um único arquivo de teste:**

```bash
npm test __tests__/unit/nome-do-arquivo.test.ts
```

**Executar testes com modo debug:**

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

**Ver logs detalhados:**

```bash
npm test -- --verbose
```

## 8. Boas Práticas

### 8.1. Desenvolvimento Orientado a Testes (TDD)

1. Escreva o teste primeiro
2. Execute o teste (deve falhar)
3. Escreva o código mínimo para passar
4. Refatore mantendo os testes verdes
5. Repita

### 8.2. Manutenção dos Testes

- Mantenha testes independentes
- Use nomes descritivos para testes
- Evite testes muito longos
- Remova testes duplicados
- Atualize testes quando a funcionalidade mudar

## 9. Próximos Passos

1. **Implementar monitoramento contínuo** - Integração com ferramentas de observabilidade
2. **Expandir cobertura** - Alcançar 95%+ de cobertura
3. **Adicionar testes de segurança** - Verificação de vulnerabilidades
4. **Implementar testes de performance** - Benchmarking contínuo
5. **Configurar alertas** - Notificações automáticas de falhas

Esta estratégia de testes completa garante que o FocusFlow mantenha alta qualidade e confiabilidade à medida que cresce e evolui.
