import React, { createContext, useContext, useState, useEffect } from 'react';
import { favoritesAPI, historyAPI } from '../services/api';
import { useAuth } from './AuthContext';

const DictionaryContext = createContext();

export const DictionaryProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    setFavoritesLoading(true);
    try {
      const res = await favoritesAPI.getFavorites();
      setFavorites(res.data.favorites || []);
    } catch (err) {
      console.error("Failed to fetch favorites:", err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    setHistoryLoading(true);
    try {
      const res = await historyAPI.getHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("Failed to fetch search history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
      fetchHistory();
    } else {
      setFavorites([]);
      setHistory([]);
    }
  }, [isAuthenticated]);

  const addFavorite = async (wordId) => {
    try {
      const res = await favoritesAPI.addFavorite(wordId);
      await fetchFavorites();
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to add favorite';
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      const res = await favoritesAPI.removeFavorite(favoriteId);
      setFavorites((prev) => prev.filter((item) => item.favorite_id !== favoriteId));
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to remove favorite';
    }
  };

  const removeFavoriteByWordId = async (wordId) => {
    const favItem = favorites.find(f => f.id === wordId);
    if (favItem && favItem.favorite_id) {
      return removeFavorite(favItem.favorite_id);
    }
    throw new Error('Word is not favorited');
  };

  const clearHistory = async () => {
    try {
      await historyAPI.clearHistory();
      setHistory([]);
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to clear history';
    }
  };

  const deleteHistoryEntry = async (id) => {
    try {
      await historyAPI.deleteHistoryEntry(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw err.response?.data?.detail || 'Failed to delete history entry';
    }
  };

  const checkIsFavorited = (wordId) => {
    return favorites.some(f => f.id === wordId);
  };

  return (
    <DictionaryContext.Provider
      value={{
        favorites,
        history,
        favoritesLoading,
        historyLoading,
        fetchFavorites,
        fetchHistory,
        addFavorite,
        removeFavorite,
        removeFavoriteByWordId,
        clearHistory,
        deleteHistoryEntry,
        checkIsFavorited,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
};

export const useDictionary = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
};
