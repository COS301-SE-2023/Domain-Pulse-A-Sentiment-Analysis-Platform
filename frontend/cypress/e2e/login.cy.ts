/// <reference types="cypress" />

describe('Logging In - Basic Auth', function () {
  // we can use these values to log in
  const username = 'thugger';
  const password = '123456';
  let JWT: string = '';

  // but set the user before visiting the page
  // so the app thinks it is already authenticated
  beforeEach(function setUser() {
    cy.request('POST', '/api/profiles/profiles/login_user', {
      username: username,
      password: password,
    })
      .its('body')
      .then((res) => {
        JWT = res.JWT;
        cy.visit('/', {
          onBeforeLoad(win) {
            // and before the page finishes loading
            // set the user object in local storage
            win.localStorage.setItem('JWT', JWT);
          },
        });
      });
  });

  it('redirects to /login', () => {
    window.localStorage.removeItem('JWT');
    cy.visit('/');
    cy.location('pathname').should('eq', '/login');
  });

  it('be in dashboard', () => {
    cy.visit('/');
    cy.wait(500);
    cy.location('pathname').should('eq', '/');
  });

  it('check if the button switches to the register page correctly', () => {
    window.localStorage.removeItem('JWT');
    cy.visit('/login');
    cy.get('[data-cy=switchForNoAcc]').click();
    cy.location('pathname').should('eq', '/register');
  });

  it('switched to login if one has registered', () => {
    window.localStorage.removeItem('JWT');
    cy.visit('/register');
    cy.get('[data-cy=switchForAcc]').click();
    cy.location('pathname').should('eq', '/login');
  });
});
