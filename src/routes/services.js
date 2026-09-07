import express from 'express';
import { validateService } from '../utils/validation.js';

const router = express.Router();

function serializeService(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: row.precio,
    created_at: row.created_at,
  };
}

router.get('/services', (req, res) => {
  const rows = req.db.prepare('SELECT * FROM services ORDER BY id').all();
  res.json(rows.map(serializeService));
});

router.get('/services/:id', (req, res) => {
  const service = req.db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }
  res.json(serializeService(service));
});

router.post('/services', (req, res) => {
  const error = validateService(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { nombre, precio } = req.body;
  const result = req.db
    .prepare('INSERT INTO services (nombre, precio) VALUES (?, ?)')
    .run(nombre.trim(), Number(precio));
  const created = req.db.prepare('SELECT * FROM services WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(serializeService(created));
});

router.put('/services/:id', (req, res) => {
  const existing = req.db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }
  const error = validateService(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { nombre, precio } = req.body;
  req.db
    .prepare('UPDATE services SET nombre = ?, precio = ? WHERE id = ?')
    .run(nombre.trim(), Number(precio), req.params.id);
  const updated = req.db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json(serializeService(updated));
});

router.delete('/services/:id', (req, res) => {
  const existing = req.db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.id);
  if (!existing) {
    return res.status(404).json({ error: 'Servicio no encontrado' });
  }
  req.db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

export default router;
