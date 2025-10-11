import { useState, useEffect } from 'react';

export default function HomescreenReminderPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasShownThisSession, setHasShownThisSession] = useState(false);

  useEffect(() => {
    // Check if user has permanently dismissed this popup
    const permanentlyDismissed = localStorage.getItem('homescreen-reminder-dismissed');
    if (permanentlyDismissed) {
      setIsDismissed(true);
      return;
    }

    // Check if we've already shown it this session
    const sessionShown = sessionStorage.getItem('homescreen-reminder-session-shown');
    if (sessionShown) {
      setHasShownThisSession(true);
      return;
    }

    // Show popup after scrolling down a bit
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show popup when user has scrolled 30% of the page
      if (scrollY > documentHeight * 0.3 && !isDismissed && !hasShownThisSession) {
        setIsVisible(true);
        setHasShownThisSession(true);
        sessionStorage.setItem('homescreen-reminder-session-shown', 'true');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed, hasShownThisSession]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('homescreen-reminder-dismissed', 'true');
    setIsDismissed(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Mark as shown this session so it doesn't appear again
    setHasShownThisSession(true);
    sessionStorage.setItem('homescreen-reminder-session-shown', 'true');
  };

  // Close popup when clicking outside (ESC key)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Popup */}
      <div 
        className="fixed bottom-6 right-6 md:bottom-6 md:right-6 sm:top-1/2 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-80 max-w-[90vw] p-6 rounded-2xl border-2 shadow-2xl"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Don't forget to add to home screen!
          </h3>
          <p className="text-sm" style={{ color: 'var(--muted-text)' }}>
            Get quick access like a native app
          </p>
        </div>

        {/* Platform Toggle */}
        <div className="flex justify-center mb-4">
          <div 
            className="flex rounded-lg border"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              onClick={() => setActiveTab('ios')}
              className={`px-4 py-2 text-sm rounded-l-lg transition-colors ${
                activeTab === 'ios' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'ios' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'ios' ? 'var(--on-primary)' : 'var(--muted-text)'
              }}
            >
              iOS
            </button>
            <button
              onClick={() => setActiveTab('android')}
              className={`px-4 py-2 text-sm rounded-r-lg transition-colors ${
                activeTab === 'android' ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: activeTab === 'android' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'android' ? 'var(--on-primary)' : 'var(--muted-text)'
              }}
            >
              Android
            </button>
          </div>
        </div>

        {/* App Icon Display */}
        <div className="flex flex-col items-center mb-4">
          <img 
            src="/logo-square.png" 
            alt="Tutor App" 
            className="w-16 h-16 rounded-2xl mb-3 shadow-lg"
          />
          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            Tutor
          </p>
          <p className="text-xs mt-1 text-center" style={{ color: 'var(--muted-text)' }}>
            {activeTab === 'ios' ? 'Tap Share → Add to Home Screen' : 'Tap Menu → Add to Home Screen'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition-colors"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--muted-text)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Don't show again
          </button>
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-600)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
