#!/usr/bin/env tsx

/**
 * Database reset script
 * Clears all data from tables while preserving table structure and indexes
 * Uses the same DATABASE_URL as the main application
 */

import 'dotenv/config';
import { DatabaseService } from '../src/services/database.js';
import { ModuleService } from '../src/services/moduleService.js';

async function resetDatabase() {
  const db = new DatabaseService();
  const moduleService = new ModuleService(db);

  console.log('🗑️  Resetting Statistics Tutor database...');
  console.log('📍 Using DATABASE_URL from environment variables');

  try {
    // Clear visualization data first (due to foreign key constraints)
    console.log('🎨 Clearing lesson visualizations...');
    await db.query('DELETE FROM lesson_visualizations');

    // Clear user attempts and recent exercises
    console.log('📊 Clearing user attempts...');
    await db.query('DELETE FROM user_attempts');
    
    console.log('📊 Clearing user recent exercises...');
    await db.query('DELETE FROM user_recent_exercises');

    // Clear photo attribution data (referenced by users)
    console.log('📸 Clearing user contributions...');
    await db.query('DELETE FROM user_contributions');
    
    console.log('📷 Clearing photos...');
    await db.query('DELETE FROM photos');
    
    console.log('📸 Clearing photo groups...');
    await db.query('DELETE FROM photo_groups');

    // Clear modules (referenced by attempts and photo groups)
    console.log('📚 Clearing modules...');
    await db.query('DELETE FROM modules');

    // Clear concepts (referenced by modules)
    console.log('🧠 Clearing concepts...');
    await db.query('DELETE FROM concepts');

    // Update discipline module counts to 0
    console.log('📊 Resetting discipline module counts...');
    await moduleService.updateAllDisciplineModuleCounts();

    // Clear users (now safe to delete)
    console.log('👤 Clearing users...');
    await db.query('DELETE FROM users');

    // Clear user sessions
    console.log('👤 Clearing user sessions...');
    await db.query('DELETE FROM user_sessions');

    // Reset sequences to start from 1
    console.log('🔄 Resetting auto-increment sequences...');
    await db.query('ALTER SEQUENCE IF EXISTS modules_id_seq RESTART WITH 1').catch(() => {
      // Sequence might not exist, ignore
    });
    await db.query('ALTER SEQUENCE IF EXISTS user_sessions_id_seq RESTART WITH 1').catch(() => {
      // Sequence might not exist, ignore
    });
    await db.query('ALTER SEQUENCE IF EXISTS user_attempts_id_seq RESTART WITH 1').catch(() => {
      // Sequence might not exist, ignore
    });
    await db.query('ALTER SEQUENCE IF EXISTS lesson_visualizations_id_seq RESTART WITH 1').catch(() => {
      // Sequence might not exist, ignore
    });

    console.log('✅ Database reset complete!');
    console.log('📊 Tables cleared:');
    console.log('   • lesson_visualizations: All visualization data removed');
    console.log('   • user_attempts: All exercise attempts removed');
    console.log('   • user_recent_exercises: All recent exercise records removed');
    console.log('   • user_contributions: All user contribution records removed');
    console.log('   • photos: All photo records removed');
    console.log('   • photo_groups: All photo group records removed');
    console.log('   • modules: All course modules removed');
    console.log('   • concepts: All concept data removed');
    console.log('   • users: All user accounts removed');
    console.log('   • user_sessions: All session data removed');
    console.log('📊 Discipline module counts reset to 0');
    console.log('🔄 Sequences reset to start from 1');
    console.log('📋 Table structure and indexes preserved');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    console.error('💡 Make sure:');
    console.error('   • DATABASE_URL environment variable is set');
    console.error('   • Database server is running');
    console.error('   • You have proper database permissions');
    throw error;
  } finally {
    await db.close();
  }
}

// Run reset when called via npm script OR directly
if (process.argv[1]?.includes('reset-db.ts') || import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase().catch((error) => {
    console.error('Reset failed:', error);
    process.exit(1);
  });
} else {
  // Only show help when NOT called as the main script
  console.log('\n🗑️  Database Reset Script');
  console.log('Clears all data while preserving table structure');
  console.log('\n💡 To run this script, use: npm run reset-db');
  console.log('   Or run directly: tsx scripts/reset-db.ts');
  console.log('\n⚠️  WARNING: This will delete ALL data from:');
  console.log('   • modules (your course content)');
  console.log('   • user_attempts (exercise history)');
  console.log('   • user_recent_exercises (recent exercise records)');
  console.log('   • lesson_visualizations (saved charts)');
  console.log('   • user_contributions (user contribution records)');
  console.log('   • photos (uploaded photos)');
  console.log('   • photo_groups (photo group records)');
  console.log('   • concepts (concept data)');
  console.log('   • users (user accounts)');
  console.log('   • user_sessions (session data)');
}
