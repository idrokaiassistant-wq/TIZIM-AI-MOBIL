import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
    size = 'md',
    className = '' 
}) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizes[size]} border-4 border-slate-200 border-t-accent rounded-full animate-spin`} />
        </div>
    );
};

export const LoadingOverlay: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-ios-2xl">
            {children || <LoadingSpinner size="lg" />}
        </div>
    );
};

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-ios-2xl ${className}`} />
    );
};

