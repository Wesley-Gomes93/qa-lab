const Playground = require('../../pages/PlaygroundPage');

describe('Registro - preenchimento do formulário (combinações de campos)', () => {
  it('preenche apenas e-mail e senha', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({
      email: `email_${Date.now()}@teste.com`,
      password: 'senha-aleatoria',
    });
  });

  it('preenche apenas e-mail e nome', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({
      name: Playground.getRandomName(),
      email: `email_${Date.now()}@teste.com`,
    });
  });

  it('preenche apenas e-mail', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({
      email: `email_${Date.now()}@teste.com`,
    });
  });

  it('preenche apenas nome', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({
      name: Playground.getRandomName(),
    });
  });

  it('preenche apenas senha', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({
      password: 'minhasenha123',
    });
  });

  it('preenche nome, e-mail e senha', () => {
    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({
      name: Playground.getRandomName(),
      email: `email_${Date.now()}@teste.com`,
      password: 'senha123',
    });
  });
});
