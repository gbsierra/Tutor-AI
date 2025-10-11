import { DatabaseService } from './database.js';
import { db } from './database.js';
import type { DatabaseVisualizationRow } from '../types/database.js';

export interface LessonVisualization {
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  visualizationType: string;
  visualizationData: any;
  userSessionId?: string;
}

export interface VisualizationQuery {
  moduleSlug: string;
  lessonSlug: string;
  userSessionId?: string;
}

export class VisualizationService {
  constructor(private db: DatabaseService) {}

  /**
   * Save a lesson visualization
   */
  async saveVisualization(visualization: LessonVisualization): Promise<void> {
    console.log(`💾 [saveVisualization] Saving visualization for ${visualization.moduleSlug}/${visualization.lessonSlug}`);

    const query = `
      INSERT INTO lesson_visualizations (
        module_slug, lesson_slug, lesson_title,
        visualization_type, visualization_data, user_session_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (module_slug, lesson_slug)
      DO UPDATE SET
        visualization_data = EXCLUDED.visualization_data,
        visualization_type = EXCLUDED.visualization_type,
        lesson_title = EXCLUDED.lesson_title,
        updated_at = NOW()
    `;

    await this.db.query(query, [
      visualization.moduleSlug,
      visualization.lessonSlug,
      visualization.lessonTitle,
      visualization.visualizationType,
      JSON.stringify(visualization.visualizationData),
      visualization.userSessionId || null
    ]);

    console.log(`💾 [saveVisualization] Visualization saved successfully`);
  }

  /**
   * Get a lesson visualization
   */
  async getVisualization(params: VisualizationQuery): Promise<DatabaseVisualizationRow | null> {
    console.log(`🔍 [getVisualization] Looking for visualization: ${params.moduleSlug}/${params.lessonSlug}`);

    const query = `
      SELECT * FROM lesson_visualizations
      WHERE module_slug = $1 AND lesson_slug = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const rows = await this.db.query<DatabaseVisualizationRow>(query, [
      params.moduleSlug,
      params.lessonSlug
    ]);

    if (rows.length > 0) {
      console.log(`🔍 [getVisualization] Found visualization: ${rows[0]!.id}`);
      return rows[0]!;
    }

    console.log(`🔍 [getVisualization] No visualization found`);
    return null;
  }

  /**
   * Get all visualizations for a module
   */
  async getModuleVisualizations(moduleSlug: string, userSessionId?: string): Promise<DatabaseVisualizationRow[]> {
    const conditions = ['module_slug = $1'];
    const params = [moduleSlug];

    if (userSessionId) {
      conditions.push('user_session_id = $2');
      params.push(userSessionId);
    } else {
      conditions.push('user_session_id IS NULL');
    }

    const query = `
      SELECT * FROM lesson_visualizations
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
    `;

    return await this.db.query<DatabaseVisualizationRow>(query, params);
  }

  /**
   * Delete a lesson visualization
   */
  async deleteVisualization(moduleSlug: string, lessonSlug: string, userSessionId?: string): Promise<boolean> {
    console.log(`🗑️ [deleteVisualization] Deleting visualization for ${moduleSlug}/${lessonSlug}`);

    const conditions = ['module_slug = $1', 'lesson_slug = $2'];
    const params = [moduleSlug, lessonSlug];

    if (userSessionId) {
      conditions.push('user_session_id = $3');
      params.push(userSessionId);
    } else {
      conditions.push('user_session_id IS NULL');
    }

    const query = `
      DELETE FROM lesson_visualizations
      WHERE ${conditions.join(' AND ')}
    `;

    const result = await this.db.query(query, params);
    const deleted = (result as any).rowCount > 0;

    console.log(`🗑️ [deleteVisualization] Deleted: ${deleted}`);
    return deleted;
  }



  /**
   * Clean up old visualizations (optional maintenance)
   */
  async cleanupOldVisualizations(daysOld: number = 90): Promise<number> {
    console.log(`🧹 [cleanupOldVisualizations] Cleaning up visualizations older than ${daysOld} days`);

    const result = await this.db.query(`
      DELETE FROM lesson_visualizations
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `);

    const deleted = (result as any).rowCount || 0;
    console.log(`🧹 [cleanupOldVisualizations] Cleaned up ${deleted} old visualizations`);

    return deleted;
  }

  /**
   * Get visualization statistics
   */
  async getVisualizationStats(): Promise<{
    totalVisualizations: number;
    visualizationsByType: Record<string, number>;
    recentActivity: any[];
  }> {
    // Get total count
    const totalResult = await this.db.query(`
      SELECT COUNT(*) as count FROM lesson_visualizations
    `);
    const totalVisualizations = parseInt(totalResult[0].count);

    // Get count by type
    const typeResult = await this.db.query(`
      SELECT visualization_type, COUNT(*) as count
      FROM lesson_visualizations
      GROUP BY visualization_type
      ORDER BY count DESC
    `);

    const visualizationsByType: Record<string, number> = {};
    typeResult.forEach((row: any) => {
      visualizationsByType[row.visualization_type] = parseInt(row.count);
    });

    // Get recent activity
    const recentActivity = await this.db.query(`
      SELECT module_slug, lesson_slug, visualization_type, created_at
      FROM lesson_visualizations
      ORDER BY created_at DESC
      LIMIT 10
    `);

    return {
      totalVisualizations,
      visualizationsByType,
      recentActivity
    };
  }
}

// Export singleton instance
export const visualizationService = new VisualizationService(db);
