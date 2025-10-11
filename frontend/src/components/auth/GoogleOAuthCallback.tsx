import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OAuthCallbackProps {
  onAuthSuccess: (user: unknown) => void;
}

export default function GoogleOAuthCallback({ onAuthSuccess }: OAuthCallbackProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Get user data or error from URL parameters (set by backend redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const userParam = urlParams.get('user');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          setError(`OAuth error: ${decodeURIComponent(errorParam)}`);
          setStatus('error');
          return;
        }

        if (!userParam) {
          setError('No user data received from authentication');
          setStatus('error');
          return;
        }

        try {
          // Parse user data from URL parameter
          const user = JSON.parse(decodeURIComponent(userParam));
          
          // Store user data in localStorage
          localStorage.setItem('stutor:user', JSON.stringify(user));
          
          // Call success callback
          onAuthSuccess(user);
          
          setStatus('success');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          setError('Invalid user data received');
          setStatus('error');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Network error during authentication');
        setStatus('error');
      }
    };

    handleOAuthCallback();
  }, [navigate, onAuthSuccess]);

  if (status === 'loading') {
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
            Authenticating with Google...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--text)' }}
          >
            Authentication Failed
          </h2>
          
          <p
            className="text-base leading-relaxed mb-6"
            style={{ color: 'var(--muted-text)' }}
          >
            {error}
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 text-base font-medium rounded-lg transition"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)',
          }}
        >
          <svg
            className="w-8 h-8"
            style={{ color: 'var(--success)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <h2
          className="text-2xl font-semibold mb-4"
          style={{ color: 'var(--text)' }}
        >
          Authentication Successful!
        </h2>
        
        <p
          className="text-base leading-relaxed"
          style={{ color: 'var(--muted-text)' }}
        >
          Redirecting to dashboard...
        </p>
      </div>
    </div>
  );
}
