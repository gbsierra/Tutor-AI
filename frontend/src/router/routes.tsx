// frontend/src/router/routes.tsx
import { createBrowserRouter, Outlet, useLocation } from "react-router-dom";
import Header from "../components/common/Header";
import Dashboard from "../pages/Dashboard";
import ErrorPage from "../pages/Error";
import ModuleLocked from "./ModuleLocked";
import AccessGuard from "../components/auth/AccessGuard";
import UploadGuard from "../components/auth/UploadGuard";
import GoogleOAuthCallback from "../components/auth/GoogleOAuthCallback";
import { AuthProvider } from "../contexts/AuthContext";

// Pages
import ModulePage from "../pages/modules/ModulePage";
import LearnPage from "../pages/modules/LearnPage";
// Practice list + detail
import PracticePage from "../pages/practice/PracticeListPage";
import ProblemListPage from "../pages/practice/ProblemListPage";
import PracticeDetailPage from "../pages/practice/PracticeDetailPage";

// New tabs
import ReviewPage from "../pages/modules/ReviewPage";
import ModulePhotosPage from "../pages/modules/ModulePhotosPage";

// Public module builder
import CreateModulePage from "../pages/modules/CreateModule";

// Landing and Discipline pages
import LandingPage from "../pages/LandingPage";
import DisciplineDashboard from "../pages/disciplines/DisciplineDashboard";
import AboutPage from "../pages/AboutPage";
import ProfilePage from "../pages/profile/ProfilePage";
import BetaAccessPage from "../pages/auth/BetaAccessPage";

function RootLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";
  const isOAuthCallback = location.pathname === "/auth/google/callback";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {!isOAuthCallback && <Header />}
        {isLandingPage ? (
          <Outlet />
        ) : (
          <main className="mx-auto max-w-6xl p-6">
            <Outlet />
          </main>
        )}
      </div>
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },

      // About page (public)
      { path: "about", element: <AboutPage /> },

      // Beta access page (public)
      { path: "beta-access", element: <BetaAccessPage /> },

      // Profile page (protected)
      { 
        path: "profile", 
        element: (
          <AccessGuard>
            <ProfilePage />
          </AccessGuard>
        ) 
      },

      // OAuth callback route (public)
      { 
        path: "auth/google/callback", 
        element: (
          <GoogleOAuthCallback 
            onAuthSuccess={() => {
              // User data is already stored in localStorage by the callback component
              // The AuthContext will pick it up on the next render
              window.location.href = '/dashboard';
            }} 
          />
        ) 
      },

      // Protected routes - require beta access
      { 
        path: "dashboard", 
        element: (
          <AccessGuard>
            <Dashboard />
          </AccessGuard>
        ) 
      },

      // Discipline-specific dashboard
      { 
        path: "disciplines/:disciplineId", 
        element: (
          <AccessGuard>
            <DisciplineDashboard />
          </AccessGuard>
        ) 
      },

      // Public creator route
      { 
        path: "create", 
        element: (
          <AccessGuard>
            <UploadGuard>
              <CreateModulePage />
            </UploadGuard>
          </AccessGuard>
        ) 
      },

      // Discipline-specific creator route
      { 
        path: "disciplines/:disciplineId/create", 
        element: (
          <AccessGuard>
            <UploadGuard>
              <CreateModulePage />
            </UploadGuard>
          </AccessGuard>
        ) 
      },

      // Modules list page (shows all modules like Dashboard)
      { 
        path: "modules", 
        element: (
          <AccessGuard>
            <Dashboard />
          </AccessGuard>
        ) 
      },

      // Module shell + tabs
      {
        path: "modules/:moduleSlug",
        element: (
          <AccessGuard>
            <ModuleLocked>
              <ModulePage />
            </ModuleLocked>
          </AccessGuard>
        ),
        children: [
          // Default tab
          { index: true, element: <LearnPage /> },
          // Tabs
          { path: "learn", element: <LearnPage /> },
          { path: "practice", element: <PracticePage /> },
          { path: "practice/:exerciseSlug", element: <ProblemListPage /> },
          { path: "practice/:exerciseSlug/:problemId", element: <PracticeDetailPage /> },
          { path: "review", element: <ReviewPage /> },
          { path: "photos", element: <ModulePhotosPage /> },
        ],
      },
    ],
  },
]);
