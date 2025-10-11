import { DatabaseService } from './database.js';

export interface RecentExercise {
  userId: string;
  moduleSlug: string;
  exerciseSlug: string;
  exerciseTitle: string;
  lastVisited: Date;
}

export class RecentExercisesService {
  constructor(private db: DatabaseService) {}

  /**
   * Add or update a recent exercise for a user
   */
  async addRecentExercise(
    userId: string,
    moduleSlug: string,
    exerciseSlug: string,
    exerciseTitle: string
  ): Promise<void> {
    const query = `
      INSERT INTO user_recent_exercises (user_id, module_slug, exercise_slug, exercise_title, last_visited)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, module_slug, exercise_slug)
      DO UPDATE SET
        exercise_title = EXCLUDED.exercise_title,
        last_visited = EXCLUDED.last_visited
    `;

    await this.db.query(query, [userId, moduleSlug, exerciseSlug, exerciseTitle]);
  }

  /**
   * Get recent exercises for a user, optionally filtered by module
   */
  async getRecentExercises(userId: string, moduleSlug?: string): Promise<RecentExercise[]> {
    let query = `
      SELECT user_id, module_slug, exercise_slug, exercise_title, last_visited
      FROM user_recent_exercises
      WHERE user_id = $1
    `;
    const params: any[] = [userId];

    if (moduleSlug) {
      query += ` AND module_slug = $2`;
      params.push(moduleSlug);
    }

    query += ` ORDER BY last_visited DESC LIMIT 10`;

    const rows = await this.db.query(query, params);
    return rows.map((row: any) => ({
      userId: row.user_id,
      moduleSlug: row.module_slug,
      exerciseSlug: row.exercise_slug,
      exerciseTitle: row.exercise_title,
      lastVisited: new Date(row.last_visited)
    }));
  }

  /**
   * Remove a specific recent exercise for a user
   */
  async removeRecentExercise(
    userId: string,
    moduleSlug: string,
    exerciseSlug: string
  ): Promise<void> {
    const query = `
      DELETE FROM user_recent_exercises
      WHERE user_id = $1 AND module_slug = $2 AND exercise_slug = $3
    `;

    await this.db.query(query, [userId, moduleSlug, exerciseSlug]);
  }

  /**
   * Clear all recent exercises for a user
   */
  async clearRecentExercises(userId: string): Promise<void> {
    const query = `DELETE FROM user_recent_exercises WHERE user_id = $1`;
    await this.db.query(query, [userId]);
  }
}
