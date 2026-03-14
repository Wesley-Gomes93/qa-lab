/**
 * URLs to run axe-core accessibility tests against.
 * Add or remove URLs as needed.
 *
 * Por padrão usa localhost (requer 'make dev' rodando).
 * Para testar sem o app: adicione URLs externas (ex.: https://example.com).
 */
module.exports = {
  urls: [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  options: {
    standards: ['wcag2a', 'wcag2aa', 'best-practice'],
    // reduce motion for faster runs (optional)
    restoreScroll: true
  }
};
