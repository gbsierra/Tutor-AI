# Backend - Express API Server

> Node.js + Express + TypeScript API server with PostgreSQL, AI integration, and comprehensive learning platform services

## Overview

The backend is a robust Express.js API server that powers the Class Tutor learning platform. It provides AI-powered content generation, database persistence, and comprehensive learning management capabilities through a well-structured service architecture.

## Architecture

### Core Technologies
- **Node.js** - JavaScript runtime
- **Express 4.19.2** - Web framework
- **TypeScript 5.4.5** - Type safety
- **PostgreSQL** - Primary database
- **Multiple Providers** - AI/LLM integration
- **Zod 4.1.5** - Schema validation

### Key Features
- **AI-Powered Generation** - Module creation, problem generation, visualizations
- **YouTube Video Integration** - AI-generated search queries with lazy loading and caching
- **Database Integration** - PostgreSQL with connection pooling
- **Multi-Discipline Support** - 52 academic disciplines
- **Google OAuth Authentication** - Full user authentication system
- **User Management** - User profiles and contribution tracking
- **Photo Attribution** - Track user contributions to modules with contributor tags
- **Progress Tracking** - User attempt and progress persistence
- **Visualization System** - D3.js generation and persistence
- **Modular LLM Architecture** - Configurable AI providers

## 📁 Directory Structure

```
backend/src/
├── routes/               # API endpoint definitions (8 files)
│   ├── auth.ts           # Google OAuth authentication routes
│   ├── modulesPublic.ts  # Module and discipline APIs
│   ├── problems.ts       # Problem generation and grading
│   ├── simulations.ts    # D3.js visualization generation
│   ├── visualizations.ts # Visualization persistence
│   ├── youtube.ts        # YouTube video integration
│   ├── photoAttribution.ts # Photo attribution and user contributions
│   └── recentExercises.ts # Recent exercises API
├── services/             # Business logic layer (11 files)
│   ├── authService.ts    # Google OAuth authentication service
│   ├── database.ts       # PostgreSQL connection and queries
│   ├── moduleService.ts  # Module business logic and CRUD operations
│   ├── problemService.ts # Problem generation and grading service
│   ├── youtubeService.ts # YouTube Data API integration
│   ├── photoAttributionService.ts # Photo attribution and user contributions
│   ├── visualizationService.ts # Visualization persistence service
│   ├── modulePhotoIntegration.ts # Module-photo integration service
│   ├── recentExercisesService.ts # Recent exercises service
│   └── llm/              # LLM provider system (4 files)
│       ├── index.ts      # Provider selection and exports
│       ├── providers.ts  # Gemini/OpenAI implementations
│       ├── prompts.ts    # LLM prompts and templates
│       └── validation.ts # Response validation and JSON helpers
├── middleware/           # Express middleware (1 file)
│   └── auth.ts           # Authentication middleware
├── scripts/              # Database management (2 files)
│   ├── setup-db.ts       # Database initialization
│   └── reset-db.ts       # Database reset
├── types/                # TypeScript type definitions (2 files)
│   ├── database.ts       # Database-specific types
│   └── llm.ts            # LLM-specific types
└── index.ts              # Application entry point and server setup
```

## API Endpoints

### Authentication Strategy
The API uses a **hybrid authentication model**:
- **Public Endpoints**: No authentication required (most content is publicly accessible for learning)
- **Authenticated Endpoints**: Require `X-User-ID` header for user-specific operations

### Public Endpoints (No Authentication Required)

#### Module Management (`/api/modules`)
```typescript
POST   /api/modules/build-public  # Create module from photos (5 photo max)
GET    /api/modules               # List all published modules
GET    /api/modules/recent        # Get recent modules for landing page
GET    /api/modules/:slug         # Get specific module
```

#### Discipline System (`/api/disciplines`)
```typescript
GET    /api/disciplines           # List all disciplines (grouped by category)
GET    /api/disciplines/:id       # Get specific discipline
GET    /api/disciplines/:id/context    # Get discipline context for LLM
GET    /api/disciplines/:id/concepts  # Get discipline concepts
GET    /api/disciplines/:id/modules   # Get modules for discipline
```

#### Problem Generation (`/api/problems`)
```typescript
GET    /api/problems/ping         # Health check
POST   /api/problems/generate     # Generate new problem instance (supports all 6 exercise types)
```

