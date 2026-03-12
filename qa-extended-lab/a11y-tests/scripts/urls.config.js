/**
 * URLs to run axe-core accessibility tests against.
 * Add or remove URLs as needed.
 */
module.exports = {
  urls: [
    'https://example.com',
    'https://jsonplaceholder.typicode.com'
  ],
  options: {
    standards: ['wcag2a', 'wcag2aa', 'best-practice'],
    // reduce motion for faster runs (optional)
    restoreScroll: true
  }
};
