const Playground = require('../../pages/PlaygroundPage');

describe('Registro - título e campos', () => {
  it('lê o título e verifica campos do formulário de registro', () => {
    Playground.visit();

    cy.contains('h1', Playground.texts.title).should('be.visible');
    cy.contains('h2', Playground.texts.sectionRegister).should('be.visible');

    Playground.assertRegisterFormFieldsVisible();

    Playground.fillRegisterForm({
      name: Playground.getRandomName(),
      email: `usuario_${Date.now()}@teste.com`,
    });
  });
});
