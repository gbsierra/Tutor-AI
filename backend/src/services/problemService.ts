import { DatabaseService } from './database.js';
import type { ProblemInstance } from '@local/shared/problem';

export interface UserAttempt {
  userId: string;
  moduleSlug: string;
  exerciseSlug: string;
  problem: ProblemInstance;
  userAnswer: any;
  correct: boolean | null; // Allow null for generated problems
  feedback?: string;
}

export class ProblemService {
  constructor(private db: DatabaseService) {}

  /**
   * Save a user's attempt at a problem
   */
  async saveAttempt(attempt: UserAttempt): Promise<void> {
    const query = `
      INSERT INTO user_attempts (
        user_id, module_slug, exercise_slug,
        problem_data, user_answer, correct, feedback
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await this.db.query(query, [
      attempt.userId,
      attempt.moduleSlug,
      attempt.exerciseSlug,
      JSON.stringify(attempt.problem),
      JSON.stringify(attempt.userAnswer),
      attempt.correct ?? false, // Convert null to false for database
      attempt.feedback || null
    ]);
  }

  /**
   * Get user's progress for a specific user
   */
  async getUserProgress(userId: string): Promise<any[]> {
    const rows = await this.db.query(`
      SELECT
        module_slug,
        exercise_slug,
        correct,
        feedback,
        created_at,
        problem_data,
        user_answer
      FROM user_attempts
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [userId]);

