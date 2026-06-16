import React, { useState } from 'react';
import { useDictionary } from '../context/DictionaryContext';
import { useAuth } from '../context/AuthContext';

const WordCard = ({ wordData }) => {
  const { isAuthenticated } = useAuth();
  const { checkIsFavorited, addFavorite, removeFavoriteByWordId } = useDictionary();
  const [loading, setLoading] = useState(false);

  const { id, word, meaning, pos, synonyms, antonyms, example, phonetic } = wordData;
  const isFav = checkIsFavorited(id);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      if (isFav) {
        await removeFavoriteByWordId(id);
      } else {
        await addFavorite(id);
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Convert synonyms/antonyms to array if string
  const parseList = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    return str.split(/[;,]/).map(s => s.trim()).filter(Boolean);
  };

  const synonymList = parseList(synonyms);
  const antonymList = parseList(antonyms);

  const getPosBadgeClass = (p) => {
    const cleanPos = (p || '').toLowerCase();
    if (cleanPos.includes('noun')) {
      return 'text-amber-700 dark:text-amber-300 bg-amber-100/60 dark:bg-amber-950/45 border border-amber-200/50 dark:border-amber-900/50';
    }
    if (cleanPos.includes('verb')) {
      return 'text-sky-700 dark:text-sky-300 bg-sky-100/60 dark:bg-sky-950/45 border border-sky-200/50 dark:border-sky-900/50';
    }
    if (cleanPos.includes('adj')) {
      return 'text-fuchsia-700 dark:text-fuchsia-300 bg-fuchsia-100/60 dark:bg-fuchsia-950/45 border border-fuchsia-200/50 dark:border-fuchsia-900/50';
    }
    if (cleanPos.includes('adv')) {
      return 'text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-950/45 border border-emerald-200/50 dark:border-emerald-900/50';
    }
    return 'text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/45 border border-indigo-200/50 dark:border-indigo-800/40';
  };

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl relative overflow-hidden transition-all duration-300">
      {/* Decorative gradient corner */}
      <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>
      
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 capitalize tracking-tight">
              {word}
            </h2>
            {pos && (
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${getPosBadgeClass(pos)}`}>
                {pos}
              </span>
            )}
          </div>
          {phonetic && (
            <p className="text-slate-400 dark:text-slate-500 font-mono text-base mt-1.5 flex items-center gap-1.5">
              <span>{phonetic}</span>
            </p>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={handleFavoriteToggle}
            disabled={loading}
            className={`p-3 rounded-xl border transition-all duration-200 ${
              isFav
                ? 'bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400'
            }`}
            title={isFav ? "Remove from Favorites" : "Add to Favorites"}
          >
            {loading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-5 border-t border-slate-100 dark:border-slate-800/80 pt-6">
        {/* Definition */}
        <div>
          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Definition</h4>
          <p className="text-slate-700 dark:text-slate-200 text-lg leading-relaxed">
            {meaning}
          </p>
        </div>

        {/* Example */}
        {example && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Usage Example</h4>
            <p className="text-slate-600 dark:text-slate-300 italic text-base leading-relaxed pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
              "{example}"
            </p>
          </div>
        )}

        {/* Synonyms & Antonyms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {synonymList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Synonyms</h4>
              <div className="flex flex-wrap gap-1.5">
                {synonymList.map((syn, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 rounded-md">
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}

          {antonymList.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Antonyms</h4>
              <div className="flex flex-wrap gap-1.5">
                {antonymList.map((ant, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 rounded-md">
                    {ant}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordCard;
