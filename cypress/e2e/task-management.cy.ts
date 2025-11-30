/// <reference types="cypress" />

describe('Task Management', () => {
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
    
    // Visit dashboard
    cy.visit('/dashboard');
  });

  it('should allow creating a new task', () => {
    // Type task description
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos amanhã');
    
    // Click add button
    cy.contains('Adicionar').click();
    
    // Should show the new task in the list
    cy.contains('Comprar mantimentos amanhã').should('be.visible');
  });

  it('should allow marking a task as complete', () => {
    // Create a task first
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos amanhã');
    cy.contains('Adicionar').click();
    
    // Mark task as complete
    cy.get('[data-testid="task-item"]').first().within(() => {
      cy.get('button').first().click();
    });
    
    // Should show task as completed (strikethrough or different styling)
    cy.contains('Comprar mantimentos amanhã').should('have.class', 'line-through');
  });

  it('should allow deleting a task', () => {
    // Create a task first
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos amanhã');
    cy.contains('Adicionar').click();
    
    // Delete the task
    cy.get('[data-testid="task-item"]').first().within(() => {
      cy.get('[data-testid="delete-button"]').click();
    });
    
    // Should not show the task anymore
    cy.contains('Comprar mantimentos amanhã').should('not.exist');
  });

  it('should allow editing a task', () => {
    // Create a task first
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos amanhã');
    cy.contains('Adicionar').click();
    
    // Edit the task
    cy.get('[data-testid="task-item"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click();
    });
    
    // Modify task title
    cy.get('input[name="title"]').clear().type('Comprar mantimentos e frutas');
    
    // Save changes
    cy.contains('Salvar').click();
    
    // Should show updated task
    cy.contains('Comprar mantimentos e frutas').should('be.visible');
  });

  it('should display task statistics correctly', () => {
    // Initially should show 0 tasks
    cy.contains('Tarefas Locais').parent().contains('0').should('be.visible');
    cy.contains('Concluídas').parent().contains('0').should('be.visible');
    
    // Create a task
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos');
    cy.contains('Adicionar').click();
    
    // Should update total tasks
    cy.contains('Tarefas Locais').parent().contains('1').should('be.visible');
    
    // Mark as complete
    cy.get('[data-testid="task-item"]').first().within(() => {
      cy.get('button').first().click();
    });
    
    // Should update completed tasks
    cy.contains('Concluídas').parent().contains('1').should('be.visible');
  });
});

describe('Advanced Task Features', () => {
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
    
    // Visit dashboard
    cy.visit('/dashboard');
  });

  it('should handle Pomodoro timer for tasks', () => {
    // Create a task first
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos');
    cy.contains('Adicionar').click();
    
    // Start Pomodoro timer for the task
    cy.get('[data-testid="task-item"]').first().within(() => {
      cy.get('[data-testid="timer-button"]').click();
    });
    
    // Should show Pomodoro timer with 25:00
    cy.contains('25:00').should('be.visible');
    
    // Should show pause button when timer starts
    cy.contains('Pausar').should('be.visible');
  });

  it('should show task categories and tags', () => {
    // Click on "Mais opções" to expand task creation
    cy.contains('Mais opções').click();
    
    // Select a category
    cy.get('select[name="category"]').select('work');
    
    // Add tags
    cy.get('input[name="tags"]').type('compras, urgente');
    
    // Create the task
    cy.get('input[placeholder*="Reunião com cliente"]').type('Comprar mantimentos');
    cy.contains('Adicionar').click();
    
    // Should show task with category badge
    cy.contains('Trabalho').should('be.visible');
    
    // Should show task with tags
    cy.contains('compras').should('be.visible');
    cy.contains('urgente').should('be.visible');
  });

  it('should handle recurring tasks', () => {
    // Click on "Mais opções" to expand task creation
    cy.contains('Mais opções').click();
    
    // Enable recurrence
    cy.get('input[type="checkbox"][name="isRecurring"]').check();
    
    // Select recurrence pattern
    cy.get('select[name="recurrencePattern"]').select('daily');
    
    // Create the task
    cy.get('input[placeholder*="Reunião com cliente"]').type('Verificar emails');
    cy.contains('Adicionar').click();
    
    // Should show task with recurrence indicator
    cy.contains('Diário').should('be.visible');
  });
});