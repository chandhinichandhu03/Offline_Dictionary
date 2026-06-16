import React, { useState, useEffect } from 'react';
import { quizAPI } from '../services/api';
import FlashCard from '../components/FlashCard';
import { useAuth } from '../context/AuthContext';

const VocabularyPractice = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('flashcards');

  // Flashcards state
  const [flashcard, setFlashcard] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);

  // Quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizType, setQuizType] = useState('vocabulary'); // 'vocabulary' or 'synonyms'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizCount, setQuizCount] = useState(10);
  const [answersLog, setAnswersLog] = useState([]); // for review

  // History state
  const [results, setResults] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Load first flashcard
  const fetchNextFlashcard = async () => {
    setCardLoading(true);
    try {
      const res = await quizAPI.getFlashcard();
      setFlashcard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCardLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'flashcards' && !flashcard) {
      fetchNextFlashcard();
    } else if (activeTab === 'history' && isAuthenticated) {
      fetchQuizHistory();
    }
  }, [activeTab]);

  const fetchQuizHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await quizAPI.getQuizResults();
      setResults(res.data.results || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Start Quiz
  const startQuiz = async (type) => {
    setQuizLoading(true);
    setQuizType(type);
    setQuizActive(true);
    setQuizFinished(false);
    setCurrentIdx(0);
    setScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAnswersLog([]);

    try {
      const res = type === 'vocabulary' 
        ? await quizAPI.getVocabularyQuiz(quizCount) 
        : await quizAPI.getSynonymQuiz(quizCount);
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Not enough vocabulary words to build quiz. Add more in Admin Panel.");
      setQuizActive(false);
    } finally {
      setQuizLoading(false);
    }
  };

  // Handle Option Click
  const handleOptionClick = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const question = questions[currentIdx];
    const isCorrect = option === question.correct_answer;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setAnswersLog(prev => [
      ...prev,
      {
        word: question.word,
        pos: question.pos,
        question: question.question_type === 'synonym' ? 'Synonym of' : 'Meaning of',
        selected: option,
        correct: question.correct_answer,
        isCorrect
      }
    ]);
  };

  // Next Question
  const handleNextQuestion = async () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz Finished
      setQuizFinished(true);
      if (isAuthenticated) {
        try {
          await quizAPI.submitQuiz(score + (selectedOption === questions[currentIdx].correct_answer ? 1 : 0), questions.length, quizType);
        } catch (err) {
          console.error("Failed to submit score:", err);
        }
      }
    }
  };

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Vocabulary Practice
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 font-medium">
          Review flashcards and challenge your memory with offline ML quizzes.
        </p>
      </div>

      {/* Navigation Tabs */}
      {!quizActive && (
        <div className="flex justify-center border-b border-slate-200 dark:border-slate-800/80">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('flashcards')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all focus:outline-none ${
                activeTab === 'flashcards'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all focus:outline-none ${
                activeTab === 'quiz'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              Practice Quizzes
            </button>
            {isAuthenticated && (
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all focus:outline-none ${
                  activeTab === 'history'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                Score Logs
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Tab Panels */}
      {!quizActive && activeTab === 'flashcards' && (
        <div className="py-6">
          {cardLoading ? (
            <div className="flex justify-center py-16">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
              </div>
            </div>
          ) : flashcard ? (
            <FlashCard wordData={flashcard} onNext={fetchNextFlashcard} />
          ) : (
            <div className="glass-card p-12 text-center rounded-3xl">
              <p className="text-slate-400 dark:text-slate-500">No words available in the local dictionary yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz setup panel */}
      {!quizActive && activeTab === 'quiz' && (
        <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vocab Quiz card */}
          <div className="glass-card p-8 rounded-3xl text-left space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl w-fit">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Word Meaning Quiz
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Answer multiple choice questions matching words to their correct dictionary definitions.
              </p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Questions</span>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                >
                  <option value={5}>5 Qs</option>
                  <option value={10}>10 Qs</option>
                  <option value={15}>15 Qs</option>
                </select>
              </div>
              <button
                onClick={() => startQuiz('vocabulary')}
                className="w-full btn-primary py-2.5 text-sm"
              >
                Start Quiz
              </button>
            </div>
          </div>

          {/* Synonym Quiz card */}
          <div className="glass-card p-8 rounded-3xl text-left space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl w-fit">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Synonym Quiz
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Challenge your vocabulary depth by picking equivalent synonym pairings for local targets.
              </p>
            </div>
            
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Questions</span>
                <select
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                >
                  <option value={5}>5 Qs</option>
                  <option value={10}>10 Qs</option>
                  <option value={15}>15 Qs</option>
                </select>
              </div>
              <button
                onClick={() => startQuiz('synonyms')}
                className="w-full btn-primary py-2.5 text-sm from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/25"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Quiz Dashboard */}
      {quizActive && !quizFinished && (
        <div className="py-6 max-w-2xl mx-auto space-y-6">
          {quizLoading ? (
            <div className="flex justify-center py-16">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
              </div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-6">
              {/* Quiz Header Progress */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <button
                  onClick={() => setQuizActive(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider"
                >
                  Exit Quiz
                </button>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
                ></div>
              </div>

              {/* Question card */}
              <div className="glass-card p-6 md:p-8 rounded-3xl space-y-8 text-center">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                    {quizType === 'vocabulary' 
                      ? `Select the correct meaning of:` 
                      : `Select a synonym for:`}
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white capitalize">
                    {questions[currentIdx].word}
                  </h2>
                  {questions[currentIdx].pos && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded capitalize">
                      {questions[currentIdx].pos}
                    </span>
                  )}
                </div>

                {/* Options list */}
                <div className="grid grid-cols-1 gap-3.5">
                  {questions[currentIdx].options.map((opt, idx) => {
                    const isCorrectOption = opt === questions[currentIdx].correct_answer;
                    const isSelectedOption = opt === selectedOption;

                    let btnStyle = "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200";
                    
                    if (isAnswered) {
                      if (isCorrectOption) {
                        btnStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400";
                      } else if (isSelectedOption) {
                        btnStyle = "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400";
                      } else {
                        btnStyle = "bg-white/20 dark:bg-slate-900/20 border-slate-100 dark:border-slate-900/60 text-slate-400 dark:text-slate-600";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={isAnswered}
                        className={`w-full p-4 border text-left text-sm font-semibold rounded-2xl transition-all duration-200 flex justify-between items-center ${btnStyle}`}
                      >
                        <span className="leading-normal">{opt}</span>
                        {isAnswered && isCorrectOption && (
                          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                          </svg>
                        )}
                        {isAnswered && isSelectedOption && !isCorrectOption && (
                          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Next Question Control */}
              {isAnswered && (
                <div className="flex justify-end animate-fade-in">
                  <button
                    onClick={handleNextQuestion}
                    className="btn-primary py-2.5 px-5 text-sm"
                  >
                    <span>{currentIdx + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-3xl">
              <p className="text-slate-400">Not enough words in the local dictionary to create this quiz.</p>
              <button onClick={() => setQuizActive(false)} className="btn-secondary py-2 mt-4 mx-auto text-sm">
                Go Back
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quiz Finished Results Summary */}
      {quizActive && quizFinished && (
        <div className="py-6 max-w-2xl mx-auto space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="glass-card p-8 rounded-3xl text-center space-y-4 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-md">
              🏆
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
                Quiz Finished!
              </h2>
              <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                Here is how you performed on this {quizType} quiz.
              </p>
            </div>

            <div className="py-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Final Score</div>
              <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                {score} / {questions.length}
              </div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">
                ({Math.round((score / questions.length) * 100)}% Accuracy)
              </div>
            </div>

            {!isAuthenticated && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                Tip: Sign in to save your practice history to the server database.
              </div>
            )}

            <div className="flex justify-center gap-4 pt-2">
              <button
                onClick={() => startQuiz(quizType)}
                className="btn-primary py-2.5 px-5 text-sm"
              >
                Restart Quiz
              </button>
              <button
                onClick={() => setQuizActive(false)}
                className="btn-secondary py-2.5 px-5 text-sm"
              >
                Back to Practices
              </button>
            </div>
          </div>

          {/* Question Review Log */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              Quiz Question Review
            </h3>
            
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto pr-1">
              {answersLog.map((log, idx) => (
                <div key={idx} className={`pt-4 first:pt-0 flex justify-between items-start gap-4`}>
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 capitalize text-sm">{log.word}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">({log.question})</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      <strong className="text-slate-600 dark:text-slate-300">Your Answer:</strong>{' '}
                      <span className={log.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-500 dark:text-red-400 font-medium'}>
                        {log.selected}
                      </span>
                    </p>
                    {!log.isCorrect && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-600 dark:text-slate-300">Correct Answer:</strong>{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{log.correct}</span>
                      </p>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md ${
                    log.isCorrect 
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                      : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                  }`}>
                    {log.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Score Logs */}
      {!quizActive && activeTab === 'history' && isAuthenticated && (
        <div className="py-6">
          {historyLoading ? (
            <div className="flex justify-center py-12">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-800/40 divide-y divide-slate-100 dark:divide-slate-800/60">
              {results.map((r, idx) => {
                const percentage = r.percentage;
                const isGood = percentage >= 70;
                
                return (
                  <div key={idx} className="flex justify-between items-center py-4 px-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                    <div className="space-y-0.5 text-left">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 capitalize">
                        {r.quiz_type} Quiz
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {new Date(r.taken_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {r.score}/{r.total} Qs
                      </span>
                      <span className={`px-3 py-1 text-xs font-black rounded-full ${
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
            <div className="glass-card p-12 text-center rounded-3xl">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">No quiz results logged. Challenge yourself in Practice Quizzes!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VocabularyPractice;
