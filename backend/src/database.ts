import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './data/finance.db';
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables
const initDb = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Transactions table - stores encrypted transaction data
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      encrypted_data TEXT NOT NULL,
      iv TEXT NOT NULL,
      category TEXT,
      amount_encrypted TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Anomalies table - stores detected spending anomalies
  db.exec(`
    CREATE TABLE IF NOT EXISTS anomalies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transaction_id INTEGER,
      anomaly_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      description TEXT,
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged BOOLEAN DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_anomalies_user_id ON anomalies(user_id);
    CREATE INDEX IF NOT EXISTS idx_anomalies_detected_at ON anomalies(detected_at);
  `);

  console.log('Database initialized successfully');
};

initDb();

export default db;
