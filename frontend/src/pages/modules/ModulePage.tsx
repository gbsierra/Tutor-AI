// src/pages/ModulePage.tsx
import { Link, Outlet, useLocation, useParams } from "react-router-dom";
import ModuleNav from "../../components/modules/ModuleNav";
import { useModule } from "../../hooks/useModules";
import type { TModuleSpec } from "@shared/module";

export type ModuleOutletContext = { module: TModuleSpec };

function prettifySlug(slug: string) {
  if (!slug) return "Module";
  return slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function ModulePage() {
  const { moduleSlug = "" } = useParams();
  const { data: module, loading, error } = useModule(moduleSlug);
  const location = useLocation();

  const title = module?.title ?? prettifySlug(moduleSlug);
  const description =
    module?.description ??
    "Learn concepts, practice problems, run small simulations, and review your progress.";

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-sm text-[var(--muted-text)] hover:text-[var(--text)] underline-offset-2 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-[var(--text)]">{title}</h1>
        <p className="text-sm text-[var(--muted-text)]">{description}</p>
      </header>

      <ModuleNav />

      <div className="mt-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 min-h-32">
          {loading && <div className="text-sm text-[var(--muted-text)]">Loading module…</div>}
          {error && (
            <div className="text-sm text-red-600">
              Error: {error}
            </div>
          )}
          {!loading && !error && !module && (
            <div className="text-sm text-[var(--muted-text)]">Module not found.</div>
          )}
          {!loading && !error && module && (
            <Outlet context={{ module } satisfies ModuleOutletContext} />
          )}
        </div>

        {/* Gentle nudge for first-time users (only when no child route selected) */}
        {!loading &&
          !error &&
          module &&
          !location.pathname.includes("/learn") &&
          !location.pathname.includes("/practice") &&
          !location.pathname.includes("/review") &&
          !location.pathname.includes("/photos") && (
            <div className="mt-3 text-sm text-[var(--muted-text)]">
              Tip: start with{" "}
              <Link
                to={`/modules/${module.slug}/practice`}
                className="text-[var(--text)] underline underline-offset-2"
              >
                Practice
              </Link>{" "}
              to try the “Die + Coin” exercise.
            </div>
          )}
      </div>
    </section>
  );
}
