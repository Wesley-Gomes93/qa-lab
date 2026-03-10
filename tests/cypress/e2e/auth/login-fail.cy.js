/**
 * Login com credenciais inválidas – exibe erro 401.
 */
const Playground = require('../../pages/PlaygroundPage');

describe('Login com credenciais inválidas', () => {
  it('exibe erro 401 e mantém na tela de login', () => {
    Playground.visit();
    Playground.getFormLogin().should('be.visible');

    Playground.fillLoginForm({
      email: 'naoexiste@teste.com',
      password: 'senhaerrada',
    });
    Playground.clickLogin();

    // Não redirecionou para o dashboard
    cy.url().should('not.include', '/dashboard');

    // Mensagem de erro visível
    Playground.assertLoginFailVisible();
  });
});
