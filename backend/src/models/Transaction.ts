import db from '../database';

export interface Transaction {
  id: number;
  user_id: number;
  encrypted_data: string;
  iv: string;
  category: string | null;
  amount_encrypted: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionCreateInput {
  user_id: number;
  encrypted_data: string;
  iv: string;
  category?: string;
  amount_encrypted: string;
  date: string;
}

export class TransactionModel {
  static create(data: TransactionCreateInput): Transaction {
    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, encrypted_data, iv, category, amount_encrypted, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.user_id,
      data.encrypted_data,
      data.iv,
      data.category || null,
      data.amount_encrypted,
      data.date
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): Transaction | undefined {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ?');
    return stmt.get(id) as Transaction | undefined;
  }

  static findByUserId(userId: number): Transaction[] {
    const stmt = db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC');
    return stmt.all(userId) as Transaction[];
  }

  static findByUserIdAndDateRange(userId: number, startDate: string, endDate: string): Transaction[] {
    const stmt = db.prepare(`
      SELECT * FROM transactions
      WHERE user_id = ? AND date BETWEEN ? AND ?
      ORDER BY date DESC
    `);
    return stmt.all(userId, startDate, endDate) as Transaction[];
  }

  static update(id: number, data: Partial<TransactionCreateInput>): Transaction | undefined {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.encrypted_data !== undefined) {
      fields.push('encrypted_data = ?');
      values.push(data.encrypted_data);
    }
    if (data.iv !== undefined) {
      fields.push('iv = ?');
      values.push(data.iv);
    }
    if (data.category !== undefined) {
      fields.push('category = ?');
      values.push(data.category);
    }
    if (data.amount_encrypted !== undefined) {
      fields.push('amount_encrypted = ?');
      values.push(data.amount_encrypted);
    }
    if (data.date !== undefined) {
      fields.push('date = ?');
      values.push(data.date);
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE transactions
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);
    return this.findById(id);
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static deleteByUserId(userId: number): number {
    const stmt = db.prepare('DELETE FROM transactions WHERE user_id = ?');
    const result = stmt.run(userId);
    return result.changes;
  }
}
