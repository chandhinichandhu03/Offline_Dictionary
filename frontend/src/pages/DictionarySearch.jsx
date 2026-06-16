import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { dictionaryAPI } from '../services/api';
import SearchBar from '../components/SearchBar';
import WordCard from '../components/WordCard';
import { useDictionary } from '../context/DictionaryContext';

const DictionarySearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { fetchHistory } = useDictionary();
  const [searchResult, setSearchResult] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [exactMatch, setExactMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryParam = searchParams.get('q');

  const executeSearch = async (word) => {
    if (!word) return;
    setLoading(true);
    setError('');
    setSearchResult(null);
    setSuggestions([]);

    try {
      const res = await dictionaryAPI.searchWord(word.trim().toLowerCase());
      const data = res.data;
      if (data.exact_match) {
        setExactMatch(true);
        setSearchResult(data.result);
      } else {
        setExactMatch(false);
        setSuggestions(data.suggestions || []);
      }
      // Refresh history context
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || `Word "${word}" not found.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      executeSearch(queryParam);
    }
  }, [queryParam]);

  const handleSearch = (word) => {
    setSearchParams({ q: word });
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Offline Dictionary Search
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
          Access definitions, parts of speech, synonyms, and antonyms locally.
        </p>
      </div>

      <SearchBar onSearch={handleSearch} initialValue={queryParam || ""} />

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error / Not Found Display */}
      {error && !loading && (
        <div className="glass-card p-8 rounded-3xl text-center max-w-lg mx-auto border-red-200/50 dark:border-red-950/40">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Word Not Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-5">{error}</p>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Tip: Try looking up other words, or visit the Admin Panel to seed words via CSV.
          </div>
        </div>
      )}

      {/* Exact Match Result */}
      {searchResult && exactMatch && !loading && (
        <div className="animate-fade-in">
          <WordCard wordData={searchResult} />
        </div>
      )}

      {/* Fuzzy Suggestions Result */}
      {!exactMatch && suggestions.length > 0 && !loading && (
        <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              No Exact Match Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
              We couldn't find an exact entry for "{queryParam}". Here are some similar words:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug) => (
              <button
                key={sug.id}
                onClick={() => handleSearch(sug.word)}
                className="w-full text-left p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-800 flex justify-between items-center group transition-all"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {sug.word}
                  </span>
                  {sug.pos && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">
                      {sug.pos}
                    </span>
                  )}
                </div>
                <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionarySearch;
