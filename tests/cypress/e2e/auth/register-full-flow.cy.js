const Playground = require('../../pages/PlaygroundPage');

describe('Registro - fluxo completo na UI', () => {
  it('preenche nome, e-mail e senha, clica em Registrar e verifica resumo de sucesso', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');

    Playground.fillRegisterForm({
      name: Playground.getRandomName(),
      email: Playground.getRandomEmail(),
      password: 'minhasenha123',
    });

    Playground.clickRegister();
    Playground.assertRegisterSuccessVisible();
  });
});