#### Visualization System (`/api/simulations` & `/api/visualizations`)
```typescript
# Generation (Simulations)
GET    /api/simulations/d3-ping   # System health check
POST   /api/simulations/generate-d3 # Generate D3.js visualization (supports 8 visualization types)

# Persistence (Visualizations)
GET    /api/visualizations/:moduleSlug/:lessonSlug # Load visualization
GET    /api/visualizations/module/:moduleSlug      # Get module visualizations
GET    /api/visualizations/stats  # Get statistics
```

#### Search (`/api/search`)
```typescript
GET    /api/search?q=query&limit=10 # Search disciplines and modules
```

#### YouTube Video Integration (`/api/youtube`)
```typescript
POST   /api/youtube/attach-video/:moduleSlug/:lessonSlug # Attach YouTube video to lesson
```

#### Photo Attribution (Public)
```typescript
GET    /api/modules/:slug/contributors # Get contributors for a module
GET    /api/modules/:slug/photo-attributions # Get photo attributions for module
GET    /api/modules/:slug/photo-attributions-detailed # Get detailed photo attributions
```

#### System
```typescript
GET    /healthz                   # Health check with database status
```

### Authenticated Endpoints (Require `X-User-ID` Header)

#### Authentication (`/api/auth`)
```typescript
GET    /api/auth/google           # Redirect to Google OAuth
GET    /api/auth/google/callback  # Handle OAuth callback
GET    /api/auth/me               # Get current user info
POST   /api/auth/logout           # Logout user
```

#### Module Management (Authenticated)
```typescript
POST   /api/modules/build         # Create module from photos (authenticated version)
POST   /api/modules/publish       # Publish module to database (authenticated version)
```

#### Problem System (Authenticated)
```typescript
POST   /api/problems/grade        # Grade user submission (supports all 6 exercise types)
GET    /api/problems/existing     # Get existing problems for exercise
POST   /api/problems/save-generated # Save generated problem
GET    /api/problems/review/:moduleSlug # Get review data
```

#### Visualization System (Authenticated)
```typescript
POST   /api/visualizations        # Save visualization
DELETE /api/visualizations/:moduleSlug/:lessonSlug # Delete visualization
```

#### User Management (`/api/users/me/*`)
```typescript
GET    /api/users/me/contributions     # Get user contributions
GET    /api/users/me/modules           # Get modules user contributed to
GET    /api/users/me/photos            # Get photos user uploaded
PUT    /api/users/me                   # Update user profile
```

#### Recent Exercises (`/api/recent-exercises`)
```typescript
GET    /api/recent-exercises      # Get user's recent exercise attempts
POST   /api/recent-exercises      # Save exercise attempt
```

#### Photo Upload (`/api/photos`)
```typescript
POST   /api/photos/upload         # Upload photos for module creation
```

## 🗄️ Database Schema

### Core Tables

