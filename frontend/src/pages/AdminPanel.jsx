import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AdminPanel = () => {
  const [words, setWords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingWordId, setEditingWordId] = useState(null);
  const [wordForm, setWordForm] = useState({
    word: '',
    meaning: '',
    pos: 'noun',
    synonyms: '',
    antonyms: '',
    example: '',
    phonetic: '',
    frequency: 0,
  });

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchWords = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getWords(page, limit);
      setWords(res.data.words || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dictionary words');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWords();
  }, [page]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setWordForm({
      word: '',
      meaning: '',
      pos: 'noun',
      synonyms: '',
      antonyms: '',
      example: '',
      phonetic: '',
      frequency: 0,
    });
    setEditingWordId(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (w) => {
    setModalMode('edit');
    setWordForm({
      word: w.word,
      meaning: w.meaning,
      pos: w.pos || 'noun',
      synonyms: w.synonyms || '',
      antonyms: w.antonyms || '',
      example: w.example || '',
      phonetic: w.phonetic || '',
      frequency: w.frequency || 0,
    });
    setEditingWordId(w.id);
    setShowModal(true);
  };

  const handleWordDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this word from the dictionary?")) {
      try {
        await adminAPI.deleteWord(id);
        setSuccess('Word deleted successfully');
        fetchWords();
      } catch (err) {
        setError('Failed to delete word');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!wordForm.word.trim() || !wordForm.meaning.trim()) {
      alert("Word and Meaning are required");
      return;
    }

    try {
      if (modalMode === 'create') {
        await adminAPI.createWord(wordForm);
        setSuccess('Word added successfully');
      } else {
        await adminAPI.updateWord(editingWordId, wordForm);
        setSuccess('Word updated successfully');
      }
      setShowModal(false);
      fetchWords();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed");
    }
  };

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleCsvImport = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setImporting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const res = await adminAPI.importCSV(formData);
      setSuccess(res.data.message);
      setCsvFile(null);
      document.getElementById('csv-file-input').value = '';
      setPage(1);
      fetchWords();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'CSV Import failed. Check formatting.');
    } finally {
      setImporting(false);
    }
  };

  const handleCsvExport = async () => {
    try {
      const res = await adminAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'lexilearn_dictionary_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export CSV file");
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Lexical Admin Control
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Manage your offline dictionary database, import/export word listings.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleCsvExport} className="btn-secondary py-2.5 px-4 text-xs font-bold uppercase tracking-wider">
            Export CSV
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider">
            Add Word
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Grid of database import and display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left import sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Bulk CSV Import
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Upload a comma-separated CSV with headers: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px]">word,meaning,pos,synonyms,antonyms,example,phonetic,frequency</code>.
            </p>
            <form onSubmit={handleCsvImport} className="space-y-4">
              <div>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
              <button
                type="submit"
                disabled={importing || !csvFile}
                className="w-full btn-secondary py-2 text-xs font-bold"
              >
                {importing ? 'Importing...' : 'Upload & Import'}
              </button>
            </form>
          </div>
        </div>

        {/* Right word listings table */}
        <div className="lg:col-span-3 glass-card rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800/80">
              <thead className="bg-slate-50/50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Word</th>
                  <th className="px-6 py-4 text-left">POS</th>
                  <th className="px-6 py-4 text-left">Meaning</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-20">
                      <div className="relative w-10 h-10 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : words.length > 0 ? (
                  words.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                      <td className="px-6 py-4 whitespace-nowrap font-bold capitalize">
                        {w.word}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                        {w.pos || 'N/A'}
                      </td>
                      <td className="px-6 py-4 max-w-sm truncate text-slate-500 dark:text-slate-400 font-medium">
                        {w.meaning}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(w)}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:opacity-80"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleWordDelete(w.id)}
                          className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 rounded-lg hover:opacity-80"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-400 dark:text-slate-600">
                      No words available in the local dictionary database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-900/20">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Page {page} of {totalPages} ({total} total words)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/80"
                >
                  Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-all hover:bg-slate-50 dark:hover:bg-slate-700/80"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CRUD Overlay Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card rounded-3xl w-full max-w-lg p-6 md:p-8 space-y-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
              {modalMode === 'create' ? 'Add Lexical Entry' : 'Edit Lexical Entry'}
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Word *
                  </label>
                  <input
                    type="text"
                    required
                    value={wordForm.word}
                    onChange={(e) => setWordForm({ ...wordForm, word: e.target.value })}
                    placeholder="e.g. dynamic"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Part of Speech
                  </label>
                  <select
                    value={wordForm.pos}
                    onChange={(e) => setWordForm({ ...wordForm, pos: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="pronoun">Pronoun</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Meaning *
                </label>
                <textarea
                  rows={2}
                  required
                  value={wordForm.meaning}
                  onChange={(e) => setWordForm({ ...wordForm, meaning: e.target.value })}
                  placeholder="Define the word..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Synonyms (comma separated)
                  </label>
                  <input
                    type="text"
                    value={wordForm.synonyms}
                    onChange={(e) => setWordForm({ ...wordForm, synonyms: e.target.value })}
                    placeholder="clarify, detail"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Antonyms (comma separated)
                  </label>
                  <input
                    type="text"
                    value={wordForm.antonyms}
                    onChange={(e) => setWordForm({ ...wordForm, antonyms: e.target.value })}
                    placeholder="confuse"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Phonetic IPA spelling
                  </label>
                  <input
                    type="text"
                    value={wordForm.phonetic}
                    onChange={(e) => setWordForm({ ...wordForm, phonetic: e.target.value })}
                    placeholder="e.g. [daɪˈnæmɪk]"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Frequency ranking
                  </label>
                  <input
                    type="number"
                    value={wordForm.frequency}
                    onChange={(e) => setWordForm({ ...wordForm, frequency: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                  Example Sentence
                </label>
                <input
                  type="text"
                  value={wordForm.example}
                  onChange={(e) => setWordForm({ ...wordForm, example: e.target.value })}
                  placeholder="Give a practical usage example sentence..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="submit"
                  className="btn-primary py-2.5 flex-1 text-xs uppercase font-extrabold tracking-wider"
                >
                  Save Entry
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary py-2.5 flex-1 text-xs uppercase font-extrabold tracking-wider"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
