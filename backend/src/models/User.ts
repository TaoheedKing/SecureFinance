import db from '../database';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
}

export class UserModel {
  static async create(data: UserCreateInput): Promise<User> {
    const passwordHash = await bcrypt.hash(data.password, 12);

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash)
      VALUES (?, ?)
    `);

    const result = stmt.run(data.email, passwordHash);

    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  }

  static findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static updateLastLogin(id: number): void {
    const stmt = db.prepare('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }
}
