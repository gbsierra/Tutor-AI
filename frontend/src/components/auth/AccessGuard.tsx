import { useState, type ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PasswordModal from './PasswordModal';

interface AccessGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function AccessGuard({ children, fallback }: AccessGuardProps) {
  const { hasBetaAccess, isLoading } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);


  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}
          />
          <p
            className="text-sm"
            style={{ color: 'var(--muted-text)' }}
          >
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // If user has beta access, render children (browse access)
  if (hasBetaAccess) {
    return <>{children}</>;
  }

  // If not authenticated, show password modal or fallback
  const handleAccessRequest = () => {
    setShowPasswordModal(true);
  };

  const handleModalClose = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
  };


  // Custom fallback component
  if (fallback) {
    return (
      <>
        {fallback}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={handleModalClose}
        />
      </>
    );
  }

  // Default access denied component
  return (
    <>
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="text-center max-w-md">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--warn) 15%, transparent)',
            }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: 'var(--warn)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--text)' }}
          >
            Beta Access Required
          </h2>
          
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: 'var(--muted-text)' }}
          >
            This feature is currently in beta testing. 
            Enter the beta access password to browse modules and content.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleAccessRequest}
              className="w-full px-6 py-3 text-base font-medium rounded-lg transition"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
            >
              Enter Beta Password
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <p
              className="text-sm"
              style={{ color: 'var(--muted-text)' }}
            >
              Don't have access? Join our{' '}
              <button
                onClick={() => window.open('https://discord.gg/mFwU76MTft', '_blank', 'width=600,height=400')}
                className="underline hover:no-underline transition-all duration-200"
                style={{ 
                  color: 'var(--primary)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                Discord
              </button>
              {' '}community to stay updated on beta releases.
            </p>
          </div>
        </div>
      </div>
      
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={handleModalClose}
        onSuccess={handlePasswordSuccess}
      />
    </>
  );
}
