# Shared - Type Definitions & Schemas

> Central contract between frontend and backend with TypeScript types, Zod schemas, and shared data structures

## Overview

The shared package serves as the **single source of truth** for all type definitions, validation schemas, and shared data structures used across the frontend and backend. It ensures type safety and consistency throughout the entire application.

## Architecture

### Core Technologies
- **TypeScript 5.4.5** - Type definitions
- **Zod 4.1.5** - Runtime validation schemas
- **ES Modules** - Modern JavaScript module system

### Key Features
- **Type Safety** - End-to-end TypeScript types
- **Runtime Validation** - Zod schema validation
- **Single Source of Truth** - Centralized type definitions
- **Cross-Platform** - Used by both frontend and backend
- **Version Control** - Consistent API contracts
- **YouTube Integration** - Video types and schemas for educational content

## 📁 Directory Structure

```
shared/
├── dist/                 # Compiled JavaScript and TypeScript declaration files
│   ├── *.js              # Compiled JavaScript files
│   ├── *.d.ts            # TypeScript declaration files
│   └── d3/               # Compiled D3.js visualization files
├── types.ts              # Common shared types and interfaces
├── module.ts             # Module and lesson type definitions with Zod schemas
├── disciplines.ts        # 52 academic disciplines with seed data
├── problem.ts            # Problem generation and grading types with schemas
├── auth.ts               # Authentication types and schemas
├── photoUpload.ts        # Photo upload configuration with limits and privacy policies
├── apiClient.ts          # API client configuration and utilities
├── d3/                   # D3.js visualization system (3 files)
│   ├── visualizations.ts # Core visualization types and interfaces
│   ├── modules.ts        # D3.js module metadata and capabilities
│   └── visualization-registry.ts # Available visualization types registry
├── index.ts              # Main exports and concept-based learning types
├── package.json          # Package configuration
└── tsconfig.json         # TypeScript configuration
```

## Type Definitions

### Common Types (`types.ts`)

#### Shared Interfaces
```typescript
// Local image interface for file uploads and processing
export interface LocalImage {
  file: File;
  convertedFile: Blob; // Always present after successful processing
  mimeType: string;
  previewUrl: string;
  base64: string; // Always present after successful processing
}

// Recent exercise tracking interface
export interface RecentExercise {
  moduleSlug: string;
  exerciseSlug: string;
  exerciseTitle: string;
  lastVisited: string; // ISO date string from API
}

// Module metadata for configuration
export type ModuleMeta = {
  slug: string;
  title: string;
  unlocked: boolean;
  comingSoon?: boolean;
};

// Recent module interface for landing page carousel
export interface RecentModule {
  slug: string;
  title: string;
  description: string | null;
  discipline: string | null;
  disciplineName: string | null;
  disciplineCategory: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Recent modules API response
export interface RecentModulesResponse {
  modules: RecentModule[];
}
```

#### Usage
```typescript
// Frontend usage
import type { LocalImage, RecentExercise, ModuleMeta, RecentModule, RecentModulesResponse } from '@shared/types';

// Backend usage
import type { LocalImage, RecentExercise, ModuleMeta, RecentModule, RecentModulesResponse } from '@local/shared/types';
```

### Module System (`module.ts`)

#### Core Module Types
```typescript
// Main module specification
export interface TModuleSpec {
  slug: string;
  title: string;
  description: string;
  lessons: TLessonSpec[];
  exercises: TExerciseSpec[];
  tags: string[];
  discipline?: string;
  concepts: string[];
  prerequisites: string[];
  learningOutcomes: string[];
  estimatedTime?: number;
  source: ModuleSource;
  originalPhotos?: string[];
  draft: boolean;
  version: string;
  consolidation: ConsolidationAction;
}

// Lesson specification
export interface TLessonSpec {
  slug: string;
  title: string;
  content: RenderBlock[];
  concepts: string[];
  learningObjectives: string[];
  estimatedTime?: number;
  youtubeSearchQuery?: string;
  youtubeVideo?: TYouTubeVideoSpec;
}

// Exercise specification
export interface TExerciseSpec {
  slug: string;
  title: string;
  description: string;
  kind: ExerciseKind;
  difficulty: ExerciseDifficulty;
  concepts: string[];
  learningObjectives: string[];
  estimatedTime?: number;
  template: ExerciseTemplate;
}
```

