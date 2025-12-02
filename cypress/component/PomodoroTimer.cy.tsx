import React from 'react';
import { PomodoroTimer } from '../../src/components/PomodoroTimer';

describe('PomodoroTimer Component', () => {
  it('mounts correctly', () => {
    cy.mount(<PomodoroTimer />);
    cy.get('[data-cy-root]').should('exist');
  });

  it('displays initial time correctly', () => {
    cy.mount(<PomodoroTimer initialTime={5 * 60} />); // 5 minutes
    cy.contains('05:00').should('be.visible');
  });

  it('starts counting down when start button is clicked', () => {
    cy.mount(<PomodoroTimer initialTime={5} />); // 5 seconds for testing

    // Initially shows 00:05
    cy.contains('00:05').should('be.visible');

    // Click start button
    cy.contains('Iniciar').click();

    // Wait for 2 seconds and check if timer decreased
    cy.wait(2000);
    cy.contains('00:03').should('be.visible');
  });

  it('pauses counting when pause button is clicked', () => {
    cy.mount(<PomodoroTimer initialTime={10} />); // 10 seconds for testing

    // Initially shows 00:10
    cy.contains('00:10').should('be.visible');

    // Click start button
    cy.contains('Iniciar').click();

    // Wait for 1 second
    cy.wait(1000);

    // Click pause button
    cy.contains('Pausar').click();

    // Wait for 2 more seconds and verify timer didn't decrease
    cy.wait(2000);
    cy.contains('00:09').should('be.visible');
  });

  it('resets timer when reset button is clicked', () => {
    cy.mount(<PomodoroTimer initialTime={10} />); // 10 seconds for testing

    // Initially shows 00:10
    cy.contains('00:10').should('be.visible');

    // Click start button
    cy.contains('Iniciar').click();

    // Wait for 2 seconds
    cy.wait(2000);

    // Timer should have decreased
    cy.contains('00:08').should('be.visible');

    // Click reset button
    cy.contains('Resetar').click();

    // Timer should be reset to initial value
    cy.contains('00:10').should('be.visible');
  });
});
