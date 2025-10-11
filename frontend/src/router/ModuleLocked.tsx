// frontend/src/router/ModuleLocked.tsx
import type { PropsWithChildren } from "react";
import { useParams } from "react-router-dom";
import { useModule } from "../hooks/useModules";

/**
 * Gating happens BEFORE ModulePage renders, so we fetch the module here.
 * Default OPEN unless explicitly locked (unlocked === false).
 */
type UseModuleRet = {
  loading?: boolean;
  error?: unknown;
  data?: any;   // some codebases return {data}, others {module}; we support both
  module?: any;
};

export default function ModuleLocked({ children }: PropsWithChildren) {
  const { moduleSlug } = useParams();
  const ret = useModule(moduleSlug || "") as UseModuleRet;
  const loading = ret?.loading ?? false;
  const error = ret?.error;
  const mod = ret?.data ?? ret?.module;

  // Loading state (keep it minimal so route feels responsive)
  if (loading) {
    return (
      <div className="rounded-2xl border p-6 bg-[var(--surface)] border-[var(--border)]">
        <div className="animate-pulse h-5 w-40 rounded bg-[var(--border)]" />
        <div className="mt-2 animate-pulse h-4 w-72 rounded bg-[var(--border)]" />
      </div>
    );
  }

  // Error state (e.g., bad slug)
  if (error || !mod) {
    return (
      <div className="rounded-2xl border p-6 bg-[var(--surface)] border-[var(--border)]">
        <h2 className="text-xl font-semibold">Module not found</h2>
        <p className="text-[var(--muted-text)] mt-2">
          We couldn’t load this module. Try going back to the Dashboard.
        </p>
      </div>
    );
  }

  // Gate ONLY when explicitly false; missing/undefined means open
  const isLocked = mod.unlocked === false;

  if (isLocked) {
    return (
      <div className="rounded-2xl border p-6 bg-[var(--surface)] border-[var(--border)]">
        <h2 className="text-xl font-semibold">Coming soon</h2>
        <p className="text-[var(--muted-text)] mt-2">
          <span className="font-medium">{mod.title ?? "This module"}</span> isn’t unlocked yet.
        </p>
      </div>
    );
  }

  // Open: render the actual ModulePage (your children)
  return <>{children}</>;
}
