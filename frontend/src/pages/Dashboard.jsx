import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, historyAPI } from '../services/api';
import StatsCard from '../components/StatsCard';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm("Are you sure you want to clear your search history?")) {
      try {
        await historyAPI.clearHistory();
        fetchStats(); // Refetch to update history list and search count
      } catch (err) {
        alert("Failed to clear search history");
      }
    }
  };

  const handleRecentClick = (word) => {
    navigate(`/search?q=${encodeURIComponent(word)}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh] px-4">
        <div className="glass-card p-6 rounded-2xl border-red-200/50 dark:border-red-950/40 text-center max-w-sm">
          <p className="text-red-500 font-semibold mb-4">{error}</p>
          <button onClick={fetchStats} className="btn-primary py-2 px-4 text-sm mx-auto">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Learning Dashboard
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
          Monitor your vocabulary building and ML quiz performances.
        </p>
      </div>

      {/* Progress Card */}
      {stats && (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Dictionary Exploration Progress
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                You have searched {stats.unique_words_searched} unique words out of {stats.total_words_available} available in the offline dictionary.
              </p>
            </div>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {stats.learning_progress}%
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${stats.learning_progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Stats Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Searches"
            value={stats.total_searches}
            gradientClasses="from-blue-500 to-indigo-600"
            description="All lifetime searches recorded"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Favorites"
            value={stats.favorite_count}
            gradientClasses="from-rose-500 to-pink-600"
            description="Words saved to library"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Quiz Average"
            value={`${stats.quiz_score}%`}
            gradientClasses="from-amber-500 to-orange-600"
            description={`Based on ${stats.total_quizzes_taken} quiz submissions`}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
          />
          <StatsCard
            title="Distinct Mastered"
            value={stats.unique_words_searched}
            gradientClasses="from-emerald-500 to-teal-600"
            description="Unique dictionary queries"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>
      )}

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Recent Search History */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-5 border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Recent Searches
            </h3>
            {stats && stats.recent_searches.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-wider focus:outline-none"
              >
                Clear History
              </button>
            )}
          </div>
          
          {stats && stats.recent_searches.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 overflow-y-auto max-h-96">
              {stats.recent_searches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRecentClick(item.word)}
                  className="w-full flex justify-between items-center py-3.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 px-3 -mx-3 rounded-xl transition-all group text-left"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.word}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(item.searched_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center py-10 text-center">
              <svg className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">No recent searches yet</p>
            </div>
          )}
        </div>

        {/* Recent Quiz Performance */}
        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <div className="mb-5 border-b border-slate-100 dark:border-slate-800/60 pb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Recent Quizzes
            </h3>
          </div>

          {stats && stats.recent_quiz_results.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50 flex-1 overflow-y-auto max-h-96">
              {stats.recent_quiz_results.map((result, idx) => {
                const percentage = roundScore(result.score, result.total);
                const isGood = percentage >= 70;
                
                return (
                  <div key={idx} className="flex justify-between items-center py-3.5 px-1">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                        {result.quiz_type} Quiz
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(result.taken_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {result.score}/{result.total}
                      </span>
                      <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full ${
                        isGood 
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center py-10 text-center">
              <svg className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">No quizzes taken yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const roundScore = (score, total) => {
  if (total === 0) return 0;
  return Math.round((score / total) * 100);
};

export default Dashboard;
