// Tiny in-memory items API for the Cypress API specs. Nothing here is
// persistent on purpose: every run starts with an empty store, so tests
// never depend on leftover state.
const express = require('express');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'test-key';

let items = [];
let nextId = 1;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/items', (req, res, next) => {
  if (req.header('x-api-key') !== API_KEY) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
});

function validateItem(body, partial) {
  if (!body || typeof body !== 'object') {
    return 'body must be an object';
  }
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.length === 0) {
      return 'name must be a non-empty string';
    }
  }
  if (!partial || body.price !== undefined) {
    if (typeof body.price !== 'number' || !Number.isFinite(body.price)) {
      return 'price must be a number';
    }
  }
  if (partial && body.name === undefined && body.price === undefined) {
    return 'nothing to update';
  }
  return null;
}

app.get('/items', (req, res) => {
  res.json(items);
});

app.post('/items', (req, res) => {
  const error = validateItem(req.body, false);
  if (error) {
    return res.status(422).json({ error });
  }
  const item = { id: nextId, name: req.body.name, price: req.body.price };
  nextId += 1;
  items.push(item);
  return res.status(201).json(item);
});

app.get('/items/:id', (req, res) => {
  const item = items.find((entry) => entry.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'not found' });
  }
  return res.json(item);
});

app.put('/items/:id', (req, res) => {
  const item = items.find((entry) => entry.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'not found' });
  }
  const error = validateItem(req.body, false);
  if (error) {
    return res.status(422).json({ error });
  }
  item.name = req.body.name;
  item.price = req.body.price;
  return res.json(item);
});

app.patch('/items/:id', (req, res) => {
  const item = items.find((entry) => entry.id === Number(req.params.id));
  if (!item) {
    return res.status(404).json({ error: 'not found' });
  }
  const error = validateItem(req.body, true);
  if (error) {
    return res.status(422).json({ error });
  }
  if (req.body.name !== undefined) {
    item.name = req.body.name;
  }
  if (req.body.price !== undefined) {
    item.price = req.body.price;
  }
  return res.json(item);
});

app.delete('/items/:id', (req, res) => {
  const index = items.findIndex((entry) => entry.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'not found' });
  }
  const [deleted] = items.splice(index, 1);
  return res.json({ deleted: deleted.id });
});

app.listen(PORT, () => {
  console.log(`stub-api listening on http://localhost:${PORT}`);
});

module.exports = app;
