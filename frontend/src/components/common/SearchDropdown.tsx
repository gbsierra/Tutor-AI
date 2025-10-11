import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDisciplinesAndModules } from '../../services/disciplineService';

interface SearchResult {
  type: 'discipline' | 'module';
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  moduleCount?: number;
  discipline?: string;
  disciplineName?: string;
  disciplineCategory?: string;
}

interface SearchDropdownProps {
  className?: string;
}

export default function SearchDropdown({ className = '' }: SearchDropdownProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchStats, setSearchStats] = useState({ disciplines: 0, modules: 0, total: 0 });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setSearchStats({ disciplines: 0, modules: 0, total: 0 });
      return;
    }

    setLoading(true);
    try {
      const searchResult = await searchDisciplinesAndModules(searchQuery, 10);
      setResults(searchResult.results);
      setSearchStats({
        disciplines: searchResult.disciplines,
        modules: searchResult.modules,
        total: searchResult.total
      });
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      setSearchStats({ disciplines: 0, modules: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Set new timeout
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && results.length > 0) {
      const targetResult = selectedIndex >= 0 ? results[selectedIndex] : results[0];
      handleResultClick(targetResult);
    } else if (query.trim()) {
      // Fallback: navigate to dashboard with search
      navigate('/dashboard');
    }
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'discipline') {
      navigate(`/disciplines/${result.id}`);
    } else if (result.type === 'module') {
      navigate(`/modules/${result.slug}`);
    }
    setShowDropdown(false);
    setQuery('');
    setResults([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Show dropdown when there are results
  useEffect(() => {
    setShowDropdown(results.length > 0 && query.length >= 2);
  }, [results, query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Group results by type
  const disciplineResults = results.filter(r => r.type === 'discipline');
  const moduleResults = results.filter(r => r.type === 'module');

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <label htmlFor="global-search" className="sr-only">
            Search disciplines and modules
          </label>
          <input
            ref={inputRef}
            id="global-search"
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              setShowDropdown(results.length > 0 && query.length >= 2);
              e.currentTarget.style.borderColor = "var(--warn)";
            }}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            placeholder="Search disciplines and modules…"
            className="w-full rounded-lg px-3 py-2 pr-3 text-sm outline-none transition"
            style={{
              color: "var(--text)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-96 overflow-y-auto"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          {/* Results summary */}
          {searchStats.total > 0 && (
            <div className="px-3 py-2 text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--muted-text)" }}>
              {searchStats.total} result{searchStats.total !== 1 ? 's' : ''} 
              {searchStats.disciplines > 0 && ` • ${searchStats.disciplines} discipline${searchStats.disciplines !== 1 ? 's' : ''}`}
              {searchStats.modules > 0 && ` • ${searchStats.modules} module${searchStats.modules !== 1 ? 's' : ''}`}
            </div>
          )}

          {/* Disciplines section */}
          {disciplineResults.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-medium" style={{ color: "var(--muted-text)", background: "var(--bg)" }}>
                Disciplines ({disciplineResults.length})
              </div>
              {disciplineResults.map((result) => {
                const globalIndex = results.indexOf(result);
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`w-full text-left px-3 py-2 text-sm transition ${
                      selectedIndex === globalIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      color: selectedIndex === globalIndex ? "var(--on-primary)" : "var(--text)",
                      background: selectedIndex === globalIndex ? "var(--primary)" : "transparent",
                    }}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-text)" }}>
                      {result.moduleCount} module{result.moduleCount !== 1 ? 's' : ''}
                      {result.description && ` • ${result.description.slice(0, 60)}${result.description.length > 60 ? '...' : ''}`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Modules section */}
          {moduleResults.length > 0 && (
            <div>
              {disciplineResults.length > 0 && (
                <div className="border-t" style={{ borderColor: "var(--border)" }} />
              )}
              <div className="px-3 py-2 text-xs font-medium" style={{ color: "var(--muted-text)", background: "var(--bg)" }}>
                Modules ({moduleResults.length})
              </div>
              {moduleResults.map((result) => {
                const globalIndex = results.indexOf(result);
                return (
                  <button
                    key={result.slug}
                    onClick={() => handleResultClick(result)}
                    className={`w-full text-left px-3 py-2 text-sm transition ${
                      selectedIndex === globalIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      color: selectedIndex === globalIndex ? "var(--on-primary)" : "var(--text)",
                      background: selectedIndex === globalIndex ? "var(--primary)" : "transparent",
                    }}
                  >
                    <div className="font-medium">{result.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-text)" }}>
                      in {result.disciplineName}
                      {result.description && ` • ${result.description.slice(0, 50)}${result.description.length > 50 ? '...' : ''}`}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* No results */}
          {results.length === 0 && query.length >= 2 && !loading && (
            <div className="px-3 py-4 text-center text-sm" style={{ color: "var(--muted-text)" }}>
              No results found for "{query}"
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-3 py-4 text-center text-sm" style={{ color: "var(--muted-text)" }}>
              Searching...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
