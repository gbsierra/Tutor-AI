
interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: string;
  isLast?: boolean;
}

function Step({ number, title, description, isLast = false }: Omit<StepProps, 'icon'>) {
  return (
    <div className="flex flex-col items-center text-center group">
      {/* Step number and icon */}
      <div className="relative mb-6 sm:mb-8">
        <div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'var(--on-primary)',
            boxShadow: '0 8px 25px rgba(21, 71, 52, 0.2)'
          }}
        >
          {number}
        </div>
        
        {/* Connector line (except for last step) */}
        {!isLast && (
          <div 
            className="hidden lg:block absolute top-8 sm:top-10 left-full w-32 h-1 transform translate-x-4 rounded-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
        )}
      </div>
      
      {/* Content */}
      <h3 
        className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4"
        style={{ 
          color: 'var(--text)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {title}
      </h3>
      <p 
        className="text-sm sm:text-lg leading-relaxed max-w-sm"
        style={{ 
          color: 'var(--muted-text)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function HowItWorks() {
  const steps: Omit<StepProps, 'number'>[] = [
    {
      title: "Choose Your Discipline",
      description: "Browse our comprehensive collection of academic subjects and select the area you want to explore.",
      icon: "Choose"
    },
    {
      title: "Select Learning Modules",
      description: "Browse interactive modules, practice problems, and simulations tailored to your subject.",
      icon: "Select"
    },
    {
      title: "Practice & Review",
      description: "Reinforce concepts with hands-on practice and track your learning progress.",
      icon: "Practice"
    }
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-12" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 sm:mb-20">
          <h2 
            className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
            style={{ 
              color: 'var(--text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            How It Works
          </h2>
          <p 
            className="text-base sm:text-xl leading-relaxed max-w-4xl mx-auto"
            style={{ 
              color: 'var(--muted-text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Get started in three simple steps and transform your learning experience
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <Step
              key={index}
              number={index + 1}
              title={step.title}
              description={step.description}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>


        {/* CTA section */}
        <div className="text-center mt-12 sm:mt-20">
          <p 
            className="text-base sm:text-xl mb-6 sm:mb-8"
            style={{ 
              color: 'var(--muted-text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Ready to start your learning journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
            <button
              onClick={() => window.open('https://discord.gg/mFwU76MTft', '_blank', 'width=600,height=400')}
              className="px-8 sm:px-10 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1"
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
              Get Started Free
            </button>
            <button
              className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1"
              style={{
                color: 'var(--warn)',
                borderColor: 'var(--warn)',
                background: 'transparent',
                boxShadow: '0 4px 14px rgba(253, 187, 48, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--warn)';
                e.currentTarget.style.color = 'var(--on-primary)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(253, 187, 48, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--warn)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(253, 187, 48, 0.2)';
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
