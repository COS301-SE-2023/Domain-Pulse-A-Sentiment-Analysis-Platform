/// <reference types="cypress" />

describe('Dashboard', function () {
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

  it('add and delete domain', () => {
    cy.wait(2000);

    cy.get('[data-cy=addDomainModalToggle]').click();

    cy.get('[data-cy=newDomainNameInput]').type('test domain');
    cy.get('[data-cy=newDomainDescriptionInput]').type('test description');

    cy.get('[data-cy=addNewDomainBtn]').click();

    cy.wait(2000);

    // deleting domain part
    cy.get('[data-cy=sidebar]').click();
    cy.contains('test domain').should('exist');
    cy.contains('test domain').click();
    cy.contains('test domain').parent().find('[data-cy=deleteDomain]').click();

    cy.wait(2000);
    cy.get('[data-cy=sidebar]').click();
    cy.contains('test domain').should('not.exist');
  });

  it('should open the profile toggle and toggle theme', () => {
    cy.wait(2000);
    cy.get('[data-cy=profileModalToggle]').click();
    cy.contains('thugger').should('exist');

    cy.get('[data-cy=toggleTheme]').click();
    // get theme from body
    cy.get('body').then(($body) => {
      // toggle theme

      const theme = $body.hasClass('dark') ? 'dark' : 'light';

      cy.get('[data-cy=toggleTheme]').click();
      cy.wait(1000).then(() => {
        const newTheme = $body.hasClass('dark') ? 'dark' : 'light';
        expect(newTheme).to.not.equal(theme);
      });
    });
  });

  it('should persist theme on refresh', () => {
    cy.wait(1000);
    cy.get('[data-cy=profileModalToggle]').click();
    cy.contains('thugger').should('exist');

    cy.get('[data-cy=toggleTheme]').click();
    // get theme from body
    cy.get('body').then(($body) => {
      // toggle theme
      const theme = $body.hasClass('dark') ? 'dark' : 'light';
      cy.reload();
      cy.wait(1000).then(() => {
        const reloadTheme = $body.hasClass('dark') ? 'dark' : 'light';
        expect(reloadTheme).to.equal(theme);
      });
    });
  });
});
