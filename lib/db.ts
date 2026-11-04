import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Ensure data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "ats.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma("journal_mode = WAL");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name TEXT,
    raw_text TEXT NOT NULL,
    parsed_json TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    resume_id TEXT,
    target_role TEXT NOT NULL,
    gap_report_json TEXT,
    ats_score INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(resume_id) REFERENCES resumes(id) ON DELETE CASCADE
  );
`);

export interface UserRecord {
  id: string;
  email: string;
  created_at: string;
}

/**
 * Hash password using Node's standard crypto.scrypt
 */
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

/**
 * Create a new user in SQLite
 */
export function createUser(email: string, password: string): UserRecord {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const id = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const insert = db.prepare(
    "INSERT INTO users (id, email, password_hash, salt) VALUES (?, ?, ?, ?)"
  );
  insert.run(id, email, passwordHash, salt);

  return { id, email, created_at: new Date().toISOString() };
}

/**
 * Verify user credentials against SQLite
 */
export function verifyUser(email: string, password: string): UserRecord | null {
  const row = db.prepare(
    "SELECT id, email, password_hash, salt, created_at FROM users WHERE email = ?"
  ).get(email) as any;

  if (!row) return null;

  const inputHash = hashPassword(password, row.salt);
  const isValid = crypto.timingSafeEqual(
    Buffer.from(inputHash, "hex"),
    Buffer.from(row.password_hash, "hex")
  );

  if (!isValid) return null;

  return { id: row.id, email: row.email, created_at: row.created_at };
}

/**
 * Create a new persistent session token
 */
export function createSession(userId: string): string {
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  db.prepare(
    "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
  ).run(id, userId, token, expiresAt);

  return token;
}

/**
 * Retrieve user by valid session token
 */
export function getSessionUser(token: string): UserRecord | null {
  if (!token) return null;

  const row = db.prepare(`
    SELECT u.id, u.email, u.created_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
  `).get(token) as any;

  if (!row) return null;
  return { id: row.id, email: row.email, created_at: row.created_at };
}

/**
 * Delete session on logout
 */
export function deleteSession(token: string): void {
  if (!token) return;
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export default db;

