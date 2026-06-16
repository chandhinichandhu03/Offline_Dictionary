import React, { useState, useEffect, useRef } from 'react';
import { dictionaryAPI } from '../services/api';

const SearchBar = ({ onSearch, initialValue = "" }) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Set query if initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced autocomplete suggestions
  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await dictionaryAPI.getSuggestions(query.trim());
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        console.error("Suggestions fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, 250); // 250ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  const handleSelectSuggestion = (word) => {
    setQuery(word);
    onSearch(word);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for a word (e.g. hello, persistent, integrity)..."
          className="glass-input pr-12 focus:ring-indigo-500/40 text-base"
        />
        <button
          type="submit"
          className="absolute right-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {loading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-100 dark:divide-slate-800/60 max-h-64 overflow-y-auto">
          {suggestions.map((word, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(word)}
              className="w-full text-left px-5 py-3 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-200 font-medium text-sm flex items-center justify-between group transition-colors duration-150"
            >
              <span>{word}</span>
              <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 text-indigo-500 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
