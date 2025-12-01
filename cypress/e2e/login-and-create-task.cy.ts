describe('Login and Create Task Flow', () => {
  beforeEach(() => {
    cy.log('🔄 Preparando ambiente de teste para login e criação de tarefa');
    
    // Intercept Google login request and mock successful login
    cy.log('🔧 Configurando mock de login do Google');
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
    cy.log('🔧 Configurando mock de parsing de tarefas');
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
    cy.log('🌐 Visitando página inicial');
    cy.visit('/');
  });

  it('should login and create a task', () => {
    cy.log('✅ Teste: Realizar login e criar uma tarefa');
    
    // Check that we're on the home page
    cy.log('🔍 Verificando elementos da página inicial');
    cy.contains('FocusFlow', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Logo FocusFlow encontrado'));
    cy.contains('Entrar com Google', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Botão de login encontrado'));

    // Click the login button
    cy.log('🖱️ Clicando no botão de login');
    cy.contains('Entrar com Google').click();

    // Wait for login interception
    cy.log('⏳ Aguardando resposta do login do Google');
    cy.wait('@googleLogin').then(() => cy.log('✔️ Login realizado com sucesso'));

    // Check that we're redirected to the dashboard
    cy.log('🔍 Verificando redirecionamento para o dashboard');
    cy.url({ timeout: 10000 })
      .should('include', '/dashboard')
      .then((url) => cy.log(`✔️ Redirecionado para: ${url}`));

    // Check that user is logged in
    cy.log('🔍 Verificando se usuário está logado');
    cy.contains('Test User', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Nome do usuário exibido no dashboard'));

    // Type task description
    cy.log('⌨️ Digitando descrição da tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .should('be.visible')
      .type('Comprar Pão')
      .then(() => cy.log('✔️ Texto "Comprar Pão" digitado'));

    // Click add task button
    cy.log('🖱️ Clicando no botão adicionar tarefa');
    cy.contains('Adicionar', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Botão adicionar clicado'));

    // Wait for task parsing
    cy.log('⏳ Aguardando parsing da tarefa');
    cy.wait('@parseTask').then(() => cy.log('✔️ Tarefa parseada pela API'));

    // Check that task appears in the list
    cy.log('🔍 Verificando se a tarefa aparece na lista');
    cy.contains('Comprar Pão', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Título da tarefa exibido'));
    cy.contains('Ir ao mercado comprar pão', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Descrição da tarefa exibida'));
    
    cy.log('✅ Teste concluído com sucesso');
  });

  it('should logout successfully', () => {
    cy.log('✅ Teste: Realizar logout com sucesso');
    
    // First login
    cy.log('🖱️ Realizando login');
    cy.contains('Entrar com Google', { timeout: 10000 }).click();
    cy.log('⏳ Aguardando login');
    cy.wait('@googleLogin').then(() => cy.log('✔️ Login realizado'));
    cy.log('🔍 Verificando redirecionamento');
    cy.url({ timeout: 10000 })
      .should('include', '/dashboard')
      .then(() => cy.log('✔️ No dashboard'));

    // Click logout button
    cy.log('🖱️ Clicando no botão de logout');
    cy.contains('Sair', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Botão de logout clicado'));

    // Check that we're back on the home page
    cy.log('🔍 Verificando retorno à página inicial');
    cy.url({ timeout: 10000 })
      .should('eq', Cypress.config().baseUrl + '/')
      .then((url) => cy.log(`✔️ Retornou para: ${url}`));
    cy.contains('Entrar com Google', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Botão de login visível'));
    
    cy.log('✅ Teste concluído com sucesso');
  });
});