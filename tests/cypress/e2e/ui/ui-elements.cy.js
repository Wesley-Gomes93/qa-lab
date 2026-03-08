const Playground = require('../../pages/PlaygroundPage');

describe('Validação de todos os elementos da tela inicial', () => {
  it('valida header, seções, formulários, campos e botões', () => {
    Playground.visit();
    Playground.assertAllElementsVisible();
  });
});