#### Exercise Types
```typescript
export type ExerciseKind = 
  | "multiple-choice"
  | "free-response" 
  | "fill-in-the-blank"
  | "matching"
  | "ordering"
  | "true-false";

export type ExerciseDifficulty = "beginner" | "intermediate" | "advanced";
```

#### Zod Schemas
```typescript
export const TModuleSpecSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  lessons: z.array(TLessonSpecSchema),
  exercises: z.array(TExerciseSpecSchema),
  // ... additional fields
});

// YouTube video specification
export interface TYouTubeVideoSpec {
  videoId: string;
  title: string;
  description?: string;
  channelName?: string;
  startTime?: number;
  endTime?: number;
  thumbnail?: string;
}
```

### Discipline System (`disciplines.ts`)

#### Discipline Data
```typescript
export interface Discipline {
  id: string;
  name: string;
  category: string;
  description: string;
  moduleCount: number;
}

// 52 academic disciplines across 7 colleges
export const DISCIPLINE_SEED_DATA: Discipline[] = [
  {
    id: "art",
    name: "Art",
    category: "arts-letters",
    description: "Study of visual arts, design, and artistic expression",
    moduleCount: 0
  },
  // ... 51 more disciplines
];
```

#### College Categories
```typescript
export const COLLEGE_CATEGORIES = [
  "Arts & Letters",
  "Business", 
  "Engineering & Computer Science",
  "Health & Human Services",
  "Natural Sciences & Mathematics",
  "Social Sciences & Interdisciplinary Studies",
  "Education"
] as const;
```

### Problem System (`problem.ts`)

#### Problem Generation Types
```typescript
// Problem generation request
export interface GenerateRequest {
  exercise: ExerciseSpec;
  module?: ModuleContext;
}

// Generated problem instance
export interface ProblemInstance {
  id: string;
  exercise: ExerciseSpec;
  problem: RenderBlock[];
  solution?: RenderBlock[];
  metadata: ProblemMetadata;
}

// Grading request
export interface GradeRequest {
  engine: string;
  problem: ProblemInstance;
  submission: Submission;
  exercise?: ExerciseSpec;
  module?: ModuleContext;
}

// Grading result
export interface GradeResult {
  correct: boolean;
  score: number;
  feedback: string;
  explanation?: string;
  suggestions?: string[];
}
```

#### Zod Schemas
```typescript
export const GenerateRequestSchema = z.object({
  exercise: ExerciseSpecSchema,
  module: ModuleContextSchema.optional()
});

export const GradeRequestSchema = z.object({
  engine: z.string(),
  problem: ProblemInstanceSchema,
  submission: SubmissionSchema,
  exercise: ExerciseSpecSchema.optional(),
  module: ModuleContextSchema.optional()
});
```

### Photo Upload System (`photoUpload.ts`)

#### Photo Upload Configuration
```typescript
// Centralized photo upload configuration
export const PHOTO_UPLOAD_CONFIG = {
  // Maximum number of photos allowed per upload
  MAX_PHOTOS: 5,
  
  // Supported file types
  ACCEPTED_TYPES: "image/*,.heic,.heif",
  
  // Maximum file size per photo (in bytes) - 10MB
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  
  // LLM providers and their privacy policies
  LLM_PROVIDERS: {
    openai: {
      name: "OpenAI",
      privacyPolicy: "https://openai.com/privacy",
      dataUsage: "Photos are sent to OpenAI for AI processing to generate educational content"
    },
    gemini: {
      name: "Google Gemini", 
      privacyPolicy: "https://policies.google.com/privacy",
      dataUsage: "Photos are sent to Google Gemini for AI processing to generate educational content"
    }
  }
} as const;

export type PhotoUploadConfig = typeof PHOTO_UPLOAD_CONFIG;
```

#### Usage
```typescript
// Frontend usage
import { PHOTO_UPLOAD_CONFIG } from '@local/shared';

// Validate file count
if (files.length > PHOTO_UPLOAD_CONFIG.MAX_PHOTOS) {
  throw new Error(`Maximum ${PHOTO_UPLOAD_CONFIG.MAX_PHOTOS} photos allowed`);
}

// Get privacy policy links
const openaiPolicy = PHOTO_UPLOAD_CONFIG.LLM_PROVIDERS.openai.privacyPolicy;
```

