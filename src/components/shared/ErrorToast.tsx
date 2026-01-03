import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'error' | 'success' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'error', duration: number = 5000) => {
        const id = crypto.randomUUID();
        const toast: Toast = { id, message, type, duration };
        setToasts((prev) => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ 
    toasts, 
    removeToast 
}) => {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    const icons = {
        error: AlertCircle,
        success: CheckCircle,
        info: Info,
        warning: AlertTriangle,
    };

    const styles = {
        error: 'bg-red-50 border-red-200 text-red-800',
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-orange-50 border-orange-200 text-orange-800',
    };

    const Icon = icons[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`${styles[toast.type]} border-2 rounded-ios-2xl p-4 shadow-ios-lg pointer-events-auto flex items-start gap-3`}
        >
            <Icon size={20} className="shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">{toast.message}</p>
            </div>
            <button
                onClick={() => onRemove(toast.id)}
                className="shrink-0 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

