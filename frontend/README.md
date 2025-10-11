# Frontend - React Learning Platform

## Overview

The frontend is a React 19 application that provides the user interface for the Class Tutor learning platform.

## Architecture

### Core Technologies
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript 5.8.3** - Full type safety
- **Vite 7.1.2** - Fast build tool and dev server
- **Tailwind CSS 4.1.12** - Utility-first styling
- **React Router DOM 7.8.2** - Client-side routing
- **D3.js 7.9.0** - Interactive visualizations

### Key Features
- **Smart Photo Upload System** - 5 photo maximum with validation, FAQ, and privacy transparency
- **Privacy & Content Guidelines** - Transparent data usage with LLM provider privacy policies
- **Google OAuth Authentication** - Full user account system with profile management
- **Beta Access Control** - Password-based authentication for controlled testing
- **Multi-Discipline Navigation** - 52 academic disciplines across 7 colleges
- **Recent Modules Carousel** - Dynamic scrolling showcase of community-created modules on landing page
- **Interactive Visualizations** - 8 D3.js diagram types with AI auto-selection
- **YouTube Video Integration** - Lazy-loaded educational videos with AI-generated search queries
- **User Profile Management** - Profile pages with contribution tracking and photo attribution
- **Photo Attribution System** - Track user contributions to modules with visual contributor tags
- **Module Photos Tab** - Dedicated tab showing all lecture photos with contributor attribution
- **Smart Problem Generation** - AI-powered practice problems with intelligent grading
- **Progress Tracking** - Persistent user progress with detailed analytics
- **Responsive Design** - Mobile-optimized interface with university theming

## 📁 Directory Structure

```
frontend/src/
├── components/           # Reusable UI components
│   ├── modules/         # Module-related components
│   │   ├── ModuleNav.tsx    # Module navigation tabs
│   │   ├── PracticeCard.tsx # Practice exercise card
│   │   └── MyContributions.tsx # User contribution tracking
│   ├── disciplines/     # Discipline-related components
│   │   ├── DisciplineCard.tsx # Discipline display card
│   │   ├── DisciplineSelect.tsx # Discipline selection component
│   │   ├── CollegeCard.tsx  # College display card
│   │   └── CollegeExpandedView.tsx # Expanded college view
│   ├── auth/            # Authentication components
│   │   ├── GoogleOAuthCallback.tsx # OAuth callback handler
│   │   ├── ProfileDropdown.tsx # User profile dropdown menu
│   │   ├── AccessGuard.tsx  # Route protection wrapper
│   │   ├── AccessDeniedModal.tsx # Access denied modal
│   │   ├── UploadGuard.tsx  # Upload permission guard
│   │   ├── UploadAccessModal.tsx # Upload access modal
│   │   └── PasswordModal.tsx # Beta access password modal
│   ├── common/          # Shared components
│   │   ├── Header.tsx       # Navigation header with user menu
│   │   ├── Logo.tsx         # Application logo component
│   │   ├── SearchDropdown.tsx # Search functionality
│   │   ├── DiscordButton.tsx # Discord community button
│   │   └── PhotoUploadFAQ.tsx # Photo upload FAQ with privacy info
│   ├── landing/         # Landing page components (8 files)
│   │   ├── HeroSection.tsx
│   │   ├── DisciplineGrid.tsx
│   │   ├── FeaturesShowcase.tsx
│   │   ├── UnifiedContentCarousel.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── CallToAction.tsx
│   │   ├── SocialProof.tsx
│   │   └── index.tsx
│   ├── lessons/         # Structured lesson components (9 files)
│   │   ├── StructuredLessonRenderer.tsx
│   │   ├── LessonIntroduction.tsx
│   │   ├── KeyConcepts.tsx
│   │   ├── StepByStepExamples.tsx
│   │   ├── RealWorldApplications.tsx
│   │   ├── CommonPitfalls.tsx
│   │   ├── LessonSummary.tsx
│   │   ├── YouTubeVideoPlayer.tsx
│   │   └── InteractiveButtons.tsx
│   ├── practice/        # Problem practice components (8 files)
│   │   ├── AnswerArea.tsx
│   │   ├── MCQSelector.tsx
│   │   ├── FillBlankRenderer.tsx
│   │   ├── MatchingRenderer.tsx
│   │   ├── OrderingRenderer.tsx
│   │   ├── TrueFalseRenderer.tsx
│   │   ├── Prompt.tsx
│   │   └── ResultBanner.tsx
│   ├── simulations/     # D3.js visualization components (4 files)
│   │   ├── D3SimulationHub.tsx
│   │   ├── D3Renderer.tsx
│   │   ├── D3VisualizationSelector.tsx
│   │   └── D3ParameterControls.tsx
├── pages/               # Route components
│   ├── modules/         # Module-related pages
│   │   ├── ModulePage.tsx   # Module shell with tabs
│   │   ├── CreateModule.tsx # Module creation workflow
│   │   ├── ModulePhotosPage.tsx # Photo attribution display
│   │   ├── LearnPage.tsx    # Lesson content display
│   │   └── ReviewPage.tsx   # Progress review and analytics
│   ├── disciplines/     # Discipline-related pages
│   │   ├── DisciplinePage.tsx # Individual discipline page
│   │   └── DisciplineDashboard.tsx # Discipline-specific dashboard
│   ├── auth/            # Authentication pages
│   │   └── BetaAccessPage.tsx # Beta access entry page
│   ├── profile/         # User profile pages
│   │   └── ProfilePage.tsx  # User profile management
│   ├── practice/        # Practice problem pages (3 files)
│   │   ├── PracticeListPage.tsx
│   │   ├── ProblemListPage.tsx
│   │   └── PracticeDetailPage.tsx
│   ├── AboutPage.tsx    # About page
│   ├── AllModules.tsx   # All modules listing
│   ├── Dashboard.tsx    # Main dashboard (all modules)
│   ├── Error.tsx        # Error page
│   └── LandingPage.tsx  # Main landing page
├── services/            # API integration layer
│   ├── disciplineService.ts # Discipline API calls
│   ├── problemService.ts # Problem generation and grading
│   ├── d3SimulationService.ts # D3.js visualization API
│   ├── moduleService.ts # Module API calls (consolidated)
│   ├── modulesConfig.ts # Module configuration
│   └── imageService.ts  # Image handling utilities
├── hooks/               # Custom React hooks
│   ├── useModules.ts    # Module data management
│   ├── usePhotoUpload.ts # Photo upload with validation and limits
│   ├── useProblemRunner.ts # Problem generation and grading
│   └── useKeyboardShortcuts.ts # Keyboard shortcuts
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication state management
├── router/              # Routing configuration
│   ├── routes.tsx       # Main routing configuration
│   └── ModuleLocked.tsx # Module access control
├── types/               # TypeScript type definitions
│   └── disciplines.ts   # Discipline-specific types
├── utils/               # Utility functions
│   └── recentExercises.ts # Recent exercises tracking
└── styles/              # Global styles
    └── globals.css      # Global CSS variables and styles
```

