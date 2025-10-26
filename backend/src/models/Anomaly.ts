import db from '../database';

export interface Anomaly {
  id: number;
  user_id: number;
  transaction_id: number | null;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high';
  description: string | null;
  detected_at: string;
  acknowledged: boolean;
}

export interface AnomalyCreateInput {
  user_id: number;
  transaction_id?: number;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high';
  description?: string;
}

export class AnomalyModel {
  static create(data: AnomalyCreateInput): Anomaly {
    const stmt = db.prepare(`
      INSERT INTO anomalies (user_id, transaction_id, anomaly_type, severity, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.user_id,
      data.transaction_id || null,
      data.anomaly_type,
      data.severity,
      data.description || null
    );

    return this.findById(result.lastInsertRowid as number)!;
  }

  static findById(id: number): Anomaly | undefined {
    const stmt = db.prepare('SELECT * FROM anomalies WHERE id = ?');
    return stmt.get(id) as Anomaly | undefined;
  }

  static findByUserId(userId: number, limit: number = 50): Anomaly[] {
    const stmt = db.prepare(`
      SELECT * FROM anomalies
      WHERE user_id = ?
      ORDER BY detected_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit) as Anomaly[];
  }

  static findUnacknowledged(userId: number): Anomaly[] {
    const stmt = db.prepare(`
      SELECT * FROM anomalies
      WHERE user_id = ? AND acknowledged = 0
      ORDER BY detected_at DESC
    `);
    return stmt.all(userId) as Anomaly[];
  }

  static acknowledge(id: number): boolean {
    const stmt = db.prepare('UPDATE anomalies SET acknowledged = 1 WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  static delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM anomalies WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}
