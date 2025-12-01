describe('Login and Create Task Flow', () => {
  beforeEach(() => {
    // Intercept Google login request and mock successful login
    cy.intercept('POST', '/api/auth/callback/google', {
      statusCode: 200,
      body: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    }).as('googleLogin');

    // Intercept task creation request
    cy.intercept('POST', '/api/parse-task', {
      statusCode: 200,
      body: {
        title: 'Comprar Pão',
        description: 'Ir ao mercado comprar pão',
        priority: 'medium',
        estimatedTime: 15,
        dueDate: null,
      },
    }).as('parseTask');

    // Visit the home page
    cy.visit('/');
  });

  it('should login and create a task', () => {
    // Check that we're on the home page
    cy.contains('FocusFlow').should('be.visible');
    cy.contains('Entrar com Google').should('be.visible');

    // Click the login button
    cy.contains('Entrar com Google').click();

    // Wait for login interception
    cy.wait('@googleLogin');

    // Check that we're redirected to the dashboard
    cy.url().should('include', '/dashboard');

    // Check that user is logged in
    cy.contains('Test User').should('be.visible');

    // Type task description
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar Pão');

    // Click add task button
    cy.contains('Adicionar').click();

    // Wait for task parsing
    cy.wait('@parseTask');

    // Check that task appears in the list
    cy.contains('Comprar Pão').should('be.visible');
    cy.contains('Ir ao mercado comprar pão').should('be.visible');
  });

  it('should logout successfully', () => {
    // First login
    cy.contains('Entrar com Google').click();
    cy.wait('@googleLogin');
    cy.url().should('include', '/dashboard');

    // Click logout button
    cy.contains('Sair').click();

    // Check that we're back on the home page
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Entrar com Google').should('be.visible');
  });
});