    return rows;
  }

  /**
   * Get progress summary for a user
   */
  async getProgressSummary(userId: string): Promise<{
    totalAttempts: number;
    correctAttempts: number;
    modulesAttempted: string[];
    recentActivity: any[];
  }> {
    const allAttempts = await this.getUserProgress(userId);

    const totalAttempts = allAttempts.length;
    const correctAttempts = allAttempts.filter(a => a.correct).length;
    const modulesAttempted = [...new Set(allAttempts.map(a => a.module_slug))];
    const recentActivity = allAttempts.slice(0, 10); // Last 10 attempts

    return {
      totalAttempts,
      correctAttempts,
      modulesAttempted,
      recentActivity
    };
  }

  /**
   * Get attempts for a specific module and user
   */
  async getModuleAttempts(userId: string, moduleSlug: string): Promise<any[]> {
    const rows = await this.db.query(`
      SELECT * FROM user_attempts
      WHERE user_id = $1 AND module_slug = $2
      ORDER BY created_at DESC
    `, [userId, moduleSlug]);

    return rows;
  }

  /**
   * Get statistics for a specific exercise
   */
  async getExerciseStats(userId: string, moduleSlug: string, exerciseSlug: string): Promise<{
    attempts: number;
    correct: number;
    accuracy: number;
    lastAttempt: any;
  }> {
    const rows = await this.db.query(`
      SELECT correct, created_at
      FROM user_attempts
      WHERE user_id = $1 AND module_slug = $2 AND exercise_slug = $3
      ORDER BY created_at DESC
    `, [userId, moduleSlug, exerciseSlug]);

    if (rows.length === 0) {
      return {
        attempts: 0,
        correct: 0,
        accuracy: 0,
        lastAttempt: null
      };
    }

    const attempts = rows.length;
    const correct = rows.filter(r => r.correct).length;
    const accuracy = Math.round((correct / attempts) * 100);

    return {
      attempts,
      correct,
      accuracy,
      lastAttempt: rows[0]
    };
  }

  /**
   * Get all existing problems for a specific exercise
   */
  async getExistingProblemsForExercise(userId: string, moduleSlug: string, exerciseSlug: string): Promise<Array<{
    id: string;
    problem: any;
    createdAt: Date;
    attemptCount: number;
    isAttempted: boolean;
    lastCorrect: boolean | null;
  }>> {
    // Get all attempts for this exercise, ordered by creation date (most recent first)
    const rows = await this.db.query(`
      SELECT
        problem_data,
        created_at,
        correct,
        COUNT(*) OVER (PARTITION BY problem_data->>'id') as attempt_count,
        MAX(CASE WHEN correct = true THEN created_at END) OVER (PARTITION BY problem_data->>'id') as last_correct_date
      FROM user_attempts
      WHERE user_id = $1 AND module_slug = $2 AND exercise_slug = $3
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId, moduleSlug, exerciseSlug]);

    // Group by problem ID to deduplicate and get the most recent attempt for each problem
    const problemMap = new Map();

    rows.forEach((row: any) => {
      const problemId = row.problem_data?.id;
      if (problemId && !problemMap.has(problemId)) {
        const isAttempted = true; // Problem has been attempted if it exists in the database
        problemMap.set(problemId, {
          id: problemId,
          problem: row.problem_data,
          createdAt: new Date(row.created_at),
          attemptCount: parseInt(row.attempt_count) || 1,
          isAttempted,
          lastCorrect: row.correct
        });
      }
    });

    return Array.from(problemMap.values());
  }

  /**
   * Clean up old attempts (optional maintenance)
   */
  async cleanupOldAttempts(daysOld: number = 90): Promise<number> {
    const result = await this.db.query(`
      DELETE FROM user_attempts
      WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    `);

    return (result as any).rowCount || 0;
  }

  /**
   * Get problem generation history for variation tracking
   */
  async getProblemGenerationHistory(userId: string, moduleSlug: string, exerciseSlug: string): Promise<{
    recentScenarios: string[];
    usedNumbers: number[];
    lastProblemType: string;
    variationSeed: number;
  }> {
    // Get recent problems for this exercise
    const rows = await this.db.query(`
      SELECT problem_data, created_at
      FROM user_attempts
      WHERE user_id = $1 AND module_slug = $2 AND exercise_slug = $3
      ORDER BY created_at DESC
      LIMIT 10
    `, [userId, moduleSlug, exerciseSlug]);

    const recentScenarios: string[] = [];
    const usedNumbers: number[] = [];
    let lastProblemType = '';

    rows.forEach((row: any) => {
      const problem = row.problem_data;
      if (problem?.stem) {
        // Extract scenario text from problem stem
        const stemText = problem.stem.map((block: any) => block.value || '').join(' ');
        if (stemText.length > 0) {
          recentScenarios.push(stemText.substring(0, 100)); // First 100 chars
        }
      }

      // Extract numbers from problem data
      if (problem?.engineState) {
        const engineState = problem.engineState;
        // Look for common number patterns in engine state
        Object.values(engineState).forEach((value: any) => {
          if (typeof value === 'number') {
            usedNumbers.push(value);
          } else if (typeof value === 'string' && /^\d+$/.test(value)) {
            usedNumbers.push(parseInt(value));
          }
        });
      }

      if (problem?.kind) {
        lastProblemType = problem.kind;
      }
    });

    // Generate variation seed based on user ID and exercise
    const variationSeed = this.generateVariationSeed(userId, moduleSlug, exerciseSlug);

    return {
      recentScenarios: recentScenarios.slice(0, 5), // Keep last 5 scenarios
      usedNumbers: [...new Set(usedNumbers)].slice(0, 10), // Unique numbers, max 10
      lastProblemType,
      variationSeed
    };
  }

  /**
   * Generate a consistent variation seed for a user/exercise combination
   */
  private generateVariationSeed(userId: string, moduleSlug: string, exerciseSlug: string): number {
    const seedString = `${userId}-${moduleSlug}-${exerciseSlug}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      const char = seedString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000; // Return 0-999
  }

  /**
   * Get comprehensive review data for a specific module
   * Returns data organized by exercises with statistics
   */
  async getModuleReviewData(userId: string, moduleSlug: string): Promise<any> {
    // Get all attempts for this module
    const attempts = await this.getModuleAttempts(userId, moduleSlug);
    
    if (attempts.length === 0) {
      return null; // No attempts for this module
    }

    // Group attempts by exercise
    const exerciseMap = new Map();
    let totalModuleAttempts = 0;
    let totalCorrect = 0;

    attempts.forEach((attempt: any) => {
      const exerciseSlug = attempt.exercise_slug;
      
      if (!exerciseMap.has(exerciseSlug)) {
        exerciseMap.set(exerciseSlug, {
          title: exerciseSlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          attempts: 0,
          correct: 0,
          accuracy: 0,
          lastAttempt: null,
          recentAttempts: []
        });
      }

      const exercise = exerciseMap.get(exerciseSlug);
      exercise.attempts++;
      totalModuleAttempts++;
      
      if (attempt.correct) {
        exercise.correct++;
        totalCorrect++;
      }

      // Add to recent attempts (keep last 10)
      exercise.recentAttempts.unshift({
        timestamp: new Date(attempt.created_at),
        correct: attempt.correct,
        userAnswer: attempt.user_answer,
        feedback: attempt.feedback
      });

      // Keep only last 10 attempts per exercise
      if (exercise.recentAttempts.length > 10) {
        exercise.recentAttempts = exercise.recentAttempts.slice(0, 10);
      }

      // Update last attempt timestamp
      if (!exercise.lastAttempt || new Date(attempt.created_at) > exercise.lastAttempt) {
        exercise.lastAttempt = new Date(attempt.created_at);
      }
    });

    // Calculate accuracy for each exercise and overall
    const exercises: any = {};
    exerciseMap.forEach((exercise, slug) => {
      exercise.accuracy = exercise.attempts > 0 ? Math.round((exercise.correct / exercise.attempts) * 100) : 0;
      exercises[slug] = exercise;
    });

    const overallModuleAccuracy = totalModuleAttempts > 0 ? Math.round((totalCorrect / totalModuleAttempts) * 100) : 0;

    return {
      moduleSlug,
      moduleTitle: moduleSlug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      exercises,
      totalModuleAttempts,
      overallModuleAccuracy
    };
  }

}
