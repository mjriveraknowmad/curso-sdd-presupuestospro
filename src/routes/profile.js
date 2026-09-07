import express from 'express';
import { validateProfile } from '../utils/validation.js';

const router = express.Router();

function serializeProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    nif: row.nif,
    direccion: row.direccion,
    telefono: row.telefono,
    email: row.email,
    logo: row.logo,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

router.get('/profile', (req, res) => {
  const profile = req.db.prepare('SELECT * FROM freelancer WHERE id = 1').get();
  res.json(serializeProfile(profile));
});

router.get('/profile/complete', (req, res) => {
  const profile = req.db.prepare('SELECT * FROM freelancer WHERE id = 1').get();
  const complete = Boolean(
    profile &&
      profile.nombre?.trim() &&
      profile.nif?.trim() &&
      profile.direccion?.trim() &&
      profile.telefono?.trim() &&
      profile.email?.trim()
  );
  res.json({ complete });
});

router.put('/profile', (req, res) => {
  const error = validateProfile(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const { nombre, nif, direccion, telefono, email, logo = null } = req.body;
  const existing = req.db.prepare('SELECT id FROM freelancer WHERE id = 1').get();
  if (existing) {
    req.db
      .prepare(
        `UPDATE freelancer
         SET nombre = ?, nif = ?, direccion = ?, telefono = ?, email = ?,
             logo = ?, updated_at = datetime('now')
         WHERE id = 1`
      )
      .run(nombre.trim(), nif.trim(), direccion.trim(), telefono.trim(), email.trim(), logo);
  } else {
    req.db
      .prepare(
        `INSERT INTO freelancer (id, nombre, nif, direccion, telefono, email, logo)
         VALUES (1, ?, ?, ?, ?, ?, ?)`
      )
      .run(nombre.trim(), nif.trim(), direccion.trim(), telefono.trim(), email.trim(), logo);
  }
  const updated = req.db.prepare('SELECT * FROM freelancer WHERE id = 1').get();
  res.json(serializeProfile(updated));
});

export default router;