## Component Architecture

### Landing Page Components
- **HeroSection** - Main landing page hero with photo upload
- **DisciplineGrid** - Interactive discipline browser
- **FeaturesShowcase** - Feature highlights with unified content carousel
- **UnifiedContentCarousel** - Dynamic scrolling showcase of modules with their photos
- **CallToAction** - Beta testing CTAs

### Learning Components
- **ModulePage** - Main module interface with tabs
- **LearnPage** - Lesson content display with structured lesson renderer
- **PracticePage** - Problem practice interface with 6 exercise types
- **ReviewPage** - Progress review and analytics
- **ModulePhotosPage** - Photo attribution display with contributor tags

### Visualization Components
- **D3SimulationHub** - Main visualization orchestrator
- **D3Renderer** - Pure D3.js rendering engine
- **D3VisualizationSelector** - User choice interface
- **D3ParameterControls** - Interactive parameter controls

### Practice Components
- **AnswerArea** - Answer input interface
- **MCQSelector** - Multiple choice questions
- **FillBlankRenderer** - Fill-in-the-blank exercises
- **MatchingRenderer** - Matching exercises
- **OrderingRenderer** - Ordering exercises
- **TrueFalseRenderer** - True/false exercises
- **ResultBanner** - Feedback display

## 🔐 Authentication & Access Control

### Google OAuth System
- **AuthContext** - Authentication state management
- **GoogleOAuthCallback** - OAuth callback handler
- **ProfileDropdown** - User profile and settings
- **ProfilePage** - User profile management

### Beta Access System
- **AccessGuard** - Route protection wrapper
- **PasswordModal** - Password entry interface
- **AccessDeniedModal** - Access denied experience
- **BetaAccessPage** - Dedicated beta access page

### Route Protection
```typescript
// Protected routes require beta access
<AccessGuard>
  <Dashboard />
</AccessGuard>

// User profile routes
<Route path="/profile" element={<ProfilePage />} />
```


## API Integration

### Authentication Strategy
The frontend uses two different approaches for API calls based on authentication requirements:

#### **API Client (Authenticated Endpoints)**
For endpoints requiring user authentication, we use the centralized `apiClient`:

```typescript
import { getApiClient } from '@shared/apiClient';

// Automatically includes X-User-ID header for authentication
const apiClient = getApiClient();
const data = await apiClient.get('/api/users/me/contributions');
```

**Used for:**
- User profile operations (`/api/users/me/*`)
- Problem grading (`/api/problems/grade`)
- Problem existing (`/api/problems/existing`)
- Recent exercises (`/api/recent-exercises/*`)
- Module creation (authenticated) (`/api/modules/build`, `/api/modules/publish`)

#### **Direct Fetch (Public Endpoints)**
For public endpoints that don't require authentication, we use direct `fetch()`:

```typescript
// No authentication needed
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/problems/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody),
});
```

