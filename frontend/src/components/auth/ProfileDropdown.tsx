import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

interface ProfileDropdownProps {
  className?: string;
}

export default function ProfileDropdown({ className = '' }: ProfileDropdownProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { dark, toggleTheme } = useTheme();

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleProfileClick = () => {
    navigate('/profile');
    setShowDropdown(false);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading state while user data is being loaded
  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div
          className="grid size-9 place-items-center overflow-hidden rounded-full text-sm font-medium shadow-sm"
          style={{
            color: "var(--text)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Check if the avatar URL is a Google default avatar (which often doesn't work)
  const isGoogleDefaultAvatar = (url: string | undefined): boolean => {
    if (!url) return true;
    // Google default avatars have specific patterns - real avatars have long hash strings
    // Your URL: https://lh3.googleusercontent.com/a/ACg8ocIPFMeCtK0_8cemLzc_UdhBt_50njAcZ1HZfQPWDJ1TeMC7qg=s96-c
    // This is a REAL avatar (96 chars, has proper hash), not a default
    return url.includes('googleusercontent.com') && 
           (url.includes('photo.jpg') || url.includes('photo.png') || url.includes('default') || url.length < 80);
  };

  // Determine if we should show avatar or initials - recalculate when user changes
  const shouldShowAvatar = user?.avatarUrl && !isGoogleDefaultAvatar(user.avatarUrl);


  return (
    <div className={`relative ${className}`} key={user?.id || 'no-user'}>
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="grid size-9 place-items-center overflow-hidden rounded-full text-sm font-medium shadow-sm transition"
        title="Profile"
        aria-label="Profile"
        style={{
          color: "var(--text)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
      >
        {shouldShowAvatar ? (
          <img 
            src={user.avatarUrl} 
            alt={user.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, hide it and show initials instead
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const initialsSpan = parent.querySelector('.initials-fallback');
                if (initialsSpan) {
                  (initialsSpan as HTMLElement).style.display = 'block';
                }
              }
            }}
          />
        ) : null}
        <span 
          className={`initials-fallback ${shouldShowAvatar ? 'hidden' : ''}`}
          style={{ display: shouldShowAvatar ? 'none' : 'block' }}
        >
          {getInitials(user.name)}
        </span>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-1 w-64 rounded-lg border shadow-lg z-50"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* User info header */}
          <div className="px-3 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              {shouldShowAvatar ? (
                <img 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    // If image fails to load, hide it and show initials instead
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const initialsDiv = parent.querySelector('.initials-fallback-dropdown');
                      if (initialsDiv) {
                        (initialsDiv as HTMLElement).style.display = 'flex';
                      }
                    }
                  }}
                />
              ) : null}
              <div 
                className={`initials-fallback-dropdown w-10 h-10 rounded-full items-center justify-center text-sm font-medium ${shouldShowAvatar ? 'hidden' : 'flex'}`}
                style={{
                  background: "var(--primary)",
                  color: "var(--on-primary)",
                  display: shouldShowAvatar ? 'none' : 'flex'
                }}
              >
                {getInitials(user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: "var(--text)" }}>
                  {user.displayName || user.name}
                </div>
                <div className="text-xs truncate" style={{ color: "var(--muted-text)" }}>
                  {user.email}
                </div>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className="w-full text-left px-3 py-2 text-sm transition"
              style={{ 
                color: "var(--text)",
                background: "transparent"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </div>
            </button>

            <button
              onClick={toggleTheme}
              className="w-full text-left px-3 py-2 text-sm transition"
              style={{ 
                color: "var(--text)",
                background: "transparent"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex items-center gap-2">
                {dark ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                {dark ? 'Light Mode' : 'Dark Mode'}
              </div>
            </button>

            <div className="border-t my-1" style={{ borderColor: "var(--border)" }} />

            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm transition"
              style={{ 
                color: "var(--text)",
                background: "transparent"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
