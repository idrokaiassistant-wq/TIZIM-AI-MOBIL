import React from 'react';
import { Card } from '../shared';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { BudgetStatus } from '../../lib/api/types';

interface BudgetCardProps {
    budget: BudgetStatus;
    onEdit?: () => void;
    onDelete?: () => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
    const percentage = budget.percentage_used;
    const isWarning = percentage >= 80 && percentage < 100;
    const isOver = budget.is_over_budget;
    const isGood = percentage < 80;

    const getColorClass = () => {
        if (isOver) return 'from-red-50 to-red-100 border-red-200';
        if (isWarning) return 'from-orange-50 to-orange-100 border-orange-200';
        return 'from-emerald-50 to-emerald-100 border-emerald-200';
    };

    const getTextColor = () => {
        if (isOver) return 'text-red-600';
        if (isWarning) return 'text-orange-600';
        return 'text-emerald-600';
    };

    const getIcon = () => {
        if (isOver) return <AlertCircle size={20} className={getTextColor()} />;
        if (isWarning) return <TrendingUp size={20} className={getTextColor()} />;
        return <CheckCircle2 size={20} className={getTextColor()} />;
    };

    return (
        <Card className={`p-4 bg-gradient-to-br ${getColorClass()} relative overflow-hidden`}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <span className={`text-sm font-bold ${getTextColor()}`}>
                        {budget.category}
                    </span>
                </div>
                <div className="flex gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-xs px-2 py-1 bg-white/50 rounded-lg font-medium hover:bg-white/70 ios-transition"
                        >
                            Tahrirlash
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 ios-transition"
                        >
                            O'chirish
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Byudjet:</span>
                    <span className="text-sm font-bold text-slate-900">
                        {budget.budget_amount.toLocaleString()} UZS
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Sarflangan:</span>
                    <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-slate-900'}`}>
                        {budget.spent_amount.toLocaleString()} UZS
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Qolgan:</span>
                    <span className={`text-sm font-bold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                        {budget.remaining_amount.toLocaleString()} UZS
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">Foiz:</span>
                    <span className={`text-xs font-bold ${getTextColor()}`}>
                        {percentage.toFixed(1)}%
                    </span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-full rounded-full ios-transition ${
                            isOver ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                </div>
            </div>

            {isOver && (
                <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle size={12} />
                    Byudjetdan oshib ketdi!
                </div>
            )}
            {isWarning && !isOver && (
                <div className="mt-2 text-xs text-orange-600 font-medium flex items-center gap-1">
                    <TrendingUp size={12} />
                    Byudjetga yaqinlashmoqda
                </div>
            )}
        </Card>
    );
};


