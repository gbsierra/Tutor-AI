import { NavLink, useParams } from "react-router-dom";

type ModuleNavProps = {
  /** Optionally pass the slug; otherwise it’s read from the URL. */
  moduleSlug?: string;
  className?: string;
};

export default function ModuleNav({ moduleSlug, className }: ModuleNavProps) {
  const params = useParams();
  const slug = moduleSlug ?? params.moduleSlug ?? "";
  const base = `/modules/${slug}`;

  const tabs = [
    { to: `${base}/learn`, label: "Learn" },
    { to: `${base}/practice`, label: "Practice" },
    { to: `${base}/review`, label: "Review" },
    { to: `${base}/photos`, label: "Photos" },
  ];

  return (
    <nav
      className={`mt-6 border-b border-[var(--border)] ${className ?? ""}`}
      aria-label="Module sections"
    >
      <ul className="flex gap-2">
        {tabs.map((t) => (
          <li key={t.to}>
            <NavLink
              to={t.to}
              className={({ isActive }) =>
                [
                  "inline-block px-3 py-2 rounded-t-xl",
                  "text-[var(--text)] hover:text-[var(--text)]",
                  "border border-b-0",
                  "border-transparent hover:border-[var(--border)]",
                  isActive
                    ? "bg-[var(--surface)] border-[var(--border)] font-medium"
                    : "bg-transparent",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                ].join(" ")
              }
              end={t.to.endsWith("/learn")} // 'learn' can be the default leaf
            >
              {t.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
