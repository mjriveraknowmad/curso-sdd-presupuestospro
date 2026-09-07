import { fileURLToPath } from 'node:url';

process.env.DB_PATH = fileURLToPath(new URL('./.test.db', import.meta.url));
process.env.NODE_ENV = 'test';
