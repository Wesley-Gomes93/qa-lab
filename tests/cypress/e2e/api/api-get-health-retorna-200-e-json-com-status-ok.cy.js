describe('API /health', () => {
  it('retorna 200 e JSON com status ok', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE}/health`,
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('ok');
    });
  });
});