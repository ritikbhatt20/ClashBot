import { pool } from '../config/database';
import { UserState } from '../types';

export class StateManager {
  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_states (
          user_id BIGINT PRIMARY KEY,
          action VARCHAR(255) NOT NULL,
          data JSONB,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  async getState(userId: number): Promise<UserState | undefined> {
    try {
      const result = await pool.query(
        'SELECT * FROM user_states WHERE user_id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting state:', error);
      return undefined;
    }
  }

  async setState(userId: number, newState: UserState): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO user_states (user_id, action, data)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id)
         DO UPDATE SET action = $2, data = $3, updated_at = CURRENT_TIMESTAMP`,
        [userId, newState.action, newState.data]
      );
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  async clearState(userId: number): Promise<void> {
    try {
      await pool.query('DELETE FROM user_states WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error clearing state:', error);
    }
  }

  async getAllState(): Promise<{ [userId: number]: UserState }> {
    try {
      const result = await pool.query('SELECT * FROM user_states');
      const states: { [userId: number]: UserState } = {};
      result.rows.forEach((row) => {
        states[row.user_id] = {
          action: row.action,
          data: row.data
        };
      });
      return states;
    } catch (error) {
      console.error('Error getting all states:', error);
      return {};
    }
  }
}
