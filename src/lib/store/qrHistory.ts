import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseQRCode, type QRResult } from '../../utils/qrHandler';

export interface QRHistoryItem {
    id: string;
    data: string;
    type: QRResult['type'];
    parsed?: QRResult['parsed'];
    timestamp: string;
    favorite?: boolean;
    note?: string;
}

interface QRHistoryState {
    history: QRHistoryItem[];
    favorites: string[]; // IDs
    
    // Actions
    addToHistory: (data: string) => void;
    removeFromHistory: (id: string) => void;
    clearHistory: () => void;
    toggleFavorite: (id: string) => void;
    updateNote: (id: string, note: string) => void;
    getHistory: () => QRHistoryItem[];
    getFavorites: () => QRHistoryItem[];
    searchHistory: (query: string) => QRHistoryItem[];
}

export const useQRHistory = create<QRHistoryState>()(
    persist(
        (set, get) => ({
            history: [],
            favorites: [],
            
            addToHistory: (data: string) => {
                const result = parseQRCode(data);
                const item: QRHistoryItem = {
                    id: Date.now().toString(),
                    data,
                    type: result.type,
                    parsed: result.parsed,
                    timestamp: new Date().toISOString(),
                    favorite: false,
                };
                
                set((state) => ({
                    history: [item, ...state.history.filter(h => h.data !== data)].slice(0, 100), // Max 100 items
                }));
            },
            
            removeFromHistory: (id: string) => {
                set((state) => ({
                    history: state.history.filter(h => h.id !== id),
                    favorites: state.favorites.filter(f => f !== id),
                }));
            },
            
            clearHistory: () => {
                set({ history: [], favorites: [] });
            },
            
            toggleFavorite: (id: string) => {
                set((state) => {
                    const isFavorite = state.favorites.includes(id);
                    return {
                        favorites: isFavorite
                            ? state.favorites.filter(f => f !== id)
                            : [...state.favorites, id],
                        history: state.history.map(h =>
                            h.id === id ? { ...h, favorite: !isFavorite } : h
                        ),
                    };
                });
            },
            
            updateNote: (id: string, note: string) => {
                set((state) => ({
                    history: state.history.map(h =>
                        h.id === id ? { ...h, note } : h
                    ),
                }));
            },
            
            getHistory: () => {
                return get().history;
            },
            
            getFavorites: () => {
                const { history, favorites } = get();
                return history.filter(h => favorites.includes(h.id));
            },
            
            searchHistory: (query: string) => {
                const { history } = get();
                const lowerQuery = query.toLowerCase();
                return history.filter(h =>
                    h.data.toLowerCase().includes(lowerQuery) ||
                    h.note?.toLowerCase().includes(lowerQuery) ||
                    h.parsed?.url?.toLowerCase().includes(lowerQuery) ||
                    h.parsed?.email?.toLowerCase().includes(lowerQuery)
                );
            },
        }),
        {
            name: 'qr-history-storage',
        }
    )
);

