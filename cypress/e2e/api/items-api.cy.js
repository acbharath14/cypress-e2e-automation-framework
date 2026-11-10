// API specs: one test per operation and outcome, so this file doubles as
// the blueprint for adding a new endpoint. The shape to copy:
//   1. happy path (success status + body)
//   2. unknown id (404) — one test, parameterized over every route that takes an id
//   3. invalid body (422) — one test, parameterized over every route that validates input
//   4. missing key (401) — once, since auth is one shared middleware
// Each test creates its own item, so tests never depend on each other
// or on run order.

function createItem(name, price) {
  return cy.apiRequest('POST', '/items', {
    body: { name, price },
  });
}

describe('items API', () => {
  it('reports healthy', () => {
    cy.apiRequest('GET', '/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('ok');
    });
  });

  it('creates an item and returns it with an id', () => {
    createItem('Widget', 9.99).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.id).to.be.a('number');
      expect(response.body.name).to.eq('Widget');
      expect(response.body.price).to.eq(9.99);
    });
  });

  it('lists created items', () => {
    createItem('Widget', 9.99).then((response) => {
      const id = response.body.id;
      cy.apiRequest('GET', '/items').then((list) => {
        expect(list.status).to.eq(200);
        expect(list.body.map((item) => item.id)).to.include(id);
      });
    });
  });

  it('returns a single item by id', () => {
    createItem('Widget', 9.99).then((response) => {
      const id = response.body.id;
      cy.apiRequest('GET', `/items/${id}`).then((found) => {
        expect(found.status).to.eq(200);
        expect(found.body.name).to.eq('Widget');
        expect(found.body.price).to.eq(9.99);
      });
    });
  });

  // One behavior (unknown ids are rejected), one row per id route.
  const unknownIdCases = [
    { method: 'GET', options: {} },
    {
      method: 'PUT',
      options: { body: { name: 'Widget Pro', price: 14.99 } },
    },
    { method: 'PATCH', options: { body: { price: 12.99 } } },
    { method: 'DELETE', options: {} },
  ];

  unknownIdCases.forEach(({ method, options }) => {
    it(`returns 404 when ${method} targets an unknown item`, () => {
      cy.apiRequest(method, '/items/999999', options).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  it('replaces an item with PUT', () => {
    createItem('Widget', 9.99).then((response) => {
      const id = response.body.id;
      cy.apiRequest('PUT', `/items/${id}`, {
        body: { name: 'Widget Pro', price: 14.99 },
      }).then((updated) => {
        expect(updated.status).to.eq(200);
        expect(updated.body.name).to.eq('Widget Pro');
        expect(updated.body.price).to.eq(14.99);
      });
    });
  });

  // One behavior (invalid payloads are rejected), one row per route+payload.
  // The PATCH empty-body case stays a separate test: that is the distinct
  // 'nothing to update' rule, not the invalid-payload rule.
  const invalidPayloadCases = [
    {
      label: 'creating with a missing name',
      method: 'POST',
      path: '/items',
      body: {},
    },
    {
      label: 'creating with an empty name',
      method: 'POST',
      path: '/items',
      body: { name: '', price: 9.99 },
    },
    {
      label: 'creating with a missing price',
      method: 'POST',
      path: '/items',
      body: { name: 'No price' },
    },
    {
      label: 'creating with a string price',
      method: 'POST',
      path: '/items',
      body: { name: 'Widget', price: 'free' },
    },
    {
      label: 'PUT with a string price',
      method: 'PUT',
      body: { name: 'Widget Pro', price: 'free' },
      needsItem: true,
    },
    {
      label: 'PATCH with a string price',
      method: 'PATCH',
      body: { price: 'free' },
      needsItem: true,
    },
  ];

  invalidPayloadCases.forEach(({ label, method, path, body, needsItem }) => {
    it(`returns 422 when ${label}`, () => {
      const assertInvalid = (response) => {
        expect(response.status).to.eq(422);
      };
      if (needsItem) {
        createItem('Widget', 9.99).then((response) => {
          cy.apiRequest(method, `/items/${response.body.id}`, { body }).then(
            assertInvalid,
          );
        });
      } else {
        cy.apiRequest(method, path, { body }).then(assertInvalid);
      }
    });
  });

  it('updates only the given fields with PATCH', () => {
    createItem('Widget', 9.99).then((response) => {
      const id = response.body.id;
      cy.apiRequest('PATCH', `/items/${id}`, {
        body: { price: 12.99 },
      }).then((updated) => {
        expect(updated.status).to.eq(200);
        expect(updated.body.price).to.eq(12.99);
        expect(updated.body.name).to.eq('Widget');
      });
    });
  });

  it('returns 422 when PATCH has nothing to update', () => {
    createItem('Widget', 9.99).then((response) => {
      const id = response.body.id;
      cy.apiRequest('PATCH', `/items/${id}`, { body: {} }).then((invalid) => {
        expect(invalid.status).to.eq(422);
      });
    });
  });

  it('deletes an item and it stays deleted', () => {
    createItem('Widget', 9.99).then((response) => {
      const id = response.body.id;
      cy.apiRequest('DELETE', `/items/${id}`).then((deleted) => {
        expect(deleted.status).to.eq(200);
        expect(deleted.body.deleted).to.eq(id);
      });
      cy.apiRequest('GET', `/items/${id}`).then((gone) => {
        expect(gone.status).to.eq(404);
      });
    });
  });

  it('rejects requests without an API key', () => {
    cy.apiRequest('GET', '/items', { apiKey: null }).then((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
