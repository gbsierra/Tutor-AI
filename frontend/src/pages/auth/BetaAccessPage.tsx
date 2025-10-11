import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PasswordModal from '../../components/auth/PasswordModal';
import { useState } from 'react';

export default function BetaAccessPage() {
  const { hasBetaAccess, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // If user already has beta access, redirect to dashboard
  useEffect(() => {
    if (!isLoading && hasBetaAccess) {
      navigate('/dashboard');
    }
  }, [hasBetaAccess, isLoading, navigate]);

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

  // If user has beta access, they'll be redirected by useEffect
  if (hasBetaAccess) {
    return null;
  }

  const handleAccessRequest = () => {
    setShowPasswordModal(true);
  };

  const handleModalClose = () => {
    setShowPasswordModal(false);
  };

  const handlePasswordSuccess = () => {
    setShowPasswordModal(false);
    // Redirect to dashboard after successful beta access
    navigate('/dashboard');
  };

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
              className="w-full rounded-lg px-4 py-3 text-sm font-medium transition"
              style={{
                color: 'var(--surface)',
                backgroundColor: 'var(--primary)',
                border: '1px solid var(--primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
            >
              Enter Beta Access Password
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium transition"
              style={{
                color: 'var(--text)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface)';
              }}
            >
              Back to Home
            </button>
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
