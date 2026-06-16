import React, { useState } from 'react';
import { dictionaryAPI } from '../services/api';
import WordCard from '../components/WordCard';

const GrammarAnalyzer = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await dictionaryAPI.analyzeWord(word.trim());
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze word grammar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Offline Grammar & POS Analyzer
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
          Extract word formations, morphological features, and ML part-of-speech classes.
        </p>
      </div>

      {/* Input form */}
      <form onSubmit={handleAnalyze} className="glass-card p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Type a single word (e.g. slowly, excitement, explained)..."
            className="glass-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !word.trim()}
          className="btn-primary w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing...
            </span>
          ) : (
            <>
              <span>Analyze Word</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results grid */}
      {result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          {/* Grammar & POS details */}
          <div className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-4">
              Morphological Analysis
            </h3>
            
            <div className="space-y-4">
              {/* POS */}
              <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Part of Speech</span>
                <span className="px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40 rounded-full capitalize">
                  {result.grammar_analysis?.pos || 'Unknown'}
                </span>
              </div>

              {/* Tense Form */}
              {result.grammar_analysis?.tense_form && (
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Tense Form</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {result.grammar_analysis.tense_form}
                  </span>
                </div>
              )}

              {/* Analysis Source */}
              {result.grammar_analysis?.source && (
                <div className="flex justify-between items-center py-2.5 border-b border-slate-100 dark:border-slate-800/40">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Rule Engine</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded uppercase tracking-wider">
                    {result.grammar_analysis.source}
                  </span>
                </div>
              )}

              {/* ML classifier details */}
              {result.ml_prediction && (
                <div className="pt-4 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/30 dark:border-indigo-850/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">ML Prediction</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-indigo-600 dark:bg-indigo-500 rounded uppercase">
                      {result.ml_prediction.predicted_pos}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Prediction Confidence</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Math.round(result.ml_prediction.confidence * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              {result.grammar_analysis?.description && (
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Detailed Rule Description</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {result.grammar_analysis.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lexical Details (Dictionary card) */}
          <div className="space-y-4">
            {result.dictionary_info ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-1">
                  Lexical Database Entry
                </h3>
                <WordCard wordData={result.dictionary_info} />
              </div>
            ) : (
              <div className="glass-card p-8 rounded-3xl h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">No Dictionary Entry Found</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 max-w-xs">
                  This word exists in our grammar rules/predictions, but does not have a formal lexical definition in the local words database.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarAnalyzer;
