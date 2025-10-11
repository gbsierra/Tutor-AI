import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PasswordModal({ isOpen, onClose, onSuccess }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPassword('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const success = await login(password);
      if (success) {
        onClose();
        onSuccess?.();
      } else {
        setError('Incorrect beta access password. Please try again.');
      }
    } catch {
              setError('An error occurred during beta access verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border p-6 shadow-lg"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text)' }}
          >
            Beta Access Required
          </h2>
          <p
            className="text-sm"
            style={{ color: 'var(--muted-text)' }}
          >
            This feature is currently in beta testing.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="beta-password"
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--text)' }}
            >
              Enter Beta Access Password
            </label>
            <input
              ref={inputRef}
              id="beta-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password..."
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: error ? 'var(--error)' : 'var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--warn)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = error ? 'var(--error)' : 'var(--border)';
              }}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
            {error && (
              <p
                className="mt-2 text-sm"
                style={{ color: 'var(--error)' }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border transition"
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition"
              style={{
                backgroundColor: isSubmitting ? 'var(--muted-text)' : 'var(--primary)',
                color: 'var(--on-primary)',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-700)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                }
              }}
              disabled={isSubmitting || !password.trim()}
            >
              {isSubmitting ? 'Verifying...' : 'Access Beta'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center">
          <p
            className="text-xs"
            style={{ color: 'var(--muted-text)' }}
          >
            Need access? Join our{' '}
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
            {' '}community.
          </p>
        </div>
      </div>
    </div>
  );
}
