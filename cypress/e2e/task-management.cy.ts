/// <reference types="cypress" />

describe('Task Management', () => {
  beforeEach(() => {
    cy.log('🔄 Preparando ambiente de teste para gerenciamento de tarefas');

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
            image: 'https://via.placeholder.com/32',
          },
          accessToken: 'mock-access-token',
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    }).as('authSession');

    // Mock Google Tasks API
    cy.log('🔧 Configurando mock do Google Tasks API');
    cy.intercept('GET', '/api/google-tasks', {
      statusCode: 200,
      body: {
        tasks: [],
      },
    }).as('googleTasks');

    // Mock Calendar API
    cy.log('🔧 Configurando mock do Calendar API');
    cy.intercept('GET', '/api/calendar**', {
      statusCode: 200,
      body: {
        events: [],
      },
    }).as('calendarEvents');

    // Visit dashboard
    cy.log('🌐 Visitando dashboard');
    cy.visit('/dashboard');
  });

  it('should allow creating a new task', () => {
    cy.log('✅ Teste: Criar uma nova tarefa');

    // Type task description
    cy.log('⌨️ Digitando descrição da tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .should('be.visible')
      .type('Comprar mantimentos amanhã')
      .then(() => cy.log('✔️ Texto digitado no campo de tarefa'));

    // Click add button
    cy.log('🖱️ Clicando no botão adicionar');
    cy.contains('Adicionar', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Botão adicionar clicado'));

    // Should show the new task in the list
    cy.log('🔍 Verificando se a tarefa aparece na lista');
    cy.contains('Comprar mantimentos amanhã', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Tarefa criada e exibida com sucesso'));

    cy.log('✅ Teste concluído com sucesso');
  });

  it('should allow marking a task as complete', () => {
    cy.log('✅ Teste: Marcar uma tarefa como completa');

    // Create a task first
    cy.log('⌨️ Criando uma tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Comprar mantimentos amanhã')
      .then(() => cy.log('✔️ Tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa adicionada'));

    // Mark task as complete
    cy.log('🖱️ Marcando tarefa como completa');
    cy.get('[data-testid="task-item"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .within(() => {
        cy.log('🔍 Procurando botão de checkbox dentro da tarefa');
        cy.get('button').first().click();
      })
      .then(() => cy.log('✔️ Tarefa marcada como completa'));

    // Should show task as completed (strikethrough or different styling)
    cy.log('🔍 Verificando estilo de tarefa completa');
    cy.contains('Comprar mantimentos amanhã', { timeout: 10000 })
      .should('have.class', 'line-through')
      .then(() => cy.log('✔️ Tarefa exibida com estilo de completa (line-through)'));

    cy.log('✅ Teste concluído com sucesso');
  });

  it('should allow deleting a task', () => {
    cy.log('✅ Teste: Excluir uma tarefa');

    // Create a task first
    cy.log('⌨️ Criando uma tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Comprar mantimentos amanhã')
      .then(() => cy.log('✔️ Tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa adicionada'));

    // Delete the task
    cy.log('🖱️ Excluindo a tarefa');
    cy.get('[data-testid="task-item"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .within(() => {
        cy.log('🔍 Procurando botão de exclusão dentro da tarefa');
        cy.get('[data-testid="delete-button"]', { timeout: 10000 }).should('be.visible').click();
      })
      .then(() => cy.log('✔️ Botão de exclusão clicado'));

    // Should not show the task anymore
    cy.log('🔍 Verificando se a tarefa foi removida da lista');
    cy.contains('Comprar mantimentos amanhã', { timeout: 10000 })
      .should('not.exist')
      .then(() => cy.log('✔️ Tarefa removida com sucesso'));

    cy.log('✅ Teste concluído com sucesso');
  });

  it('should allow editing a task', () => {
    cy.log('✅ Teste: Editar uma tarefa');

    // Create a task first
    cy.log('⌨️ Criando uma tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Comprar mantimentos amanhã')
      .then(() => cy.log('✔️ Tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa adicionada'));

    // Edit the task
    cy.log('🖱️ Abrindo formulário de edição');
    cy.get('[data-testid="task-item"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .within(() => {
        cy.log('🔍 Procurando botão de edição dentro da tarefa');
        cy.get('[data-testid="edit-button"]', { timeout: 10000 }).should('be.visible').click();
      })
      .then(() => cy.log('✔️ Formulário de edição aberto'));

    // Modify task title
    cy.log('⌨️ Modificando título da tarefa');
    cy.get('input[name="title"]', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type('Comprar mantimentos e frutas')
      .then(() => cy.log('✔️ Novo título digitado'));

    // Save changes
    cy.log('🖱️ Salvando alterações');
    cy.contains('Salvar', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Alterações salvas'));

    // Should show updated task
    cy.log('🔍 Verificando se a tarefa foi atualizada');
    cy.contains('Comprar mantimentos e frutas', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Tarefa atualizada com sucesso'));

    cy.log('✅ Teste concluído com sucesso');
  });

  it('should display task statistics correctly', () => {
    cy.log('✅ Teste: Verificar estatísticas de tarefas');

    // Initially should show 0 tasks
    cy.log('🔍 Verificando contadores iniciais (deve ser 0)');
    cy.contains('Tarefas Locais', { timeout: 10000 })
      .parent()
      .contains('0')
      .should('be.visible')
      .then(() => cy.log('✔️ Contador de tarefas locais: 0'));
    cy.contains('Concluídas', { timeout: 10000 })
      .parent()
      .contains('0')
      .should('be.visible')
      .then(() => cy.log('✔️ Contador de tarefas concluídas: 0'));

    // Create a task
    cy.log('⌨️ Criando uma tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Comprar mantimentos')
      .then(() => cy.log('✔️ Tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa adicionada'));

    // Should update total tasks
    cy.log('🔍 Verificando atualização do contador de tarefas locais (deve ser 1)');
    cy.contains('Tarefas Locais', { timeout: 10000 })
      .parent()
      .contains('1')
      .should('be.visible')
      .then(() => cy.log('✔️ Contador de tarefas locais atualizado para: 1'));

    // Mark as complete
    cy.log('🖱️ Marcando tarefa como completa');
    cy.get('[data-testid="task-item"]', { timeout: 10000 })
      .first()
      .within(() => {
        cy.get('button').first().click();
      })
      .then(() => cy.log('✔️ Tarefa marcada como completa'));

    // Should update completed tasks
    cy.log('🔍 Verificando atualização do contador de tarefas concluídas (deve ser 1)');
    cy.contains('Concluídas', { timeout: 10000 })
      .parent()
      .contains('1')
      .should('be.visible')
      .then(() => cy.log('✔️ Contador de tarefas concluídas atualizado para: 1'));

    cy.log('✅ Teste concluído com sucesso');
  });
});

describe('Advanced Task Features', () => {
  beforeEach(() => {
    cy.log('🔄 Preparando ambiente de teste para recursos avançados');

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
            image: 'https://via.placeholder.com/32',
          },
          accessToken: 'mock-access-token',
          expiresAt: Math.floor(Date.now() / 1000) + 3600,
        },
      },
    }).as('authSession');

    // Mock Google Tasks API
    cy.log('🔧 Configurando mock do Google Tasks API');
    cy.intercept('GET', '/api/google-tasks', {
      statusCode: 200,
      body: {
        tasks: [],
      },
    }).as('googleTasks');

    // Mock Calendar API
    cy.log('🔧 Configurando mock do Calendar API');
    cy.intercept('GET', '/api/calendar**', {
      statusCode: 200,
      body: {
        events: [],
      },
    }).as('calendarEvents');

    // Visit dashboard
    cy.log('🌐 Visitando dashboard');
    cy.visit('/dashboard');
  });

  it('should handle Pomodoro timer for tasks', () => {
    cy.log('✅ Teste: Gerenciar timer Pomodoro para tarefas');

    // Create a task first
    cy.log('⌨️ Criando uma tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Comprar mantimentos')
      .then(() => cy.log('✔️ Tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa adicionada'));

    // Start Pomodoro timer for the task
    cy.log('🖱️ Iniciando timer Pomodoro para a tarefa');
    cy.get('[data-testid="task-item"]', { timeout: 10000 })
      .first()
      .should('be.visible')
      .within(() => {
        cy.log('🔍 Procurando botão do timer');
        cy.get('[data-testid="timer-button"]', { timeout: 10000 }).should('be.visible').click();
      })
      .then(() => cy.log('✔️ Timer Pomodoro iniciado'));

    // Should show Pomodoro timer with 25:00
    cy.log('🔍 Verificando se o timer mostra 25:00');
    cy.contains('25:00', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Timer Pomodoro exibindo 25:00'));

    // Should show pause button when timer starts
    cy.log('🔍 Verificando se o botão Pausar está visível');
    cy.contains('Pausar', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Botão Pausar visível'));

    cy.log('✅ Teste concluído com sucesso');
  });

  it('should show task categories and tags', () => {
    cy.log('✅ Teste: Exibir categorias e tags de tarefas');

    // Click on "Mais opções" to expand task creation
    cy.log('🖱️ Expandindo opções avançadas de criação de tarefa');
    cy.contains('Mais opções', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Opções avançadas expandidas'));

    // Select a category
    cy.log('🔽 Selecionando categoria "Trabalho"');
    cy.get('select[name="category"]', { timeout: 10000 })
      .should('be.visible')
      .select('work')
      .then(() => cy.log('✔️ Categoria "Trabalho" selecionada'));

    // Add tags
    cy.log('⌨️ Adicionando tags');
    cy.get('input[name="tags"]', { timeout: 10000 })
      .should('be.visible')
      .type('compras, urgente')
      .then(() => cy.log('✔️ Tags digitadas: compras, urgente'));

    // Create the task
    cy.log('⌨️ Criando a tarefa');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Comprar mantimentos')
      .then(() => cy.log('✔️ Descrição da tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa adicionada'));

    // Should show task with category badge
    cy.log('🔍 Verificando se o badge de categoria está visível');
    cy.contains('Trabalho', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Badge "Trabalho" exibido'));

    // Should show task with tags
    cy.log('🔍 Verificando se as tags estão visíveis');
    cy.contains('compras', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Tag "compras" exibida'));
    cy.contains('urgente', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Tag "urgente" exibida'));

    cy.log('✅ Teste concluído com sucesso');
  });

  it('should handle recurring tasks', () => {
    cy.log('✅ Teste: Gerenciar tarefas recorrentes');

    // Click on "Mais opções" to expand task creation
    cy.log('🖱️ Expandindo opções avançadas de criação de tarefa');
    cy.contains('Mais opções', { timeout: 10000 })
      .should('be.visible')
      .click()
      .then(() => cy.log('✔️ Opções avançadas expandidas'));

    // Enable recurrence
    cy.log('☑️ Habilitando recorrência');
    cy.get('input[type="checkbox"][name="isRecurring"]', { timeout: 10000 })
      .should('be.visible')
      .check()
      .then(() => cy.log('✔️ Checkbox de recorrência marcado'));

    // Select recurrence pattern
    cy.log('🔽 Selecionando padrão de recorrência "Diário"');
    cy.get('select[name="recurrencePattern"]', { timeout: 10000 })
      .should('be.visible')
      .select('daily')
      .then(() => cy.log('✔️ Padrão "Diário" selecionado'));

    // Create the task
    cy.log('⌨️ Criando tarefa recorrente');
    cy.get('input[placeholder*="Reunião com cliente"]', { timeout: 10000 })
      .type('Verificar emails')
      .then(() => cy.log('✔️ Descrição da tarefa digitada'));
    cy.contains('Adicionar', { timeout: 10000 })
      .click()
      .then(() => cy.log('✔️ Tarefa recorrente adicionada'));

    // Should show task with recurrence indicator
    cy.log('🔍 Verificando se o indicador de recorrência está visível');
    cy.contains('Diário', { timeout: 10000 })
      .should('be.visible')
      .then(() => cy.log('✔️ Indicador "Diário" exibido'));

    cy.log('✅ Teste concluído com sucesso');
  });
});