#### `modules` - Learning Module Storage
```sql
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  lessons JSONB,
  exercises JSONB,
  tags TEXT[],
  course JSONB,
  discipline VARCHAR,
  concepts TEXT[],
  prerequisites TEXT[],
  learning_outcomes TEXT[],
  estimated_time INTEGER,
  source_type VARCHAR,
  source_institution VARCHAR,
  contributor VARCHAR,
  original_photos JSONB,
  draft BOOLEAN DEFAULT false,
  version VARCHAR,
  generation_context JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `disciplines` - Academic Disciplines
```sql
CREATE TABLE disciplines (
  id VARCHAR PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  concepts TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_attempts` - Progress Tracking
```sql
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
);
```

#### `users` - User Accounts
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `photo_groups` - Photo Attribution
```sql
CREATE TABLE photo_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discipline_id VARCHAR(100) REFERENCES disciplines(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `photos` - Individual Photos
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_group_id UUID REFERENCES photo_groups(id),
  uploaded_by UUID REFERENCES users(id),
  filename VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  url TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_contributions` - User Contribution Tracking
```sql
CREATE TABLE user_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  contribution_type VARCHAR(50) NOT NULL,
  contribution_id UUID NOT NULL,
  contribution_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `lesson_visualizations` - Visualization Persistence
```sql
CREATE TABLE lesson_visualizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug VARCHAR NOT NULL,
  lesson_slug VARCHAR NOT NULL,
  lesson_title TEXT,
  visualization_type VARCHAR NOT NULL,
  visualization_data JSONB NOT NULL,
  user_session_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(module_slug, lesson_slug)
);
```

## AI Integration

### LLM Provider System

#### Supported Providers
- **Google Gemini 2.0 Flash** (Primary)
- **OpenAI GPT** (Alternative)
- **Anthropic Claude** (Planned)

#### Provider Configuration
```typescript
// Environment variable
LLM_PROVIDER=gemini  // or openai, anthropic

// Provider selection
const provider = getProvider();
const response = await provider.generateModule(photos, context);
```

### AI Capabilities

#### 1. Module Generation
- **Vision Analysis** - Analyzes lecture photos
- **Content Extraction** - Extracts text and structure
- **Discipline Selection** - AI chooses appropriate discipline
- **Lesson Creation** - Generates structured lessons
- **Exercise Generation** - Creates practice problems

#### 2. Problem Generation
- **Template-Based** - Uses ExerciseSpec templates
- **Context-Aware** - Considers module content
- **Six Exercise Types** - MCQ, Free Response, Fill-in-the-blank, Matching, True/False, Ordering
- **Variation** - Generates unique problems per user

#### 3. Visualization Generation
- **Content Analysis** - Analyzes lesson content
- **Type Selection** - Chooses optimal visualization type
- **D3.js Generation** - Creates interactive diagrams
- **8 Visualization Types** - Tree, cluster, force-directed, bar, line, scatter, pie, AI auto-selection

#### 4. Intelligent Grading
- **Contextual Assessment** - Considers problem context
- **Detailed Feedback** - Provides explanations
- **Learning Insights** - Identifies knowledge gaps

## Authentication & Middleware

### Authentication Middleware
The backend uses a simple but effective authentication system:

```typescript
// middleware/auth.ts
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Validate user exists in database
  const user = await databaseService.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user' });
  }
  
  req.user = user;
  next();
};
```

### Authentication Flow
1. **Frontend**: Sends `X-User-ID` header with user's UUID
2. **Backend**: Validates user exists in database
3. **Access**: Grants access to user-specific endpoints

### Public vs Authenticated Endpoints
- **Public**: Most content is publicly accessible for learning (modules, problems, visualizations)
- **Authenticated**: User-specific operations (contributions, progress, profile updates)

## Services Architecture

### Database Service
```typescript
export class DatabaseService {
  async query<T>(sql: string, params?: any[]): Promise<T[]>
  async healthCheck(): Promise<boolean>
  getConnectionInfo(): ConnectionInfo
}
```

### Module Service
```typescript
export class ModuleService {
  async getPublishedModules(): Promise<TModuleSpec[]>
  async getModuleBySlug(slug: string): Promise<TModuleSpec | null>
  async saveModule(module: TModuleSpec): Promise<void>
  async getDisciplineContext(disciplineId: string): Promise<DisciplineContext>
}
```

### Problem Service
```typescript
export class ProblemService {
  async saveAttempt(attempt: UserAttempt): Promise<void>
  async getUserProgress(sessionId: string): Promise<any[]>
  async getProgressSummary(sessionId: string): Promise<ProgressSummary>
  async getExistingProblemsForExercise(moduleSlug: string, exerciseSlug: string): Promise<ProblemInstance[]>
}
```

### Visualization Service
```typescript
export class VisualizationService {
  async saveVisualization(visualization: LessonVisualization): Promise<void>
  async getVisualization(params: VisualizationQuery): Promise<DatabaseVisualizationRow | null>
  async getModuleVisualizations(moduleSlug: string): Promise<DatabaseVisualizationRow[]>
  async deleteVisualization(moduleSlug: string, lessonSlug: string): Promise<boolean>
}
```

## Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- LLM API key

### Setup
```bash
cd backend
npm install

# Environment setup
cp .env.example .env
# Add your GEMINI_API_KEY and DATABASE_URL

# Database setup
npm run setup-db

# Start development server
npm run dev
```

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://user:pass@localhost:5432/class_tutor
YOUTUBE_API_KEY=your_youtube_api_key

# Optional
LLM_PROVIDER=gemini  # or openai
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run setup-db` - Initialize database with tables and seed data
- `npm run reset-db` - Reset database (clears all data)

## Database Management

### Initial Setup
```bash
npm run setup-db
```
Creates all tables and seeds 52 academic disciplines.

### Database Reset
```bash
npm run reset-db
```
Clears all data and resets auto-increment counters.

### Manual Database Access
```bash
# Connect to database
psql $DATABASE_URL

# View tables
\dt

# Query disciplines
SELECT * FROM disciplines LIMIT 5;

# Check visualizations
SELECT module_slug, lesson_slug, visualization_type FROM lesson_visualizations;
```

## Monitoring & Health Checks

### Health Check Endpoint
```bash
GET /healthz
```

Response:
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "api": "healthy"
  },
  "database": {
    "status": "connected",
    "connections": {
      "total": 1,
      "idle": 0,
      "waiting": 0
    }
  }
}
```
