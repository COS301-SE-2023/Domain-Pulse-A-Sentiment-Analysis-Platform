describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.contains('Get started by');
    cy.contains('logging in!');
  });
});
