import React, { useState } from 'react';

const FlashCard = ({ wordData, onNext }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { word, meaning, pos, example, phonetic } = wordData;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (e) => {
    e.stopPropagation(); // Avoid flipping when clicking the Next button
    setIsFlipped(false);
    // Add a slight delay for transition reset
    setTimeout(() => {
      onNext();
    }, 150);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      {/* Flip Card Container */}
      <div
        onClick={handleFlip}
        className="w-full h-80 perspective-1000 cursor-pointer select-none group"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 backface-hidden glass-card rounded-3xl p-8 flex flex-col justify-between items-center text-center shadow-lg group-hover:shadow-indigo-500/10 border-2 border-slate-200/50 dark:border-slate-800/40">
            <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mt-2">
              Vocabulary Flashcard
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 capitalize tracking-tight">
                {word}
              </h3>
              {phonetic && (
                <span className="text-sm font-mono text-slate-400 dark:text-slate-500">{phonetic}</span>
              )}
            </div>

            <div className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1.5 hover:underline pb-2">
              Tap to reveal meaning
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M7.5 12l-3 3m3-3l3 3" />
              </svg>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 glass-card rounded-3xl p-8 flex flex-col justify-between border-2 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Definition</span>
              {pos && (
                <span className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100/60 dark:bg-indigo-950/40 rounded-full capitalize">
                  {pos}
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4 text-center mt-2">
              <p className="text-slate-800 dark:text-slate-100 text-xl font-medium leading-relaxed">
                {meaning}
              </p>
              {example && (
                <p className="text-slate-500 dark:text-slate-400 italic text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4 px-4">
                  "{example}"
                </p>
              )}
            </div>

            <div className="text-slate-400 dark:text-slate-500 text-xs font-semibold text-center pb-2">
              Tap to show word
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleFlip}
          className="btn-secondary"
        >
          Flip Card
        </button>
        <button
          onClick={handleNext}
          className="btn-primary"
        >
          Next Word
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FlashCard;
