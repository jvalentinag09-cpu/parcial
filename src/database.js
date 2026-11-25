// Usa el SQLite incluido en Node.js 22.5+ (no requiere compilar nada).
const { DatabaseSync } = require('node:sqlite');

// Componente de base de datos: abre el archivo y crea las tablas si no existen.
// Un plan tiene muchos aportes. Si se borra el plan, se borran sus aportes.
function createDatabase(dbPath) {
  const db = new DatabaseSync(dbPath);

  db.exec('PRAGMA foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS plans (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre        TEXT    NOT NULL,
      meta          REAL    NOT NULL,
      fecha_limite  TEXT    NOT NULL,
      created_at    TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS aportes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id     INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      integrante  TEXT    NOT NULL,
      monto       REAL    NOT NULL,
      fecha       TEXT    NOT NULL
    );
  `);

  return db;
}

module.exports = { createDatabase };
