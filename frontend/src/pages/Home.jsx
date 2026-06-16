import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (word) => {
    navigate(`/search?q=${encodeURIComponent(word)}`);
  };

  const features = [
    {
      title: "Interactive Dictionary",
      desc: "Instant definition lookups, synonyms, antonyms, phonetics, and usage examples.",
      link: "/search",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Sentence Analyzer",
      desc: "Analyze complete sentences. Get detailed grammatical POS breakdowns, tense classifications, and meanings.",
      link: "/analyze-sentence",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Grammar & ML Analysis",
      desc: "ML-powered part-of-speech taggers and tense predictors that run completely offline.",
      link: "/analyze-grammar",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-600"
    },
    {
      title: "Vocabulary Practice",
      desc: "Retain vocabulary using interactive flashcards, vocabulary quizzes, and synonym quizzes.",
      link: "/practice",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <div className="flex-1 py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center items-center relative overflow-hidden">
      {/* Animated glow decorators */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

      <div className="text-center max-w-3xl mb-12 md:mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          Master Language Learning <br />
          <span className="gradient-text">100% Offline</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto">
          A premium dictionary and sentence analysis suite powered by local Machine Learning. No internet required, no cloud APIs.
        </p>
      </div>

      {/* Animated Hero Search Bar */}
      <div className="w-full max-w-2xl mb-20 shadow-2xl shadow-indigo-500/5 dark:shadow-indigo-500/2 rounded-2xl">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Features Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feat, index) => (
          <Link
            key={index}
            to={feat.link}
            className="glass-card glass-card-hover p-6 rounded-2xl flex flex-col text-left group"
          >
            <div className={`p-3 rounded-xl bg-gradient-to-tr ${feat.color} text-white w-fit mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
              {feat.icon}
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {feat.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {feat.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;