### Authentication System (`auth.ts`)

#### Authentication Types
```typescript
// Google OAuth user data
export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

// Authenticated user in application
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
}
```

#### Zod Schemas
```typescript
export const GoogleUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  picture: z.string().url(),
  verified_email: z.boolean()
});

export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar_url: z.string().url(),
  display_name: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
});
```

### D3.js Visualization System (`d3/`)

#### Core Visualization Types (`visualizations.ts`)
```typescript
// Interactive parameter for D3.js visualizations
export interface D3Parameter {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'object' | 'array' | 'function';
  description: string;
  defaultValue: any;
  range?: [number, number];
  options?: string[];
}

// D3.js visualization specification
export interface D3VisualizationSpec {
  selectedCapability: string;
  d3Module: string;
  configuration: any;
  data: any;
  explanation: string;
  interactiveParameters: D3Parameter[];
}

// Generation request
export interface D3GenerationRequest {
  content: string;
  context?: any;
  subject?: string;
  learningObjectives?: string[];
  requestedVisualizationType?: string;
}

// Generation response
export interface D3GenerationResponse {
  visualizations: D3VisualizationSpec[];
  reasoning: string;
  confidence: number;
  requiredModules: string[];
}
```

#### Visualization Registry (`visualization-registry.ts`)
```typescript
// Available visualization types
export const VISUALIZATION_TYPES: VisualizationType[] = [
  {
    id: 'ai-choice',
    name: 'AI Choose Best',
    description: 'Let AI analyze your content and pick the most appropriate visualization',
    icon: '🤖',
    useCase: 'Automatic selection based on content analysis',
    capabilityName: 'ai-choice',
    category: 'chart',
    implemented: true,
    educationalUseCases: ['Automatic content analysis', 'Smart visualization selection']
  },
  {
    id: 'tree-diagram',
    name: 'Tree Diagram',
    description: 'Show hierarchical relationships and decision trees',
    icon: '🌳',
    useCase: 'Perfect for processes, hierarchies, and decision flows',
    capabilityName: 'tree-diagram',
    category: 'hierarchy',
    implemented: true,
    educationalUseCases: [
      'Decision tree visualization',
      'Classification hierarchy',
      'Process flow representation',
      'Probability tree diagrams'
    ]
  },
  // ... 6 more visualization types
];
```

#### D3.js Module Metadata (`modules.ts`)
```typescript
// D3.js module information
export interface D3ModuleInfo {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  documentation: string;
  examples: D3Example[];
}

// Available D3.js modules
export const AVAILABLE_D3_MODULES: D3ModuleInfo[] = [
  {
    name: "d3-core",
    version: "7.9.0",
    description: "Core D3.js library with essential visualization capabilities",
    capabilities: [
      "tree-diagram",
      "cluster-diagram", 
      "force-directed-graph",
      "bar-chart",
      "line-chart",
      "scatter-plot",
      "pie-chart"
    ],
    documentation: "https://d3js.org/",
    examples: []
  }
];
```

## API Client Usage

### Authentication Strategy
The shared package provides an API client that handles authentication automatically:

```typescript
// For authenticated endpoints - use apiClient
import { getApiClient } from '@shared/apiClient';

const apiClient = getApiClient();
const data = await apiClient.get('/api/users/me/contributions');
```

```typescript
// For public endpoints - use direct fetch
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/problems/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody),
});
```

### API Client Features
- **Automatic Authentication**: Adds `X-User-ID` header from localStorage
- **Consistent Error Handling**: Standardized error responses
- **Base URL Management**: Handles environment-specific URLs
- **Type Safety**: Full TypeScript support

## Usage

