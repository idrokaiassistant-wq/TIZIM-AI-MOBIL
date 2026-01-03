export * from './store/types';
export * from './store/mappers';
export * from './store/auth-store';
export * from './store/tasks-store';
export * from './store/habits-store';
export * from './store/finance-store';
export * from './store/notifications-store';
export * from './store/offline-store';

// Legacy useStore for backward compatibility (DEPRECATED)
// components should use useAuthStore, useTasksStore, etc. directly
import { useAuthStore } from './store/auth-store';
import { useTasksStore } from './store/tasks-store';
import { useHabitsStore } from './store/habits-store';
import { useFinanceStore } from './store/finance-store';

export const useStore = () => {
    const auth = useAuthStore();
    const taskStore = useTasksStore();
    const habitStore = useHabitsStore();
    const financeStore = useFinanceStore();

    return {
        ...auth,
        ...taskStore,
        ...habitStore,
        ...financeStore,
        // Combined loading state for legacy support
        loading: {
            auth: auth.loading,
            tasks: taskStore.loading,
            habits: habitStore.loading,
            transactions: financeStore.loading,
        },
        // Combined error (takes the first non-null error)
        error: auth.error || taskStore.error || habitStore.error || financeStore.error,
    };
};
