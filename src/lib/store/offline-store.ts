import { create } from 'zustand';

interface OfflineState {
    isOnline: boolean;
    syncQueue: Array<{ id: string; type: string; data: any }>;
    setIsOnline: (online: boolean) => void;
    addToQueue: (item: { id: string; type: string; data: any }) => void;
    clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()((set, get) => ({
    isOnline: navigator.onLine,
    syncQueue: [],

    setIsOnline: (online: boolean) => {
        set({ isOnline: online });
        if (online) {
            // Try to sync when coming online
            const queue = get().syncQueue;
            if (queue.length > 0) {
                console.log(`Syncing ${queue.length} queued items...`);
                // In a real implementation, you would sync these items
            }
        }
    },

    addToQueue: (item) => {
        set((state) => ({
            syncQueue: [...state.syncQueue, item],
        }));
    },

    clearQueue: () => {
        set({ syncQueue: [] });
    },
}));


