import express from 'express';
import { validateClient } from '../utils/validation.js';

const router = express.Router();

function serializeClient(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    nif_cif: row.nif_cif,
    direccion: row.direccion,
    email: row.email,
    tipo: row.tipo,
    created_at: row.created_at,
  };
}

router.get('/clients', (req, res) => {
  const rows = req.db.prepare('SELECT * FROM clients ORDER BY id').all();
  res.json(rows.map(serializeClient));
});

router.get('/clients/:id', (req, res) => {
  const client = req.db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  res.json(serializeClient(client));
});

router.post('/clients', (req, res) => {
  const error = validateClient(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { nombre, nif_cif = null, direccion = null, email = null, tipo } = req.body;
  const result = req.db
    .prepare(
      'INSERT INTO clients (nombre, nif_cif, direccion, email, tipo) VALUES (?, ?, ?, ?, ?)'
    )
    .run(nombre.trim(), nif_cif, direccion, email, tipo);
  const created = req.db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(serializeClient(created));
});

router.put('/clients/:id', (req, res) => {
  const existing = req.db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  const error = validateClient(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { nombre, nif_cif = null, direccion = null, email = null, tipo } = req.body;
  req.db
    .prepare(
      'UPDATE clients SET nombre = ?, nif_cif = ?, direccion = ?, email = ?, tipo = ? WHERE id = ?'
    )
    .run(nombre.trim(), nif_cif, direccion, email, tipo, req.params.id);
  const updated = req.db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  res.json(serializeClient(updated));
});

router.delete('/clients/:id', (req, res) => {
  const existing = req.db.prepare('SELECT id FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Cliente no encontrado' });
  }
  req.db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
