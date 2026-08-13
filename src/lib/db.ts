import Database from 'better-sqlite3';

const db = new Database('devjobs.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS saved_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    saved_at TEXT NOT NULL
  )
`);

export default db;