### Frontend Usage
```typescript
// Import types and schemas
import type { TModuleSpec, TExerciseSpec, TYouTubeVideoSpec } from '@shared/module';
import type { RecentModule, RecentModulesResponse } from '@shared/types';
import { DISCIPLINE_SEED_DATA } from '@shared/disciplines';
import { VISUALIZATION_TYPES } from '@shared/d3/visualization-registry';

// Use in components
const module: TModuleSpec = {
  slug: 'statistics-101',
  title: 'Introduction to Statistics',
  // ... other properties
};

// Recent modules for landing page carousel
const recentModule: RecentModule = {
  slug: 'statistics-101',
  title: 'Introduction to Statistics',
  description: 'Learn the fundamentals of statistical analysis',
  discipline: 'mathematics-statistics',
  disciplineName: 'Mathematics and Statistics',
  disciplineCategory: 'natural-sciences-mathematics',
  createdAt: '2024-01-15T10:30:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

// YouTube video usage
const video: TYouTubeVideoSpec = {
  videoId: 'abc123',
  title: 'Statistics Tutorial',
  channelName: 'Educational Channel',
  startTime: 30,
  endTime: 300
};

// Validate with Zod schemas
import { TModuleSpecSchema } from '@shared/module';
const validatedModule = TModuleSpecSchema.parse(moduleData);
```

### Backend Usage
```typescript
// Import types and schemas
import type { TModuleSpec, TExerciseSpec, TYouTubeVideoSpec } from '@local/shared/module';
import type { RecentModule, RecentModulesResponse } from '@local/shared/types';
import { DISCIPLINE_SEED_DATA } from '@local/shared/disciplines';
import { VISUALIZATION_TYPES } from '@local/shared/d3/visualization-registry';

// Use in services
export class ModuleService {
  async saveModule(module: TModuleSpec): Promise<void> {
    // Validate input
    const validatedModule = TModuleSpecSchema.parse(module);
    // Save to database
  }

  async getRecentModules(limit: number = 8): Promise<RecentModule[]> {
    // Fetch recent modules for landing page
    const modules = await db.query(`
      SELECT m.slug, m.title, m.description, m.discipline, 
             d.name as "disciplineName", d.category as "disciplineCategory",
             m.created_at, m.updated_at
      FROM modules m
      LEFT JOIN disciplines d ON m.discipline = d.id
      WHERE m.draft = false
      ORDER BY m.created_at DESC
      LIMIT $1
    `, [limit]);
    return modules;
  }
}

export class YouTubeService {
  async searchAndAttachVideo(lesson: TLessonSpec): Promise<TYouTubeVideoSpec | null> {
    // Search YouTube API and return video data
  }
}

// Use in API routes
app.post('/api/modules', (req, res) => {
  const moduleData = TModuleSpecSchema.parse(req.body);
  // Process module
});

app.get('/api/modules/recent', (req, res) => {
  // Return recent modules for landing page carousel
  const modules = await moduleService.getRecentModules();
  res.json({ modules });
});

app.post('/api/youtube/attach-video/:moduleSlug/:lessonSlug', (req, res) => {
  // Handle YouTube video attachment
});
```

## Development

### Prerequisites
- Node.js 18+
- TypeScript 5.4.5+

### Setup
```bash
cd shared
npm install
npm run build
```

### Available Scripts
- `npm run build` - Compile TypeScript to JavaScript
- `npm run clean` - Remove compiled files

### Build Output
```
shared/
├── dist/             # All compiled files organized in dist/
│   ├── *.js          # Compiled JavaScript files
│   ├── *.d.ts        # TypeScript declaration files
│   └── d3/           # Compiled D3.js files
│       ├── *.js      # D3.js JavaScript files
│       └── *.d.ts    # D3.js declaration files
└── *.ts              # Source TypeScript files remain in root
```

## Package Configuration

### Package.json
```json
{
  "name": "@local/shared",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./module": "./dist/module.js",
    "./disciplines": "./dist/disciplines.js",
    "./problem": "./dist/problem.js",
    "./d3/*": "./dist/d3/*.js"
  },
  "files": [
    "dist/"
  ]
}
```

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "outDir": "dist",
    "strict": true,
    "skipLibCheck": true,
    "sourceMap": false
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

## Data Flow

### Type Safety Flow
```
1. Define types in shared/
   ↓
2. Generate Zod schemas
   ↓
3. Frontend uses types for components
   ↓
4. Backend uses schemas for validation
   ↓
5. Runtime validation ensures data integrity
```

### Schema Validation Flow
```
1. API receives request
   ↓
2. Zod schema validates input
   ↓
3. TypeScript types ensure compile-time safety
   ↓
4. Processed data maintains type safety
   ↓
5. Response validated before sending
```


