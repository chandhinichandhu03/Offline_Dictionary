import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { DictionaryProvider } from './context/DictionaryContext';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DictionarySearch from './pages/DictionarySearch';
import SentenceAnalyzer from './pages/SentenceAnalyzer';
import GrammarAnalyzer from './pages/GrammarAnalyzer';
import VocabularyPractice from './pages/VocabularyPractice';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DictionaryProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 antialiased">
              {/* Background glow graphics */}
              <div className="mesh-glow">
                <div className="mesh-glow-1"></div>
                <div className="mesh-glow-2"></div>
                <div className="mesh-glow-3"></div>
              </div>

              {/* Navbar Header */}
              <Navbar />

              {/* Page Container */}
              <main className="flex-1 flex flex-col">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Offline learning tools (public but with limitations if not authenticated) */}
                  <Route path="/search" element={<DictionarySearch />} />
                  <Route path="/analyze-sentence" element={<SentenceAnalyzer />} />
                  <Route path="/analyze-grammar" element={<GrammarAnalyzer />} />
                  <Route path="/practice" element={<VocabularyPractice />} />

                  {/* Private protected routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/favorites"
                    element={
                      <ProtectedRoute>
                        <Favorites />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin role route */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminPanel />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </DictionaryProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
