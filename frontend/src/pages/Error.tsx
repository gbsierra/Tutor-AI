import { NavLink, useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const { title, detail, code } = parseError(error);

  return (
    <section className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-2xl border bg-[var(--surface)] p-8 shadow-sm border-[var(--border)]">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] bg-clip-text text-transparent">
              {title}
            </span>
          </h1>

          <p className="mt-2 text-[var(--muted-text)]">
            {detail}
            {code ? <span className="ml-2 rounded-md border border-[var(--border)] px-1.5 py-0.5 text-xs">Error {code}</span> : null}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <NavLink
              to="/"
              className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--on-primary)] shadow-sm transition hover:bg-[var(--primary-700)] focus:outline-none focus-visible:ring focus-visible:ring-[var(--primary-600)]"
            >
              Back to dashboard
            </NavLink>
            <NavLink
              to="/modules"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] shadow-sm transition hover:bg-[var(--bg)] focus:outline-none focus-visible:ring focus-visible:ring-[var(--border)]"
            >
              Browse modules
            </NavLink>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[var(--primary)]/20 blur-2xl"
        />
      </div>

      {/* Optional technical detail for debugging (collapsed look) */}
      {__DEV_DETAIL(error)}
    </section>
  );
}

/* ---------- helpers ---------- */

function parseError(error: unknown): { title: string; detail: string; code?: number } {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: "Page not found",
        detail: "That route doesn’t exist (yet). Try the dashboard or modules.",
        code: error.status,
      };
    }
    return {
      title: "Something went wrong",
      detail: error.statusText || "An unexpected error occurred.",
      code: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Something went wrong",
      detail: error.message || "An unexpected error occurred.",
    };
  }

  return {
    title: "Oops!",
    detail: "We hit an unexpected error.",
  };
}

/**
 * Renders a small, themed box with JSON of the error for dev builds.
 * Remove this block if you don’t want to expose details.
 */
function __DEV_DETAIL(error: unknown) {
  if (import.meta.env.PROD) return null;

  let payload: unknown = error;
  try {
    // React Router error responses aren’t plain objects — normalize a bit.
    if (isRouteErrorResponse(error)) {
      payload = {
        status: error.status,
        statusText: error.statusText,
        data: error.data,
      };
    }
  } catch {
    // ignore
  }

  return (
    <div className="mt-6 rounded-2xl border bg-[var(--surface)] p-4 text-[var(--muted-text)] border-[var(--border)]">
      <div className="mb-2 text-xs uppercase tracking-wide">Debug details</div>
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs">
        {safeStringify(payload)}
      </pre>
    </div>
  );
}

function safeStringify(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
