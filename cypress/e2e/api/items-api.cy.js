describe('items API', () => {
  it('reports healthy', () => {
    cy.apiRequest('GET', '/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('ok');
    });
  });

  it('runs the full item lifecycle', () => {
    cy.apiRequest('POST', '/items', {
      body: { name: 'Widget', price: 9.99 },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.id).to.be.a('number');
      cy.wrap(response.body.id).as('itemId');
    });

    cy.get('@itemId').then((id) => {
      cy.apiRequest('GET', `/items/${id}`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Widget');
      });
    });

    cy.get('@itemId').then((id) => {
      cy.apiRequest('GET', '/items').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.map((item) => item.id)).to.include(id);
      });
    });

    cy.get('@itemId').then((id) => {
      cy.apiRequest('PUT', `/items/${id}`, {
        body: { name: 'Widget Pro', price: 14.99 },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Widget Pro');
        expect(response.body.price).to.eq(14.99);
      });
    });

    cy.get('@itemId').then((id) => {
      cy.apiRequest('PATCH', `/items/${id}`, {
        body: { price: 12.99 },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.price).to.eq(12.99);
        expect(response.body.name).to.eq('Widget Pro');
      });
    });

    cy.get('@itemId').then((id) => {
      cy.apiRequest('DELETE', `/items/${id}`).then((response) => {
        expect(response.status).to.eq(200);
      });
      cy.apiRequest('GET', `/items/${id}`).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  it('rejects requests without an API key', () => {
    cy.apiRequest('GET', '/items', { apiKey: null }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it('returns 404 for an unknown item', () => {
    cy.apiRequest('GET', '/items/999999').then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('returns 422 for an invalid body', () => {
    cy.apiRequest('POST', '/items', { body: {} }).then((response) => {
      expect(response.status).to.eq(422);
    });
    cy.apiRequest('POST', '/items', { body: { name: 'No price' } }).then(
      (response) => {
        expect(response.status).to.eq(422);
      },
    );
  });
});
