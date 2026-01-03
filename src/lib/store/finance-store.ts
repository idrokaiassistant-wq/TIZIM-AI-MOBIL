import { create } from 'zustand';
import { transactionsApi } from '../api';
import type { ApiError } from '../api/types';
import type { TransactionLocal } from './types';
import { mapTransactionFromAPI, mapTransactionToAPI } from './mappers';

interface FinanceState {
    transactions: TransactionLocal[];
    loading: boolean;
    error: string | null;
    fetchTransactions: (filters?: { search?: string; startDate?: string; endDate?: string; transactionType?: string }) => Promise<void>;
    addTransaction: (transaction: Partial<TransactionLocal>) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<TransactionLocal>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
    transactions: [],
    loading: false,
    error: null,

    fetchTransactions: async (filters?: { search?: string; startDate?: string; endDate?: string; transactionType?: string }) => {
        set({ loading: true, error: null });
        try {
            const apiFilters: { search?: string; start_date?: string; end_date?: string; transaction_type?: string } = {};
            if (filters?.search) apiFilters.search = filters.search;
            if (filters?.startDate) apiFilters.start_date = filters.startDate;
            if (filters?.endDate) apiFilters.end_date = filters.endDate;
            if (filters?.transactionType) apiFilters.transaction_type = filters.transactionType;
            const transactions = await transactionsApi.getAll(apiFilters);
            set({
                transactions: transactions.map(mapTransactionFromAPI),
                loading: false
            });
        } catch (error) {
            const apiError = error as ApiError;
            set({
                error: apiError.detail || 'Failed to fetch transactions',
                loading: false
            });
        }
    },

    addTransaction: async (transaction: Partial<TransactionLocal>) => {
        set({ error: null });
        try {
            const newTransaction = await transactionsApi.create(mapTransactionToAPI(transaction as TransactionLocal));
            set({ transactions: [mapTransactionFromAPI(newTransaction), ...get().transactions] });
        } catch (error) {
            const apiError = error as ApiError;
            set({ error: apiError.detail || 'Failed to create transaction' });
            throw error;
        }
    },

    updateTransaction: async (id: string, transaction: Partial<TransactionLocal>) => {
        set({ error: null });
        try {
            const updatedTransaction = await transactionsApi.update(id, mapTransactionToAPI(transaction as TransactionLocal));
            set({
                transactions: get().transactions.map(t => t.id === id ? mapTransactionFromAPI(updatedTransaction) : t)
            });
        } catch (error) {
            const apiError = error as ApiError;
            set({ error: apiError.detail || 'Failed to update transaction' });
            throw error;
        }
    },

    deleteTransaction: async (id: string) => {
        set({ error: null });
        try {
            await transactionsApi.delete(id);
            set({ transactions: get().transactions.filter(t => t.id !== id) });
        } catch (error) {
            const apiError = error as ApiError;
            set({ error: apiError.detail || 'Failed to delete transaction' });
            throw error;
        }
    },
}));
