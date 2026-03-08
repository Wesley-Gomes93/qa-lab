const Playground = require('../../pages/PlaygroundPage');

describe('Registro e login - fluxo completo', () => {
  it('cadastra um usuário, depois faz login com o mesmo e-mail e senha e é redirecionado ao dashboard', () => {
    const name = Playground.getRandomName();
    const email = Playground.getRandomEmail();
    const password = 'senha-do-teste-123';

    Playground.visit();
    Playground.getFormRegister().should('be.visible');

    Playground.fillRegisterForm({ name, email, password });
    Playground.clickRegister();
    Playground.assertRegisterSuccessVisible();

    Playground.fillLoginForm({ email, password });
    Playground.clickLogin();

    cy.url().should('include', '/dashboard');
    cy.contains('Bem-vindo de volta').should('be.visible');
    cy.contains('Sair').should('be.visible');
  });
});
