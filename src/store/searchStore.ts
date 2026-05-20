import { create } from 'zustand';
import { NandaCatalog } from '../types/base_type';

interface SearchState {
  favorites: string[];
  recentSearches: string[];
  diagnosesCache: Record<string, NandaCatalog>;

  // Actions
  setFavorites: (favorites: string[]) => void;
  toggleFavoriteLocal: (nandaCode: string) => void;
  setRecentSearches: (searches: string[]) => void;
  addRecentSearch: (query: string) => void;
  removeRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  cacheDiagnoses: (diagnoses: NandaCatalog[]) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  favorites: [],
  recentSearches: [],
  diagnosesCache: {},

  setFavorites: (favorites) => set({ favorites }),

  setRecentSearches: (recentSearches) => set({ recentSearches }),

  toggleFavoriteLocal: (nandaCode) => set((state) => {
    const isFavorite = state.favorites.includes(nandaCode);
    const newFavorites = isFavorite 
      ? state.favorites.filter(code => code !== nandaCode)
      : [...state.favorites, nandaCode];
    return { favorites: newFavorites };
  }),

  addRecentSearch: (query) => set((state) => {
    if (!query.trim()) return state;
    // Remove if exists to avoid duplicates, then place at the start (LIFO ordering for searches)
    const filtered = state.recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase());
    const newHistory = [query, ...filtered].slice(0, 10); // Keep max 10 items
    return { recentSearches: newHistory };
  }),

  removeRecentSearch: (query) => set((state) => ({
    recentSearches: state.recentSearches.filter(s => s !== query)
  })),

  clearRecentSearches: () => set({ recentSearches: [] }),

  cacheDiagnoses: (diagnoses) => set((state) => {
    const newCache = { ...state.diagnosesCache };
    diagnoses.forEach(diag => {
      newCache[diag.codigo_nanda] = diag;
    });
    return { diagnosesCache: newCache };
  })
}));
