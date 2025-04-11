describe('Messaging Feature', () => {
    beforeEach(() => {
      cy.login(); // Custom command to handle authentication
      cy.visit('/messages');
    });
  
    it('should display conversation list', () => {
      cy.get('[data-testid="conversation-list"]').should('exist');
    });
  
    it('should send a message', () => {
      cy.get('[data-testid="message-input"]').type('Hello World');
      cy.get('[data-testid="send-button"]').click();
      cy.contains('Hello World').should('exist');
    });
  });