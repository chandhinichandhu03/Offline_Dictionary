import React, { useState } from 'react';
import { useDictionary } from '../context/DictionaryContext';
import WordCard from '../components/WordCard';

const Favorites = () => {
  const { favorites, favoritesLoading, removeFavorite } = useDictionary();
  const [filterQuery, setFilterQuery] = useState('');
  const [expandedWordId, setExpandedWordId] = useState(null);

  const handleRemove = async (e, favId) => {
    e.stopPropagation(); // Avoid expanding
    if (window.confirm("Remove this word from favorites?")) {
      try {
        await removeFavorite(favId);
      } catch (err) {
        alert("Failed to remove favorite");
      }
    }
  };

  const filteredFavorites = favorites.filter((fav) =>
    fav.word.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Saved Favorites
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Your personal library of words saved for learning.
          </p>
        </div>
        
        {/* Local Filter Input */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter saved words..."
            className="w-full px-4 py-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500/40 text-sm placeholder-slate-400"
          />
        </div>
      </div>

      {/* Loading Spinner */}
      {favoritesLoading ? (
        <div className="flex justify-center py-16">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
          </div>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredFavorites.map((fav) => {
            const isExpanded = expandedWordId === fav.id;

            return (
              <div
                key={fav.id}
                onClick={() => setExpandedWordId(isExpanded ? null : fav.id)}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 transition-all hover:shadow-lg cursor-pointer"
              >
                {/* Collapsed view header */}
                <div className="p-5 flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                      {fav.word}
                    </h3>
                    {fav.pos && (
                      <span className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/50 rounded-full capitalize">
                        {fav.pos}
                      </span>
                    )}
                    {fav.phonetic && (
                      <span className="text-xs text-slate-400 font-mono hidden sm:inline">{fav.phonetic}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={(e) => handleRemove(e, fav.favorite_id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-all focus:outline-none"
                      title="Remove Favorite"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <svg
                      className={`w-5 h-5 text-slate-400 transform transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded details container */}
                {isExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()} // Avoid collapsing when clicking inside
                    className="border-t border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/30 animate-fade-in"
                  >
                    <WordCard wordData={fav} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card p-16 rounded-3xl text-center flex flex-col justify-center items-center">
          <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Saved Words</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
            {filterQuery ? "No favorites match your current filter search." : "Search for words in the dictionary and click the heart icon to save them here."}
          </p>
        </div>
      )}
    </div>
  );
};

export default Favorites;