**Used for:**
- Problem generation (`/api/problems/generate`)
- YouTube video attachment (`/api/youtube/attach-video/*`)
- D3 visualizations (`/api/visualizations/*`)
- Discipline data (`/api/disciplines/*`)
- Recent modules/photos (`/api/modules/recent`, `/api/photos/recent`)
- Module access (public) (`/api/modules/:slug`)

### Service Layer
API calls are organized through service classes:

```typescript
// Discipline operations (public)
import { fetchDisciplines, fetchDiscipline } from '../services/disciplineService';

// Problem operations (mixed auth)
import { generateProblem, gradeSubmission } from '../services/problemService';

// Visualization operations (public)
import { d3SimulationService } from '../services/d3SimulationService';

// Module operations (mixed auth)
import { ModuleService } from '../services/moduleService';
```

### API Endpoints
All API calls use the `/api` prefix:
- `/api/disciplines/*` - Discipline data (public)
- `/api/modules/*` - Module operations (mixed auth)
- `/api/problems/*` - Problem generation (mixed auth)
- `/api/simulations/*` - Visualization generation (public)
- `/api/visualizations/*` - Visualization persistence (public)
- `/api/youtube/*` - YouTube video integration (public)
- `/api/users/me/*` - User profile and contributions (authenticated)
- `/api/recent-exercises/*` - Recent exercise tracking (authenticated)

## Key User Flows

### 1. Module Creation Flow
```
Upload Photos → AI Analysis → Discipline Selection → Module Generation → Publish
```

### 2. Learning Flow
```
Browse Disciplines → Select Module → Learn Content → Practice Problems → Review Progress
```

### 3. Visualization Flow
```
Lesson Content → Choose Visualization Type → AI Generation → Interactive Display → Save
```

### 4. YouTube Video Flow
```
Lesson Content → "Still struggling?" Button → Lazy Load Video → YouTube Player → Cache for Future Users
```

## Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd frontend
npm install
npm run dev
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables
```bash
# Development (uses Vite proxy)
VITE_API_BASE_URL=

# Production
VITE_API_BASE_URL=https://your-backend-url.com
VITE_BETA_ACCESS_PASSWORD=your_secure_password
```

## Photo Upload System

### Smart Upload Features
- **5 Photo Maximum** - Prevents server payload errors with clear validation
- **File Type Support** - HEIC, JPEG, PNG, GIF, WebP with HEIC conversion when needed
- **Privacy Transparency** - FAQ with LLM provider privacy policy links
- **Content Guidelines** - Merit-based system with warnings for inappropriate content
- **User-Friendly Errors** - Clear validation messages and helpful guidance

### Photo Upload Components
```typescript
// Main upload hook with validation
const {
  images,
  onPickFiles,
  removeImage,
  handleDragOver,
  handleDrop,
  acceptedTypes,
  maxPhotos
} = usePhotoUpload();

// FAQ component with privacy info
<PhotoUploadFAQ />

// Upload configuration
import { PHOTO_UPLOAD_CONFIG } from '@local/shared';
```

### Upload Flow
1. **File Selection** - Drag & drop or click to select
2. **Validation** - File count, size, and type validation
3. **HEIC Conversion** - Conversion via Cloudinary when HEIC files are detected
4. **Privacy Notice** - FAQ with data usage transparency
5. **Content Guidelines** - Merit system warnings

## D3.js Visualization System

### Available Visualization Types
1. **Tree Diagram** - Hierarchical relationships
2. **Cluster Diagram** - Grouped hierarchies  
3. **Force-Directed Graph** - Network relationships
4. **Bar Chart** - Data comparisons
5. **Line Chart** - Trends and time series
6. **Scatter Plot** - Correlations
7. **Pie Chart** - Proportions
8. **AI Auto-Selection** - Let AI choose the best type

### Visualization Architecture
```typescript
// Main orchestrator
<D3SimulationHub 
  content={lessonContent}
  context={moduleContext}
  subject={discipline}
  learningObjectives={objectives}
/>

// User choice interface
<D3VisualizationSelector 
  onSelectType={handleSelectType}
  onAISelect={handleAISelect}
/>

// Rendering engine
<D3Renderer 
  spec={visualizationSpec}
  width={400}
  height={300}
/>
```

## State Management

### React Context
- **AuthContext** - Authentication state
- **Module Context** - Current module state

### Custom Hooks
- **useModules** - Module data management
- **usePhotoUpload** - Photo upload with validation, limits, and HEIC conversion
- **useProblemRunner** - Problem generation and grading

### Local Storage
- Authentication persistence
- User preferences
- Progress tracking


## Dependencies

### Core Dependencies
- **react** - UI framework
- **react-dom** - DOM rendering
- **react-router-dom** - Client-side routing
- **d3** - Data visualization
- **@heroicons/react** - Icon library

### Development Dependencies
- **@vitejs/plugin-react** - Vite React plugin
- **typescript** - Type checking
- **tailwindcss** - CSS framework
- **eslint** - Code linting