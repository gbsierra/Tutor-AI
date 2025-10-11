
import Logo from '../components/common/Logo';
import PhotoUploadFAQ from '../components/common/PhotoUploadFAQ';

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-12 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <div className="flex justify-center mb-6 sm:mb-8">
              <Logo 
                linkToHome={false} 
                showBeta={false} 
                size="lg"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              />
            </div>
            <p 
              className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto"
              style={{ 
                color: 'var(--muted-text)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Revolutionizing education through interactive learning experiences
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-12" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8"
                style={{ 
                  color: 'var(--text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Our Mission
              </h2>
              <p 
                className="text-lg sm:text-xl leading-relaxed mb-4 sm:mb-6"
                style={{ 
                  color: 'var(--muted-text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Tutor is dedicated to making complex academic concepts accessible and engaging 
                through interactive learning experiences. We believe that education should be 
                dynamic, personalized, and available to everyone.
              </p>
              <p 
                className="text-lg sm:text-xl leading-relaxed"
                style={{ 
                  color: 'var(--muted-text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                By combining cutting-edge technology with proven educational methodologies, 
                we create learning environments that adapt to individual needs and learning styles.
              </p>
            </div>
            <div className="relative">
              {/* <img 
                src="/images/placeholder.jpg"
                alt="University learning environment"
                className="w-full h-64 sm:h-96 object-cover rounded-2xl shadow-xl"
              /> */}
              <div 
                className="w-full h-64 sm:h-96 rounded-2xl shadow-xl"
                style={{ backgroundColor: 'var(--primary)' }}
              ></div>
              <div 
                className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium"
                style={{
                  backgroundColor: 'var(--photo-credit-bg)',
                  color: 'var(--text)'
                }}
              >
                Photo: University Campus
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
              style={{ 
                color: 'var(--text)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Our Values
            </h2>
            <p 
              className="text-lg sm:text-xl leading-relaxed max-w-4xl mx-auto"
              style={{ 
                color: 'var(--muted-text)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              The principles that guide our approach to education
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div 
              className="p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <h3 
                className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4"
                style={{ 
                  color: 'var(--text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Accessibility
              </h3>
              <p 
                className="text-base sm:text-lg leading-relaxed"
                style={{ 
                  color: 'var(--muted-text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Making quality education available to learners of all backgrounds and abilities.
              </p>
            </div>

            <div 
              className="p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <h3 
                className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4"
                style={{ 
                  color: 'var(--text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Innovation
              </h3>
              <p 
                className="text-base sm:text-lg leading-relaxed"
                style={{ 
                  color: 'var(--muted-text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Continuously exploring new ways to enhance learning through technology.
              </p>
            </div>

            <div 
              className="p-6 sm:p-8 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{ 
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                borderWidth: '1px'
              }}
            >
              <h3 
                className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4"
                style={{ 
                  color: 'var(--text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Excellence
              </h3>
              <p 
                className="text-base sm:text-lg leading-relaxed"
                style={{ 
                  color: 'var(--muted-text)',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                Maintaining the highest standards in educational content and user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-12" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
              style={{ 
                color: 'var(--text)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Frequently Asked Questions
            </h2>
            <p 
              className="text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ 
                color: 'var(--muted-text)',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Learn more about how our platform works and what you can expect
            </p>
          </div>
          <PhotoUploadFAQ />
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-12">
        <div className="max-w-5xl mx-auto text-center">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8"
            style={{ 
              color: 'var(--text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Get in Touch
          </h2>
          <p 
            className="text-lg sm:text-xl leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto"
            style={{ 
              color: 'var(--muted-text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Have questions about Tutor? Join our Discord community to connect with other 
            students, get help, and stay updated on new features.
          </p>
          <button
            onClick={() => window.open('https://discord.gg/mFwU76MTft', '_blank', 'width=600,height=400')}
            className="px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1"
            style={{
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              borderColor: 'var(--primary)',
              boxShadow: '0 8px 25px rgba(21, 71, 52, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary-600)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(21, 71, 52, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(21, 71, 52, 0.2)';
            }}
          >
            Join Discord Community
          </button>
        </div>
      </section>
    </div>
  );
}
