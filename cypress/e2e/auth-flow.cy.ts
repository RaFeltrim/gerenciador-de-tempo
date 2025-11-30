/// <reference types="cypress" />

describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear all cookies and localStorage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the home page
    cy.visit('/');
  });

  it('should display login page for unauthenticated users', () => {
    // Should show the login button
    cy.contains('Comece Agora').should('be.visible');
    
    // Should show app description
    cy.contains('Sua assistente pessoal de produtividade').should('be.visible');
    
    // Should show Google login option
    cy.contains('Entrar com Google').should('be.visible');
  });

  it('should redirect unauthenticated users from dashboard to login', () => {
    // Try to visit dashboard directly
    cy.visit('/dashboard');
    
    // Should be redirected to home page
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    
    // Should show login page
    cy.contains('Comece Agora').should('be.visible');
  });

  it('should show loading state during authentication', () => {
    // Mock the authentication process to simulate loading
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: { status: 'loading' }
    }).as('authLoading');
    
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Should show loading state
    cy.contains('Carregando...').should('be.visible');
  });

  it('should handle authentication errors gracefully', () => {
    // Mock authentication error
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('authError');
    
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Should redirect to login page
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});

describe('Authenticated User Experience', () => {
  beforeEach(() => {
    // Mock authenticated session
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
    cy.intercept('GET', '/api/google-tasks', {
      statusCode: 200,
      body: {
        tasks: []
      }
    }).as('googleTasks');
    
    // Mock Calendar API
    cy.intercept('GET', '/api/calendar**', {
      statusCode: 200,
      body: {
        events: []
      }
    }).as('calendarEvents');
  });

  it('should display dashboard for authenticated users', () => {
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Should show user profile
    cy.contains('Test User').should('be.visible');
    cy.contains('test@example.com').should('be.visible');
    
    // Should show dashboard components
    cy.contains('FocusFlow').should('be.visible');
    cy.contains('Nova Tarefa').should('be.visible');
    cy.contains('Tarefas Locais').should('be.visible');
    
    // Should show navigation controls
    cy.contains('Sair').should('be.visible');
  });

  it('should allow user to logout', () => {
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Click logout button
    cy.contains('Sair').click();
    
    // Should redirect to home page
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    
    // Should show login page
    cy.contains('Comece Agora').should('be.visible');
  });

  it('should handle API authentication errors and logout automatically', () => {
    // Mock API calls to return 401
    cy.intercept('GET', '/api/google-tasks', {
      statusCode: 401,
      body: { error: 'Unauthorized' }
    }).as('unauthorizedTasks');
    
    // Visit dashboard
    cy.visit('/dashboard');
    
    // Should redirect to login after API error
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
  });
});