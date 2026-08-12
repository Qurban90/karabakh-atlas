import { create } from 'zustand';
import type { Category, City } from '../api/types';

export const YEARS = [2023, 2024, 2025, 2026] as const;

interface AppState {
  /** Timeline year — drives map markers, statuses and analytics. */
  year: number;
  category: Category | null;
  city: City | null;
  query: string;
  selectedLocationId: string | null;
  setYear: (year: number) => void;
  setCategory: (category: Category | null) => void;
  setCity: (city: City | null) => void;
  setQuery: (query: string) => void;
  selectLocation: (id: string | null) => void;
}

export const useApp = create<AppState>((set) => ({
  year: 2026,
  category: null,
  city: null,
  query: '',
  selectedLocationId: null,
  setYear: (year) => set({ year }),
  setCategory: (category) => set({ category }),
  setCity: (city) => set({ city }),
  setQuery: (query) => set({ query }),
  selectLocation: (selectedLocationId) => set({ selectedLocationId })
}));
