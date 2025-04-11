describe('Authentication', () => {
    beforeEach(() => {
      cy.visit('/login');
    });
  
    it('should display login form', () => {
      cy.get('input[name="email"]').should('exist');
      cy.get('input[name="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });
  
    it('should show error on invalid login', () => {
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.contains('Invalid credentials').should('be.visible');
    });
  });