/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.log('🔄 Limpando cookies e localStorage antes do teste');
    // Clear all cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    cy.log('🌐 Visitando a página inicial (/)');
    // Visit the home page
    cy.visit('/');
  });

  it('should display login page for unauthenticated users', () => {
    cy.log('✅ Teste: Verificar exibição da página de login para usuários não autenticados');
    
    // Should show the login button
    cy.log('🔍 Procurando botão "Entrar com Google"');
    cy.contains('Entrar com Google', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Botão "Entrar com Google" encontrado e visível'));
    
    // Should show app description
    cy.log('🔍 Procurando descrição da plataforma');
    cy.contains('Uma plataforma completa de gerenciamento de tempo', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Descrição da plataforma encontrada e visível'));
    
    cy.log('✅ Teste concluído com sucesso');
  });

  it('should redirect unauthenticated users from dashboard to login', () => {
    cy.log('✅ Teste: Verificar redirecionamento de usuários não autenticados do dashboard para login');
    
    // Try to visit dashboard directly
    cy.log('🌐 Tentando acessar /dashboard diretamente sem autenticação');
    cy.visit('/dashboard');
    
    // Should be redirected to home page
    cy.log('🔍 Verificando se foi redirecionado para a página inicial');
    cy.url({ timeout: 10000 })
      .should('eq', `${Cypress.config().baseUrl}/`)
      .then((url) => cy.log(`✔️ URL correta: ${url}`));
    
    // Should show login page - the home page shows "Entrar com Google" button
    cy.log('🔍 Verificando se a página de login está visível');
    cy.contains('Entrar com Google', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Página de login exibida corretamente'));
    
    cy.log('✅ Teste concluído com sucesso');
  });

  it('should show loading state during authentication', () => {
    cy.log('✅ Teste: Verificar estado de carregamento durante autenticação');
    
    // Mock the authentication process to simulate loading
    cy.log('🔧 Configurando mock da API de autenticação com status "loading"');
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: { status: 'loading' }
    }).as('authLoading');
    
    // Visit dashboard
    cy.log('🌐 Visitando dashboard');
    cy.visit('/dashboard');
    
    // Should show loading state
    cy.log('🔍 Procurando indicador de carregamento');
    cy.contains('Carregando...', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Indicador de carregamento exibido corretamente'));
    
    cy.log('✅ Teste concluído com sucesso');
  });

  it('should handle authentication errors gracefully', () => {
    cy.log('✅ Teste: Verificar tratamento de erros de autenticação');
    
    // Mock authentication error
    cy.log('🔧 Configurando mock da API de autenticação com erro 401');
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('authError');
    
    // Visit dashboard
    cy.log('🌐 Visitando dashboard');
    cy.visit('/dashboard');
    
    // Should redirect to login page
    cy.log('🔍 Verificando se foi redirecionado para a página inicial');
    cy.url({ timeout: 10000 })
      .should('eq', `${Cypress.config().baseUrl}/`)
      .then((url) => cy.log(`✔️ Redirecionamento correto para: ${url}`));
    
    cy.log('✅ Teste concluído com sucesso');
  });
});

describe('Authenticated User Experience', () => {
  beforeEach(() => {
    cy.log('🔄 Configurando ambiente para usuário autenticado');
    
    // Mock authenticated session
    cy.log('🔧 Configurando mock de sessão autenticada');
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        status: 'authenticated',
        data: {
          user: {
            name: 'Test User',
            email: 'test@example.com',
            image: 'https://via.placeholder.com/32'
          },
          accessToken: 'mock-access-token',
          expiresAt: Math.floor(Date.now() / 1000) + 3600
        }
      }
    }).as('authSession');
    
    // Mock Google Tasks API
    cy.log('🔧 Configurando mock do Google Tasks API');
    cy.intercept('GET', '/api/google-tasks', {
      statusCode: 200,
      body: {
        tasks: []
      }
    }).as('googleTasks');
    
    // Mock Calendar API
    cy.log('🔧 Configurando mock do Calendar API');
    cy.intercept('GET', '/api/calendar**', {
      statusCode: 200,
      body: {
        events: []
      }
    }).as('calendarEvents');
  });

  it('should display dashboard for authenticated users', () => {
    cy.log('✅ Teste: Verificar exibição do dashboard para usuários autenticados');
    
    // Visit dashboard
    cy.log('🌐 Visitando dashboard como usuário autenticado');
    cy.visit('/dashboard');
    
    // Should show user profile
    cy.log('🔍 Verificando informações do perfil do usuário');
    cy.contains('Test User', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Nome do usuário exibido'));
    cy.contains('test@example.com', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Email do usuário exibido'));
    
    // Should show dashboard components
    cy.log('🔍 Verificando componentes do dashboard');
    cy.contains('FocusFlow', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Logo FocusFlow exibido'));
    cy.contains('Nova Tarefa', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Seção "Nova Tarefa" exibida'));
    cy.contains('Tarefas Locais', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Contador de tarefas locais exibido'));
    
    // Should show navigation controls
    cy.log('🔍 Verificando controles de navegação');
    cy.contains('Sair', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Botão de logout exibido'));
    
    cy.log('✅ Teste concluído com sucesso');
  });

  it('should allow user to logout', () => {
    cy.log('✅ Teste: Verificar funcionalidade de logout');
    
    // Visit dashboard
    cy.log('🌐 Visitando dashboard');
    cy.visit('/dashboard');
    
    // Click logout button
    cy.log('🖱️ Clicando no botão de logout');
    cy.contains('Sair', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Botão de logout clicado'));
    
    // Should redirect to home page
    cy.log('🔍 Verificando redirecionamento para a página inicial');
    cy.url({ timeout: 10000 })
      .should('eq', `${Cypress.config().baseUrl}/`)
      .then((url) => cy.log(`✔️ Redirecionado para: ${url}`));
    
    // Should show login page - the home page shows "Entrar com Google" button
    cy.log('🔍 Verificando se a página de login está visível');
    cy.contains('Entrar com Google', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Página de login exibida'));
    
    cy.log('✅ Teste concluído com sucesso');
  });

  it('should handle API authentication errors and logout automatically', () => {
    cy.log('✅ Teste: Verificar logout automático após erro de autenticação da API');
    
    // Mock API calls to return 401
    cy.log('🔧 Configurando mock de API com erro 401 (Unauthorized)');
    cy.intercept('GET', '/api/google-tasks', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('unauthorizedTasks');
    
    // Visit dashboard
    cy.log('🌐 Visitando dashboard');
    cy.visit('/dashboard');
    
    // Should redirect to login after API error (home page is the login page)
    cy.log('🔍 Verificando se foi redirecionado para a página inicial após erro de API');
    cy.url({ timeout: 10000 })
      .should('eq', `${Cypress.config().baseUrl}/`)
      .then((url) => cy.log(`✔️ Logout automático realizado, redirecionado para: ${url}`));
    
    cy.log('✅ Teste concluído com sucesso');
  });
});