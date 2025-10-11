

export interface WaitlistProps {
  /** Primary waitlist URL (required to show the button) */
  ctaHref: string;
  ctaLabel?: string;

  /** Optional secondary link (e.g., roadmap or changelog) */
  secondaryHref?: string;
  secondaryLabel?: string;

  /** Optional short note under the CTA (privacy, response time, etc.) */
  footnote?: string;

  /** Optional headline/subhead overrides */
  headline?: string;
  subhead?: string;
}

export default function SocialProof({
  ctaHref,
  ctaLabel = "Join the waitlist",
  secondaryHref,
  secondaryLabel = "See the roadmap",
  footnote = "We’ll notify you when invite waves open. No spam.",
  headline = "Want to be on the waitlist?",
  subhead = "We're in beta. No reviews yet — sign up to get early access and help shape Tutor.",
}: WaitlistProps) {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-12" style={{ backgroundColor: "var(--surface)" }}>
      <div className="max-w-5xl mx-auto text-center">
        {/* Beta badge with better styling */}
        <div className="mb-6 sm:mb-8">
          <span
            className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border"
            style={{
              color: "var(--warn)",
              borderColor: "color-mix(in srgb, var(--warn) 30%, transparent)",
              background: "color-mix(in srgb, var(--warn) 8%, transparent)",
            }}
          >
            <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ background: "var(--warn)" }} />
            Beta Testing Now Open
          </span>
        </div>

        {/* Headline / subhead with better typography */}
        <h2 
          className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6" 
          style={{ 
            color: "var(--text)",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          {headline}
        </h2>
        <p 
          className="text-base sm:text-xl leading-relaxed max-w-3xl mx-auto" 
          style={{ 
            color: "var(--muted-text)",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}
        >
          {subhead}
        </p>

        {/* Value bullets with better design */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12">
          <ul className="grid sm:grid-cols-3 gap-4 sm:gap-6 text-left">
            {[
              { t: "Early Access", d: "Get notified as invite waves open" },
              { t: "Shape the Product", d: "Share feedback directly with the team" },
              { t: "Transparent Updates", d: "Follow public changes and releases" },
            ].map((item, index) => (
              <li
                key={index}
                className="p-4 sm:p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{ 
                  background: "var(--bg)", 
                  borderColor: "var(--border)",
                  borderWidth: "1px"
                }}
              >
                <div 
                  className="font-semibold text-base sm:text-lg mb-2" 
                  style={{ 
                    color: "var(--text)",
                    fontFamily: "system-ui, -apple-system, sans-serif"
                  }}
                >
                  {item.t}
                </div>
                <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--muted-text)" }}>
                  {item.d}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions with better design */}
        <div className="mt-12 sm:mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          {ctaHref && (
            <a
              href={ctaHref}
              className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1"
              style={{ 
                background: "var(--primary)", 
                color: "var(--on-primary)",
                borderColor: "var(--primary)",
                boxShadow: "0 8px 25px rgba(21, 71, 52, 0.2)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary-600)";
                e.currentTarget.style.boxShadow = "0 12px 35px rgba(21, 71, 52, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(21, 71, 52, 0.2)";
              }}
            >
              {ctaLabel}
            </a>
          )}
          {secondaryHref && (
            <a
              href={secondaryHref}
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1"
              style={{ 
                borderColor: "var(--border)", 
                color: "var(--text)",
                background: "var(--surface)",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--primary)";
                e.currentTarget.style.color = "var(--on-primary)";
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(21, 71, 52, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--surface)";
                e.currentTarget.style.color = "var(--text)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.1)";
              }}
            >
              {secondaryLabel}
            </a>
          )}
        </div>

        {/* Footnote */}
        {footnote && (
          <p className="mt-4 text-sm" style={{ color: "var(--muted-text)" }}>
            {footnote}
          </p>
        )}
      </div>
    </section>
  );
}
