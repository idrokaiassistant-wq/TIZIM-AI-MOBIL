import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    icon?: React.ReactNode;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon,
    loading,
    className = '',
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base',
        xl: 'px-8 py-4 text-lg'
    };

    const variants = {
        primary: 'bg-accent text-white shadow-lg shadow-indigo-100/50 hover:bg-accent-dark hover:shadow-indigo-200/50 active:scale-95',
        secondary: 'bg-white text-slate-900 shadow-sm border border-slate-100 hover:bg-gray-50 active:scale-95',
        outline: 'bg-transparent border-2 border-slate-200 text-slate-700 hover:border-accent hover:text-accent active:scale-95',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 active:scale-95',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 active:scale-95',
        gradient: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-200/50 hover:shadow-indigo-300/60 active:scale-95'
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={loading || props.disabled}
            {...props}
        >
            {loading && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
            {!loading && icon && <span className="shrink-0">{icon}</span>}
            {children}
        </button>
    );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; glass?: boolean; onClick?: () => void }> = ({
    children,
    className = '',
    glass = false,
    onClick
}) => (
    <div
        onClick={onClick}
        className={`${glass ? 'glass' : 'bg-white shadow-ios-lg'} rounded-ios-2xl p-4 border border-white/20 ios-transition hover:shadow-premium ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
    >
        {children}
    </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: string; className?: string }> = ({
    children,
    variant = 'blue',
    className = ''
}) => {
    const variants: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600 border border-blue-100',
        indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
        purple: 'bg-purple-50 text-purple-600 border border-purple-100',
        emerald: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
        orange: 'bg-orange-50 text-orange-600 border border-orange-100',
        red: 'bg-red-50 text-red-600 border border-red-100',
        gray: 'bg-slate-50 text-slate-600 border border-slate-100',
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant] || variants.blue} ${className}`}>
            {children}
        </span>
    );
};
