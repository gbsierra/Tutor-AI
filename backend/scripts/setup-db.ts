#!/usr/bin/env tsx

/**
 * Database setup script
 * Creates all necessary tables and indexes for the Statistics Tutor
 */

import 'dotenv/config';
import { DatabaseService } from '../src/services/database.js';
import { DISCIPLINE_SEED_DATA } from '../../shared/disciplines.js';

async function setupDatabase() {
  const db = new DatabaseService();

  console.log('🚀 Setting up Statistics Tutor database...');

  try {
    // Create modules table
    console.log('📚 Creating modules table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR UNIQUE NOT NULL,
        title VARCHAR NOT NULL,
        description TEXT,
        lessons JSONB DEFAULT '[]'::jsonb,
        exercises JSONB DEFAULT '[]'::jsonb,
        tags TEXT[] DEFAULT '{}',
        course JSONB,
        draft BOOLEAN DEFAULT true,
        version VARCHAR DEFAULT 'v1',
        generation_context JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add generation_context column to existing tables (if they exist without it)
    console.log('🔧 Adding generation_context column to modules table...');
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS generation_context JSONB
    `);

    // Create users table
    console.log('👤 Creating users table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(500),
        display_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user sessions table
    console.log('👤 Creating user sessions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user attempts table
    console.log('📊 Creating user attempts table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        module_slug VARCHAR NOT NULL,
        exercise_slug VARCHAR NOT NULL,
        problem_data JSONB,
        user_answer JSONB,
        correct BOOLEAN,
        feedback TEXT,
        attempt_number INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Handle migration from old schema (session_id to user_id)
    console.log('🔄 Checking for old user_attempts schema...');
    try {
      // Check if the old session_id column exists
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_attempts' AND column_name = 'session_id'
      `);
      
      if (result.length > 0) {
        console.log('🔄 Found old schema with session_id, migrating to user_id...');
        // Drop the old table and recreate with new schema
        await db.query(`DROP TABLE IF EXISTS user_attempts CASCADE`);
        await db.query(`
          CREATE TABLE user_attempts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id),
            module_slug VARCHAR NOT NULL,
            exercise_slug VARCHAR NOT NULL,
            problem_data JSONB,
            user_answer JSONB,
            correct BOOLEAN,
            feedback TEXT,
            attempt_number INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT NOW()
          )
        `);
        console.log('✅ Migrated user_attempts table to new schema');
      }
    } catch (error) {
      console.log('ℹ️ No migration needed for user_attempts table');
    }

    // Create user recent exercises table
    console.log('🕒 Creating user recent exercises table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_recent_exercises (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        module_slug VARCHAR NOT NULL,
        exercise_slug VARCHAR NOT NULL,
        exercise_title VARCHAR NOT NULL,
        last_visited TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, module_slug, exercise_slug)
      )
    `);

    // Handle migration from old schema for user_recent_exercises if needed
    console.log('🔄 Checking for old user_recent_exercises schema...');
    try {
      // Check if the old session_id column exists
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'user_recent_exercises' AND column_name = 'session_id'
      `);
      
      if (result.length > 0) {
        console.log('🔄 Found old schema with session_id, migrating to user_id...');
        // Drop the old table and recreate with new schema
        await db.query(`DROP TABLE IF EXISTS user_recent_exercises CASCADE`);
        await db.query(`
          CREATE TABLE user_recent_exercises (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id),
            module_slug VARCHAR NOT NULL,
            exercise_slug VARCHAR NOT NULL,
            exercise_title VARCHAR NOT NULL,
            last_visited TIMESTAMP DEFAULT NOW(),
            UNIQUE(user_id, module_slug, exercise_slug)
          )
        `);
        console.log('✅ Migrated user_recent_exercises table to new schema');
      }
    } catch (error) {
      console.log('ℹ️ No migration needed for user_recent_exercises table');
    }

    // Create lesson visualizations table
    console.log('🎨 Creating lesson visualizations table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS lesson_visualizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        module_slug VARCHAR NOT NULL,
        lesson_slug VARCHAR NOT NULL,
        lesson_title VARCHAR NOT NULL,
        visualization_type VARCHAR NOT NULL,
        visualization_data JSONB NOT NULL,
        user_session_id VARCHAR REFERENCES user_sessions(session_id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create disciplines table first (referenced by photo_groups)
    console.log('📚 Creating disciplines table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS disciplines (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50),
        description TEXT,
        module_count INTEGER DEFAULT 0
      )
    `);

    // Create photo groups table
    console.log('📸 Creating photo groups table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS photo_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discipline_id VARCHAR(100) REFERENCES disciplines(id),
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create photos table
    console.log('📷 Creating photos table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        photo_group_id UUID REFERENCES photo_groups(id),
        uploaded_by UUID REFERENCES users(id),
        filename VARCHAR(255),
        file_size INTEGER,
        mime_type VARCHAR(100),
        url TEXT,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user contributions table
    console.log('👤 Creating user contributions table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_contributions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        contribution_type VARCHAR(50) NOT NULL,
        contribution_id UUID NOT NULL,
        contribution_data JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Update existing photos table url column to TEXT if it exists as VARCHAR(500)
    console.log('🔧 Updating photos url column to TEXT...');
    await db.query(`
      ALTER TABLE photos ALTER COLUMN url TYPE TEXT
    `).catch(() => {
      // Column might not exist yet, ignore
    });

    // Add discipline column to modules table
    console.log('🔗 Adding discipline column to modules table...');
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS discipline VARCHAR(100)
    `);

    // Add concept-related columns to modules table
    console.log('🏷️ Adding concept-related columns to modules table...');
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS concepts TEXT[] DEFAULT '{}'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS learning_outcomes TEXT[] DEFAULT '{}'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS estimated_time INTEGER
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'user-upload'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS source_institution VARCHAR(255)
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS contributor VARCHAR(255)
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS original_photos JSONB
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS consolidation JSONB
    `);

    // Add photo attribution columns to modules table
    console.log('📸 Adding photo attribution columns to modules table...');
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS photo_groups JSONB DEFAULT '[]'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS contributors JSONB DEFAULT '[]'
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS total_photos INTEGER DEFAULT 0
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id)
    `);
    await db.query(`
      ALTER TABLE modules ADD COLUMN IF NOT EXISTS last_updated_by UUID REFERENCES users(id)
    `);

    // Create concepts table
    console.log('🧠 Creating concepts table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS concepts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        discipline_id VARCHAR(100) REFERENCES disciplines(id),
        parent_concept_id INTEGER REFERENCES concepts(id),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create module-concepts relationship table
    console.log('🔗 Creating module-concepts relationship table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS module_concepts (
        module_id VARCHAR(255) REFERENCES modules(slug),
        concept_id INTEGER REFERENCES concepts(id),
        PRIMARY KEY (module_id, concept_id)
      )
    `);

    // Create concept prerequisites table
    console.log('📚 Creating concept prerequisites table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS concept_prerequisites (
        concept_id INTEGER REFERENCES concepts(id),
        prerequisite_concept_id INTEGER REFERENCES concepts(id),
        PRIMARY KEY (concept_id, prerequisite_concept_id)
      )
    `);

    // Create indexes for performance
    console.log('⚡ Creating performance indexes...');
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_draft ON modules(draft)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_slug ON modules(slug)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_created_at ON modules(created_at DESC)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    
    // Create user_attempts indexes with error handling
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_attempts_user ON user_attempts(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_attempts_module ON user_attempts(module_slug)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_attempts_created_at ON user_attempts(created_at DESC)`);
    } catch (error) {
      console.log('⚠️ Some user_attempts indexes may already exist, continuing...');
    }
    
    // Create user_recent_exercises indexes with error handling
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_recent_exercises_user ON user_recent_exercises(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_recent_exercises_module ON user_recent_exercises(module_slug)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_recent_exercises_last_visited ON user_recent_exercises(last_visited DESC)`);
    } catch (error) {
      console.log('⚠️ Some user_recent_exercises indexes may already exist, continuing...');
    }

    // Visualization table indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_viz_module_lesson ON lesson_visualizations(module_slug, lesson_slug)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_viz_session ON lesson_visualizations(user_session_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_viz_created_at ON lesson_visualizations(created_at DESC)`);

    // Discipline table indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_disciplines_category ON disciplines(category)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_discipline ON modules(discipline)`);

    // Concept table indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_concepts_discipline ON concepts(discipline_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_concepts_parent ON concepts(parent_concept_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_module_concepts_module ON module_concepts(module_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_module_concepts_concept ON module_concepts(concept_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_concept_prerequisites ON concept_prerequisites(concept_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_concepts_array ON modules USING GIN(concepts)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_prerequisites_array ON modules USING GIN(prerequisites)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_tags_array ON modules USING GIN(tags)`);

    // Photo attribution indexes
    console.log('📸 Creating photo attribution indexes...');
    await db.query(`CREATE INDEX IF NOT EXISTS idx_photo_groups_discipline ON photo_groups(discipline_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_photo_groups_created_by ON photo_groups(created_by)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_photo_groups_created_at ON photo_groups(created_at DESC)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_photos_group ON photos(photo_group_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON photos(uploaded_by)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_contributions_user ON user_contributions(user_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_contributions_type ON user_contributions(contribution_type)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_user_contributions_created_at ON user_contributions(created_at DESC)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_created_by ON modules(created_by)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_modules_last_updated_by ON modules(last_updated_by)`);

    // Unique constraint: one visualization per lesson (shared across all users)
    await db.query(`
      ALTER TABLE lesson_visualizations
      ADD CONSTRAINT unique_lesson_viz
      UNIQUE (module_slug, lesson_slug)
    `).catch((error) => {
      // Constraint might already exist, ignore error
      if (!error.message.includes('already exists')) {
        throw error;
      }
    });

    // Seed disciplines data
    console.log('🌱 Seeding disciplines data...');
    await seedDisciplines(db);

    // Update module counts for all disciplines
    console.log('🔢 Updating module counts...');
    await updateModuleCounts(db);

    console.log('✅ Database setup complete!');
    console.log('📈 Tables created: modules, users, user_sessions, user_attempts, lesson_visualizations, disciplines, concepts, module_concepts, concept_prerequisites, photo_groups, photos, user_contributions');
    console.log('🔍 Indexes created: 35+ performance indexes');
    console.log('📚 Disciplines seeded: 50+ academic disciplines');
    console.log('🎨 Visualization persistence ready!');
    console.log('🏫 Discipline system ready!');
    console.log('🧠 Concept-based learning system ready!');
    console.log('🔐 Google OAuth authentication ready!');
    console.log('📸 Photo attribution system ready!');
    console.log('👤 User contribution tracking ready!');
    console.log('🔢 Module counts updated!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Seed disciplines data
async function seedDisciplines(db: DatabaseService) {
  try {
    // Clear existing disciplines (optional - for fresh setup)
    await db.query('DELETE FROM disciplines');

    // Insert all disciplines
    for (const discipline of DISCIPLINE_SEED_DATA) {
      await db.query(`
        INSERT INTO disciplines (id, name, category, description, module_count)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [
        discipline.id,
        discipline.name,
        discipline.category,
        discipline.description,
        discipline.moduleCount
      ]);
    }

    console.log(`✅ Seeded ${DISCIPLINE_SEED_DATA.length} disciplines`);
  } catch (error) {
    console.error('❌ Failed to seed disciplines:', error);
    throw error;
  }
}

// Update module counts for all disciplines
async function updateModuleCounts(db: DatabaseService) {
  try {
    await db.query(`
      UPDATE disciplines
      SET module_count = (
        SELECT COUNT(*) FROM modules
        WHERE modules.discipline = disciplines.id AND modules.draft = false
      )
    `);

    console.log('✅ Updated module counts for all disciplines');
  } catch (error) {
    console.error('❌ Failed to update module counts:', error);
    throw error;
  }
}

// Run setup when called via npm script OR directly
if (process.argv[1]?.includes('setup-db.ts') || import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
} else {
  // Only show help when NOT called as the main script
  console.log('\n💡 To run this script, use: npm run setup-db');
  console.log('   Or run directly: tsx scripts/setup-db.ts');
}
