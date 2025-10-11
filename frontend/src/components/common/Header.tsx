// src/components/Header.tsx
import { NavLink, useLocation } from "react-router-dom";
import SearchDropdown from "./SearchDropdown";
import ProfileDropdown from "../auth/ProfileDropdown";
import Logo from "./Logo";
import { useAuth } from "../../contexts/AuthContext";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";

/**
 * Header (University style)
 * - Removes hat icon; uses serif wordmark "TUTOR AI"
 * - Subtle gold accent underline on hover/active
 * - Keyboard-accessible search and controls
 * - Respects CSS tokens for light/dark
 */
export default function Header() {
  const location = useLocation();
  const { isAuthenticated, hasBetaAccess, loginWithGoogle } = useAuth();
  
  // Initialize keyboard shortcuts (handles '/' key for search)
  useKeyboardShortcuts();

  const isDashboard =
    location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/disciplines");

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in srgb, var(--surface) 90%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-3 py-2 sm:px-4 sm:py-3">
        {/* Brand (wordmark only) */}
        <Logo />

        {/* Search */}
        <div className="hidden min-w-0 flex-1 items-center sm:flex">
          <SearchDropdown className="w-full max-w-sm" />
        </div>

        {/* Nav + actions */}
        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <NavItem to="/dashboard" active={isDashboard}>
            Dashboard
          </NavItem>

          <NavItem to="/about" active={location.pathname === "/about"}>
            About
          </NavItem>

          {isAuthenticated ? (
            <ProfileDropdown />
          ) : hasBetaAccess ? (
            <button
              onClick={handleSignIn}
              className="rounded-lg px-3 py-2 text-sm transition"
              style={{
                color: "var(--text)",
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
            >
              Sign In
            </button>
          ) : null}
        </nav>
      </div>

      {/* Subtle academic rule under the bar */}
      <div
        aria-hidden
        style={{
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--warn) 40%, transparent) 12%, color-mix(in srgb, var(--warn) 55%, transparent) 88%, transparent 100%)",
        }}
      />
    </header>
  );
}

function NavItem({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className="rounded-lg px-3 py-2 text-sm transition no-underline"
      style={navStyle(active)}
    >
      <span className="relative">
        {children}
        {/* gold underline appears on hover/active for an academic accent */}
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-[2px] w-0 transition-all duration-200"
          style={{ background: "var(--warn)" }}
        />
      </span>
    </NavLink>
  );
}

function navStyle(active: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    border: "1px solid transparent",
    color: "var(--muted-text)",
  };
  const hover: React.CSSProperties = {
    ...base,
    textDecoration: "none",
  };
  if (active) {
    return {
      color: "var(--text)",
      background: "var(--bg)",
      border: "1px solid var(--border)",
    };
  }
  return {
    ...hover,
  };
}
