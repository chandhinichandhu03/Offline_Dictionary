import React, { useState } from 'react';
import { sentenceAPI } from '../services/api';

const SentenceAnalyzer = () => {
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!sentence.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await sentenceAPI.analyzeSentence(sentence.trim());
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to analyze sentence.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Offline Sentence Analyzer
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
          Extract subject-verb-object structures, predict tenses, and retrieve semantics locally.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="glass-card p-6 rounded-3xl space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Enter Sentence
          </label>
          <textarea
            rows={3}
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            placeholder="Type a complete sentence (e.g. 'The teacher has explained the lesson yesterday.', 'I am reading a novel.')"
            className="glass-input resize-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !sentence.trim()}
            className="btn-primary"
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
                <span>Analyze Sentence</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Analysis Results */}
      {result && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Tense Prediction Banner */}
          <div className="glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none"></div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Grammatical Tense Prediction
              </h4>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 capitalize mt-1">
                {result.ml_tense_prediction?.predicted_tense || result.analysis?.tense || 'Unknown'}
              </h3>
            </div>
            {result.ml_tense_prediction?.confidence !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  ML Confidence Score
                </span>
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {Math.round(result.ml_tense_prediction.confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* SVO breakdown and meaning */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SVO Breakdown */}
            <div className="glass-card p-6 rounded-3xl md:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                Grammatical SVO Breakdown
              </h3>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Subject</div>
                  <div className="font-extrabold text-slate-700 dark:text-slate-200 mt-1 truncate">
                    {result.analysis?.breakdown?.subject || 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/40 dark:border-indigo-800/40 rounded-2xl">
                  <div className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Verb Phrase</div>
                  <div className="font-extrabold text-indigo-700 dark:text-indigo-300 mt-1 truncate">
                    {result.analysis?.breakdown?.verb || 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Object</div>
                  <div className="font-extrabold text-slate-700 dark:text-slate-200 mt-1 truncate">
                    {result.analysis?.breakdown?.object || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Extra breakdown items if they exist */}
              {(result.analysis?.breakdown?.auxiliary || result.analysis?.breakdown?.main_verb) && (
                <div className="pt-2 text-xs space-y-1.5 text-slate-500 dark:text-slate-400">
                  {result.analysis.breakdown.auxiliary && (
                    <p>
                      <strong className="text-slate-600 dark:text-slate-300">Auxiliary Verb:</strong>{' '}
                      <code className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">{result.analysis.breakdown.auxiliary}</code>
                    </p>
                  )}
                  {result.analysis.breakdown.main_verb && (
                    <p>
                      <strong className="text-slate-600 dark:text-slate-300">Main Verb Root:</strong>{' '}
                      <code className="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.5 rounded">{result.analysis.breakdown.main_verb}</code>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Meaning card */}
            <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-3">
                  Retrieved Semantics
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
                  "{result.analysis?.meaning || 'No exact semantic mapping found.'}"
                </p>
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-4">
                Semantic Source: Local Corpus
              </div>
            </div>
          </div>

          {/* Similar Sentences */}
          {result.similar_sentences && result.similar_sentences.length > 0 && (
            <div className="glass-card p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                Closest Semantic Matches in Corpus (TF-IDF Similarity)
              </h3>
              
              <div className="space-y-4">
                {result.similar_sentences.map((sim, index) => (
                  <div key={index} className="flex justify-between items-start gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                        {sim.sentence}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-600 dark:text-slate-300">Meaning:</strong> {sim.meaning}
                      </p>
                      {sim.tense && (
                        <p className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider">
                          Tense: {sim.tense}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md">
                      {Math.round(sim.similarity * 100)}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SentenceAnalyzer;
