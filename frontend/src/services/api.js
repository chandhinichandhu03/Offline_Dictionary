import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Only clear storage if this is NOT a login/register request
      // (login failures return 401 too but shouldn't wipe existing session)
      const url = error.config?.url || '';
      const isAuthRoute = url.includes('/api/login') || url.includes('/api/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (fullName, email, username, password, confirmPassword) => 
    api.post('/api/register', { full_name: fullName, email, username, password, confirm_password: confirmPassword }),
  login: (identifier, password) => 
    api.post('/api/login', { identifier, password }),
  getProfile: () => api.get('/api/profile'),
  updateProfile: (fullName, email) => api.put('/api/profile', { full_name: fullName, email }),
};

export const dictionaryAPI = {
  searchWord: (word) => api.get(`/api/search-word/${word}`),
  analyzeWord: (word) => api.post('/api/analyze-word', { word }),
  getSuggestions: (q) => api.get(`/api/suggestions`, { params: { q } }),
};

export const sentenceAPI = {
  analyzeSentence: (sentence) => api.post('/api/analyze-sentence', { sentence }),
};

export const favoritesAPI = {
  getFavorites: () => api.get('/api/favorites'),
  addFavorite: (wordId) => api.post('/api/favorite', { word_id: wordId }),
  removeFavorite: (favoriteId) => api.delete(`/api/favorite/${favoriteId}`),
};

export const historyAPI = {
  getHistory: () => api.get('/api/history'),
  clearHistory: () => api.delete('/api/history'),
  deleteHistoryEntry: (id) => api.delete(`/api/history/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard'),
};

export const quizAPI = {
  getVocabularyQuiz: (count = 10) => api.get('/api/quiz/words', { params: { count } }),
  getSynonymQuiz: (count = 10) => api.get('/api/quiz/synonyms', { params: { count } }),
  submitQuiz: (score, total, quizType = 'vocabulary') => 
    api.post('/api/quiz/submit', { score, total, quiz_type: quizType }),
  getQuizResults: () => api.get('/api/quiz/results'),
  getFlashcard: () => api.get('/api/quiz/flashcard'),
};

export const adminAPI = {
  getWords: (page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    return api.get('/api/admin/words', { params: { skip, limit } });
  },
  createWord: (wordData) => api.post('/api/admin/words', wordData),
  updateWord: (id, wordData) => api.put(`/api/admin/words/${id}`, wordData),
  deleteWord: (id) => api.delete(`/api/admin/words/${id}`),
  importCSV: (formData) => api.post('/api/admin/import-csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportCSV: () => api.get('/api/admin/export-csv', { responseType: 'blob' }),
};

export default api;
