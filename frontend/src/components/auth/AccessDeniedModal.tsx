import DiscordButton from '../common/DiscordButton';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAccess?: () => void;
}

export default function AccessDeniedModal({ 
  isOpen, 
  onClose, 
  onRequestAccess 
}: AccessDeniedModalProps) {
  if (!isOpen) return null;

  const handleDiscordClick = () => {
    // Track Discord click for analytics
    console.log('Discord community button clicked');
  };

  const handleRequestAccess = () => {
    if (onRequestAccess) {
      onRequestAccess();
    } else {
      // Default behavior - could open a contact form or email
      window.location.href = 'mailto:beta@tutor-ai.com?subject=Beta Access Request';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border p-8 shadow-lg"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
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
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Beta Access Required
          </h2>
          
          <p
            className="text-base leading-relaxed"
            style={{ color: 'var(--muted-text)' }}
          >
            This feature is currently in beta testing.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <h3
              className="font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              For Beta Testers
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--muted-text)' }}
            >
              Join our beta testing program to get early access to new features and help shape the future of interactive learning.
            </p>
          </div>

          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg)',
              borderColor: 'var(--border)',
            }}
          >
            <h3
              className="font-semibold mb-2"
              style={{ color: 'var(--text)' }}
            >
              🚀 What's Next?
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--muted-text)' }}
            >
              We're working hard to bring you the best learning experience. Join our Discord community to stay updated on releases and provide feedback.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <DiscordButton
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleDiscordClick}
          >
            Join Discord Community
          </DiscordButton>
          
          <button
            onClick={handleRequestAccess}
            className="w-full px-4 py-2 text-sm font-medium rounded-lg border transition"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'var(--border)',
              color: 'var(--muted-text)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg)';
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--muted-text)';
            }}
          >
            Enter Beta Password
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <button
            onClick={onClose}
            className="text-sm underline transition"
            style={{ color: 'var(--muted-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted-text)';
            }}
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
