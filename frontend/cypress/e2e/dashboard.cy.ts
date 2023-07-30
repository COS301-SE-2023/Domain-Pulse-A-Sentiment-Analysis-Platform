/// <reference types="cypress" />

describe('Dashboard', function () {
    // we can use these values to log in
    const username = 'thugger';
    const password = '123456';
    let JWT: string = '';
  
    this.beforeEach(() => {
        cy.visit('/login');
        // cy.get('[data-cy=username]').type(username);
        cy.get('[name=username]').type(username);
        // cy.get('[data-cy=password]').type(password);
        cy.get('[name=password]').type(password);
        cy.get('[data-cy=login]').click();
        // cy.get('[data-cy=login]').click();
        cy.contains('Log In').click();
    });

    
});