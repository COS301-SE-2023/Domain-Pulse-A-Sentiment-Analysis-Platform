/// <reference types="cypress" />

describe('Logging In - Basic Auth', function () {
  // we can use these values to log in
  const username = 'cypress';
  const password = 'cypress';

  it('should register account', () => {
    cy.wait(1000);
    cy.visit('/register');
    cy.get('[data-cy=username]').type('cypress');
    cy.get('[data-cy=email]').type('cypress@cypress.com');
    cy.get('[data-cy=password]').type('cypress');
    cy.get('[data-cy=confirmPassword]').type('cypress');
    cy.get('[data-cy=registerButton]').click();
    cy.wait(1000);

    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });

  it('should try to register without filling in fields', () => {
    cy.visit('/register');
    cy.get('[data-cy=registerButton]').click();
    cy.contains('.toast-message', 'Your account could not be registered', {
      timeout: 5000,
    }).should('be.visible');
    cy.wait(1000);
  });

  it('should attempt to login without filling in fields', () => {
    cy.visit('/login');

    cy.location('pathname').should('eq', '/login');
    cy.reload();
    cy.get('[data-cy=logInButton]').click();
    cy.wait(2000);
    cy.contains('.toast-message', 'Login failed', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('should attempt a login with incorrect details', () => {
    cy.visit('/login');

    cy.location('pathname').should('eq', '/login');
    cy.reload();
    cy.get('[data-cy=username]').type('hshkdnjsnjnsjkxn');
    cy.get('[data-cy=password]').type('kajskojaoskssj');
    cy.get('[data-cy=logInButton]').click();
    cy.wait(2000);
    cy.contains('.toast-message', 'Login failed', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('should login and delete account', () => {
    cy.visit('/login');

    cy.location('pathname').should('eq', '/login');
    cy.reload();
    cy.get('[data-cy=username]').type('cypress');
    cy.get('[data-cy=password]').type('cypress');
    cy.get('[data-cy=logInButton]').click();
    cy.wait(2000);
    cy.reload();
    cy.wait(2000);
    cy.get('[data-cy=profileModalToggle]').click();
    cy.get('[data-cy=openDeleteAccount]').click();
    cy.get('[data-cy=passwordDeleteAccount]').type('cypress');
    cy.get('[data-cy=deleteAccount]').click();

    cy.location('pathname').should('eq', '/login');
    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
});
