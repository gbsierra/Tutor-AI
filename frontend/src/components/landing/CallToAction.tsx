import DiscordButton from '../common/DiscordButton';

export default function CallToAction() {


  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = 'Check out Tutor - the future of interactive learning!';
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
    }
  };

  return (
    <section className="relative w-full py-16 sm:py-24 overflow-hidden">
      {/* Background Image */}
      {/* <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/placeholder.jpg)',
          filter: 'brightness(0.3)'
        }}
      /> */}
      
      {/* Solid Background */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'var(--primary)' }}
      />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      />
      
      {/* Content */}
      <div className="relative max-w-5xl mx-auto text-center z-10 px-4 sm:px-12">
        {/* Main message */}
        <h2 
          className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8"
          style={{ 
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Ready to Join the Beta?
        </h2>
        
        <p 
          className="text-base sm:text-xl md:text-2xl leading-relaxed mb-12 sm:mb-16 max-w-4xl mx-auto"
          style={{ 
            color: '#D4C4A7',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          Be among the first to experience the future of interactive learning. 
          Join our beta testing program and help shape the next generation of educational technology.
        </p>

        {/* Primary CTAs */}
        <div className="flex justify-center mb-12 sm:mb-16">
          <DiscordButton
            variant="outline"
            size="lg"
            className="px-8 sm:px-12 py-4 sm:py-5 text-base sm:text-xl font-semibold rounded-lg border-2 transition-all duration-300 transform hover:-translate-y-1"
          >
            Join Discord Community
          </DiscordButton>
        </div>

        {/* Social sharing */}
        <div className="mb-8 sm:mb-12">
          <p 
            className="text-base sm:text-lg font-medium mb-4 sm:mb-6"
            style={{ 
              color: '#D4C4A7',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            Share the future of learning
          </p>
          <div className="flex justify-center gap-4 sm:gap-6">
            <button
              onClick={() => handleShare('twitter')}
              className="p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--on-primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(21, 71, 52, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
              }}
              title="Share on Twitter"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </button>
            
            <button
              onClick={() => handleShare('facebook')}
              className="p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--on-primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(21, 71, 52, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
              }}
              title="Share on Facebook"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            
            <button
              onClick={() => handleShare('linkedin')}
              className="p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--on-primary)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(21, 71, 52, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
              }}
              title="Share on LinkedIn"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Final message */}
        <div 
          className="p-6 sm:p-8 rounded-2xl border-2 mb-8 sm:mb-12"
          style={{
            backgroundColor: 'var(--bg)',
            borderColor: 'var(--border)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
          }}
        >
          <p 
            className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3"
            style={{ 
              color: 'var(--text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            For Beta Testers
          </p>
          <p 
            className="text-sm sm:text-base leading-relaxed"
            style={{ 
              color: 'var(--muted-text)',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
          >
            This beta release is for early adopters. Join our Discord community to stay updated on releases and provide feedback that shapes the future of learning.
          </p>
        </div>

        {/* Photo Credit */}
        <div 
          className="inline-flex items-center px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium"
          style={{
            backgroundColor: 'var(--photo-credit-bg)',
            color: 'var(--text)'
          }}
        >
          Photo: University Campus
        </div>

      </div>
    </section>
  );
}
