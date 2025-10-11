
import UnifiedContentCarousel from './UnifiedContentCarousel';

export default function FeaturesShowcase() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 relative" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          style={{
            backgroundImage: `
              linear-gradient(45deg, var(--primary) 1px, transparent 1px),
              linear-gradient(-45deg, var(--warn) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px, 40px 40px",
          }}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
            style={{ 
              color: 'var(--text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Explore Our Community
          </h2>
          <p 
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto"
            style={{ color: 'var(--muted-text)' }}
          >
            Discover learning modules created from recent lecture photos
          </p>
        </div>

        {/* Unified Content Container */}
        <div className="p-4 sm:p-6 md:p-8">
          <UnifiedContentCarousel className="mb-0" />
        </div>

      </div>
    </section>
  );
}
