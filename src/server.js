import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db from './db/connection.js';
import { applySchema } from './db/schema.js';
import profileRouter from './routes/profile.js';
import servicesRouter from './routes/services.js';
import clientsRouter from './routes/clients.js';
import budgetsRouter from './routes/budgets.js';
import budgetLinesRouter from './routes/budget-lines.js';
import pdfRouter from './routes/pdf.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

applySchema(db);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', profileRouter);
app.use('/api', servicesRouter);
app.use('/api', clientsRouter);
app.use('/api', budgetsRouter);
app.use('/api', budgetLinesRouter);
app.use('/api', pdfRouter);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const STORAGE_CODES = ['SQLITE_FULL', 'SQLITE_READONLY', 'SQLITE_CORRUPT', 'SQLITE_IOERR', 'SQLITE_LOCKED', 'SQLITE_BUSY', 'SQLITE_CANTOPEN', 'SQLITE_PERM'];

function isStorageError(err) {
  const code = String(err.code || '');
  const message = String(err.message || '');
  if (STORAGE_CODES.includes(code)) return true;
  return /disk i\/o|no space|readonly database|unable to open database file|database or disk is full|disk full|database is corrupted/i.test(
    message
  );
}

app.use((err, req, res, next) => {
  if (isStorageError(err)) {
    return res.status(500).json({
      error:
        'No se pudieron guardar los datos. Comprueba que hay espacio disponible en el disco.',
    });
  }
  res.status(500).json({ error: 'Error interno del servidor' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`PresupuestosPro escuchando en http://localhost:${PORT}`);
  });
}

export default app;
