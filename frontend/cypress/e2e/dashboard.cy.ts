/// <reference types="cypress" />

describe('Dashboard', function () {
  // we can use these values to log in
  const username = 'thugger';
  const password = '123456';
  const changePassword = '12345';
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

  it.skip('add and delete domain with preset image', () => {
    cy.wait(2000);

    cy.get('[data-cy=addDomainModalToggle]').click();

    cy.get('[data-cy=newDomainNameInput]').type('test domain');
    cy.get('[data-cy=newDomainDescriptionInput]').type('test description');

    cy.get('.default-icon').eq(1).click();
    cy.get('[data-cy=addNewDomainBtn]').click();

    cy.wait(2000);

    // deleting domain part
    cy.get('[data-cy=sidebar]').click();
    cy.wait(2000);
    cy.contains('test domain').should('exist');
    cy.contains('test domain').click();
    cy.get('[data-cy="deleteDomain"]').click();

    cy.contains('Yes').click();

    cy.wait(3000);
    cy.get('[data-cy=sidebar]').click();
    cy.wait(3000);

    cy.contains('test domain').should('not.exist');
  });

  it.skip('add and delete domain with uploaded image', () => {
    cy.wait(2000);

    cy.get('[data-cy=addDomainModalToggle]').click();

    cy.get('[data-cy=newDomainNameInput]').type('test domain');
    cy.get('[data-cy=newDomainDescriptionInput]').type('test description');

    cy.get('[data-cy="domainImageInput"]').selectFile([
      'cypress/fixtures/stock-profile-pic.jpg',
    ]);

    cy.wait(5000);

    cy.get('[data-cy=addNewDomainBtn]').click();

    cy.wait(2000);

    // deleting domain part
    cy.get('[data-cy=sidebar]').click();
    cy.wait(2000);
    cy.contains('test domain').should('exist');
    cy.contains('test domain').click();
    cy.get('[data-cy="deleteDomain"]').click();

    cy.contains('Yes').click();

    cy.wait(2000);
    cy.get('[data-cy=sidebar]').click();
    cy.contains('test domain').should('not.exist');
  });

  it.skip('add a domain without filling anything in', () => {
    cy.wait(2000);
    cy.get('[data-cy=addDomainModalToggle]').click();

    cy.get('[data-cy=addNewDomainBtn]').click();

    cy.wait(2000);

    cy.contains('.toast-message', 'Please enter a domain description', {
      timeout: 40000,
    }).should('be.visible');
    cy.contains('.toast-message', 'Please enter a domain name', {
      timeout: 40000,
    }).should('be.visible');
    cy.contains('.toast-message', 'Please select a domain icon', {
      timeout: 40000,
    }).should('be.visible');
  });

  it.skip('add and delete source', () => {
    cy.wait(2000);

    cy.get('[data-cy=addSource]').click();
    cy.wait(2000);

    cy.get('[data-cy=newSourceNameInp]').type('test source');
    cy.get('[data-cy=selectYoutubePlatform]').click();
    cy.get('[data-cy=newSourceUrlInp]').type(
      'https://www.youtube.com/watch?v=FeIBbxMcmI4'
    );

    cy.get('[data-cy=confirmAddSource]').click();

    cy.wait(2000);
    cy.contains('test source').should('exist');

    // dont delete
    cy.get('[data-cy=deleteSourceModal').click();
    cy.get('[data-cy=cancelDeleteSource]').click();
    cy.contains('test source').should('exist');

    // actually delete
    cy.get('[data-cy=deleteSourceModal').click();
    cy.get('[data-cy=confirmDeleteSource]').click();

    cy.wait(2000);
    cy.contains('test source').should('not.exist');
  });

  it.skip('should try to add a source without filling in all fields', () => {
    cy.wait(2000);

    cy.get('[data-cy=addSource]').click();
    cy.wait(4000);

    cy.get('[data-cy=confirmAddSource]').click();

    cy.wait(2000);
    cy.contains('.toast-message', 'Please fill in all fields', {
      timeout: 40000,
    }).should('be.visible');
  });

  it.skip('should open the profile toggle and toggle theme', () => {
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

  it.skip('should persist theme on refresh', () => {
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

  

  it.skip('should log out', () => {
    cy.reload();
    cy.wait(10000);
    cy.get('[data-cy="profileModalToggle"]').click();
    cy.contains('thugger').should('exist');

    cy.get('[data-cy=logOutButton]').click();

    cy.location('pathname').should('eq', '/login');
  });

  it.skip('should select a domain, select source, and refresh source', () => {
    cy.reload();
    cy.wait(6000);
    cy.get('[data-cy="domain"]').first().click();
    cy.wait(2000);
    cy.get('[data-cy="source"]').first().click();
    cy.wait(2000);
    cy.get('[data-cy="refresh"]').first().click();
    cy.wait(2000);
    cy.contains('.toast-message', 'Your source has been refreshed', {
      timeout: 40000,
    }).should('be.visible');
  });

  it.skip('should edit the name of a youtube source', () => {
    cy.wait(3000);

    cy.get('[data-cy="domain"]').each(($domainElement) => {
      const hasYouTubeLogo =
        $domainElement.find('img[src="../assets/youtube-logo.png"]').length > 0;

      if (hasYouTubeLogo) {
        cy.wrap($domainElement).click();
        return false;
      }
    });

    cy.get('[data-cy="source"]').each(($domainElement) => {
      const hasYouTubeLogo =
        $domainElement.find('img[src="../assets/youtube-logo.png"]').length > 0;

      if (hasYouTubeLogo) {
        cy.wrap($domainElement).click();
        return false;
      }
    });

    cy.get('[data-cy="pen"]').click();

    cy.get('[data-cy="sourceNameEdit"]').type('edited source');

    cy.get('[data-cy="confirmEditSource"]').click();

    cy.get('[data-cy="source"]').contains('edited source').should('exist');
  });

  it.skip('should click on all statistics and observe the graphs change', () => {
    cy.wait(10000);

    cy.get('[data-cy="selectStatisticCategoryat0"]').click();

    cy.get('[data-cy="0"]').should('exist');

    cy.get('[data-cy="selectStatisticCategoryat1"]').click();
    cy.get('[data-cy="1"]').should('exist');

    cy.get('[data-cy="selectStatisticCategoryat2"]').click();
    cy.get('[data-cy="2"]').should('exist');

    cy.get('[data-cy="selectStatisticCategoryat3"]').click();
    cy.get('[data-cy="3"]').should('exist');
    // After the action or event, check if the canvas element's attributes or properties have changed
  });

  it('should update the profile icon', () => {
    cy.wait(2000);

    cy.get('[data-cy=profileModalToggle]').click();
    cy.contains('thugger').should('exist');

    cy.get('[data-cy=toggleProfilePic]').click();

    cy.get('[data-cy="fileUploadInput"]').selectFile([
      'cypress/fixtures/stock-profile-pic.jpg',
    ]);

    cy.get('[data-cy="confirmUpload"]').click();
    cy.contains('.toast-message', 'Your profile icon has been changed', {
      timeout: 40000,
    }).should('be.visible');
  });

  it('should edit all parameters for a domain (upload image)', () => {
    cy.wait(2000);

    cy.get('[data-cy=sidebar]').click();

    cy.get('[data-cy=editDomainModalToggle]').click();

    cy.get('[data-cy=name]').clear();

    cy.get('[data-cy=name]').type('edited domain name');

    cy.get('[data-cy=description]').clear();

    cy.get('[data-cy=description]').type('edited domain description');

    cy.get('[data-cy="domainIconUpload"]').selectFile([
      'cypress/fixtures/stock-profile-pic.jpg',
    ]);

    cy.get('[data-cy="confirmEditDomain"]').click();
    cy.wait(3000);
    cy.contains('.toast-message', 'Your domain has been updated', {
      timeout: 40000,
    }).should('be.visible');
    cy.wait(10000);

  });

  it('should edit all parameters for a domain (select preset image)', () => {
    cy.wait(2000);

    cy.get('[data-cy=sidebar]').click();

    cy.get('[data-cy=editDomainModalToggle]').click();

    cy.get('[data-cy=name]').clear();

    cy.get('[data-cy=name]').type('edited domain name');

    cy.get('[data-cy=description]').clear();

    cy.get('[data-cy=description]').type('edited domain description');

    cy.get('[data-cy=domainIconEdit]').eq(1).click();

    cy.get('[data-cy="confirmEditDomain"]').click();
    cy.wait(3000);
    cy.contains('.toast-message', 'Your domain has been updated', {
      timeout: 40000,
    }).should('be.visible');

  });

  it('should edit only the domain name', () => {
    cy.wait(2000);

    cy.get('[data-cy=sidebar]').click();

    cy.get('[data-cy=editDomainModalToggle]').click();

    cy.get('[data-cy=name]').clear();

    cy.get('[data-cy=name]').type('editing the domain name');

    cy.get('[data-cy="confirmEditDomain"]').click();

  });

  it('should edit only the domain description', () => {
    cy.wait(2000);

    cy.get('[data-cy=sidebar]').click();

    cy.get('[data-cy=editDomainModalToggle]').click();

    cy.get('[data-cy=description]').clear();

    cy.get('[data-cy=description]').type('only editing domain description');

    cy.get('[data-cy="confirmEditDomain"]').click();

    cy.wait(3000);

  });

  it('should edit only the domain image with a preset image', () => {
    cy.wait(2000);

    cy.get('[data-cy=sidebar]').click();

    cy.get('[data-cy=editDomainModalToggle]').click();

    cy.get('[data-cy=domainIconEdit]').eq(1).click();

    cy.get('[data-cy="confirmEditDomain"]').click();

    cy.wait(3000);
    cy.contains('.toast-message', 'Your domain has been updated', {
      timeout: 40000,
    }).should('be.visible');
  });

  it.skip('should change password and change it back', () => {
    cy.reload();
    cy.wait(10000);
    cy.get('[data-cy=profileModalToggle]').click();
    cy.contains('thugger').should('exist');
    cy.wait(4000);
    cy.get('[data-cy=openChangePassword]').click();

    cy.get('[data-cy=oldPassword]').type(password);

    cy.get('[data-cy=newPassword]').type(changePassword);

    cy.get('[data-cy=confirmChangePassword]').click();

    cy.visit('/login');
    cy.wait(2000);
    cy.get('[data-cy=username]').type('thugger');

    cy.get('[data-cy=password]').type(changePassword);

    cy.get('[data-cy=logInButton]').click();

    cy.location('pathname').should('eq', '/');

    cy.wait(2000);
    cy.get('[data-cy=profileModalToggle]').click();
    cy.contains('thugger').should('exist');

    cy.get('[data-cy=openChangePassword]').click({ force: true });

    cy.get('[data-cy=oldPassword]').type(changePassword);

    cy.get('[data-cy=newPassword]').type(password);

    cy.get('[data-cy=confirmChangePassword]').click();

    Cypress.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
});
