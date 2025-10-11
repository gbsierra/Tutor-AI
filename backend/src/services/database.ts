import { Pool, PoolClient } from 'pg';

/**
 * Database service for PostgreSQL operations
 * Handles connection pooling, queries, and health checks
 */
export class DatabaseService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Always enable SSL
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

    // Handle connection errors
    this.pool.on('error', (err: Error) => {
      console.error('Unexpected database error:', err);
    });
  }

  /**
   * Execute a query and return results
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Execute a transaction with multiple queries
   */
  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health check for database connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database connection info (for debugging)
   */
  getConnectionInfo(): { totalCount: number; idleCount: number; waitingCount: number } {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Gracefully close all connections
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export singleton instance for use throughout the app
export const db = new DatabaseService();
