// src/components/Logo.tsx
import { NavLink } from "react-router-dom";

interface LogoProps {
  /** Whether to wrap in NavLink for navigation */
  linkToHome?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the Beta badge */
  showBeta?: boolean;
}

/**
 * Logo component - University style "TUTOR AI" wordmark
 * - Uses serif typography (Georgia, Times New Roman)
 * - Subtle gold accent styling
 * - Matches current header implementation exactly
 */
export default function Logo({ 
  linkToHome = true, 
  className = "",
  size = 'md',
  showBeta = true 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl'
  };

  const logoElement = (
    <span
      className={`select-none leading-none ${sizeClasses[size]} ${className}`}
      style={{
        color: "var(--text)",
        fontFamily: "'Georgia', 'Times New Roman', 'Times', serif",
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      TUTOR
      <sup
        style={{
          fontSize: "0.5em",
          marginLeft: "4px",
          fontVariantCaps: "small-caps",
          letterSpacing: "0.06em",
        }}
      >
        AI
      </sup>
    </span>
  );

  const content = (
    <div className="flex items-center gap-2 sm:gap-3">
      {linkToHome ? (
        <NavLink
          to="/"
          className="block no-underline"
          aria-label="TUTOR AI Home"
        >
          {logoElement}
        </NavLink>
      ) : (
        logoElement
      )}

      {showBeta && (
        <span
          className="hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline"
          style={{
            color: "var(--warn)",
            border: "1px solid color-mix(in srgb, var(--warn) 35%, transparent)",
            background: "color-mix(in srgb, var(--warn) 12%, transparent)",
          }}
        >
          Beta
        </span>
      )}
    </div>
  );

  return content;
}
