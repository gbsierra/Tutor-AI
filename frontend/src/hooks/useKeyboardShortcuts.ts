import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling keyboard shortcuts
 * Currently handles '/' key to focus the global search input
 */
export function useKeyboardShortcuts() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if '/' key is pressed
      if (event.key === '/') {
        // Don't trigger if user is already typing in an input, textarea, or contenteditable
        const activeElement = document.activeElement;
        const isTyping = activeElement && (
          activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).contentEditable === 'true'
        );

        if (!isTyping) {
          // Prevent the '/' from being typed
          event.preventDefault();
          
          // Focus the search input
          const searchInput = document.getElementById('global-search') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            // Optionally select all text if there's already a query
            if (searchInput.value) {
              searchInput.select();
            }
          }
        }
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return { searchInputRef };
}
