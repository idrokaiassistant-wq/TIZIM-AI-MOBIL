import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner, LoadingOverlay } from '../shared';
import { Plus, X, Calendar, DollarSign } from 'lucide-react';
import { budgetsApi } from '../../lib/api';
import type { Budget, BudgetStatus } from '../../lib/api/types';
import { useToast } from '../shared/ErrorToast';
import { BudgetCard } from './BudgetCard';

export const BudgetManager: React.FC = () => {
    const { showToast } = useToast();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

    useEffect(() => {
        loadBudgets();
    }, []);

    const loadBudgets = async () => {
        setLoading(true);
        try {
            const budgetsData = await budgetsApi.getAll({ is_active: true });
            setBudgets(budgetsData);
            
            // Load status for each budget
            const statuses = await Promise.all(
                budgetsData.map(budget => budgetsApi.getStatus(budget.id))
            );
            setBudgetStatuses(statuses);
        } catch (error) {
            showToast('Byudjetlarni yuklashda xatolik yuz berdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBudget = async (budgetData: Partial<Budget>) => {
        try {
            await budgetsApi.create(budgetData);
            showToast('Byudjet muvaffaqiyatli yaratildi', 'success');
            setShowForm(false);
            loadBudgets();
        } catch (error) {
            showToast('Byudjet yaratishda xatolik yuz berdi', 'error');
        }
    };

    const handleUpdateBudget = async (budgetId: string, budgetData: Partial<Budget>) => {
        try {
            await budgetsApi.update(budgetId, budgetData);
            showToast('Byudjet muvaffaqiyatli yangilandi', 'success');
            setShowForm(false);
            setEditingBudget(null);
            loadBudgets();
        } catch (error) {
            showToast('Byudjetni yangilashda xatolik yuz berdi', 'error');
        }
    };

    const handleDeleteBudget = async (budgetId: string) => {
        if (!window.confirm('Bu byudjetni o\'chirishni xohlaysizmi?')) return;
        
        try {
            await budgetsApi.delete(budgetId);
            showToast('Byudjet muvaffaqiyatli o\'chirildi', 'success');
            loadBudgets();
        } catch (error) {
            showToast('Byudjetni o\'chirishda xatolik yuz berdi', 'error');
        }
    };

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget);
        setShowForm(true);
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingBudget(null);
    };

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg relative">
            {loading && <LoadingOverlay />}

            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Byudjet Boshqaruvi</h1>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">
                        Faol byudjetlar
                    </p>
                </div>
                <Button
                    className="w-10 h-10 rounded-2xl p-0 flex items-center justify-center shadow-lg"
                    onClick={() => {
                        setEditingBudget(null);
                        setShowForm(true);
                    }}
                >
                    <Plus size={20} className="text-white" />
                </Button>
            </div>

            {/* Budgets List */}
            {budgetStatuses.length > 0 ? (
                <div className="space-y-3">
                    {budgetStatuses.map((status) => {
                        const budget = budgets.find(b => b.id === status.budget_id);
                        if (!budget) return null;
                        
                        return (
                            <BudgetCard
                                key={status.budget_id}
                                budget={status}
                                onEdit={() => handleEdit(budget)}
                                onDelete={() => handleDeleteBudget(budget.id)}
                            />
                        );
                    })}
                </div>
            ) : (
                <Card className="p-8 bg-white/50 border-slate-200 text-center">
                    <DollarSign size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm font-medium mb-4">
                        Hozircha byudjetlar yo'q
                    </p>
                    <Button
                        className="px-6 py-2.5 bg-accent text-white rounded-xl font-bold"
                        onClick={() => setShowForm(true)}
                    >
                        Byudjet Yaratish
                    </Button>
                </Card>
            )}

            {/* Budget Form */}
            {showForm && (
                <BudgetForm
                    budget={editingBudget}
                    onSave={editingBudget 
                        ? (data) => handleUpdateBudget(editingBudget.id, data)
                        : handleCreateBudget
                    }
                    onCancel={handleCancel}
                />
            )}
        </div>
    );
};

interface BudgetFormProps {
    budget?: Budget | null;
    onSave: (data: Partial<Budget>) => Promise<void>;
    onCancel: () => void;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        category: budget?.category || '',
        amount: budget?.amount || 0,
        period: budget?.period || 'monthly',
        start_date: budget?.start_date || new Date().toISOString().split('T')[0],
        end_date: budget?.end_date || '',
        is_active: budget?.is_active ?? true,
    });

    const periods = [
        { value: 'daily', label: 'Kunlik' },
        { value: 'weekly', label: 'Haftalik' },
        { value: 'monthly', label: 'Oylik' },
        { value: 'yearly', label: 'Yillik' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category || formData.amount <= 0) {
            return;
        }
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {budget ? 'Byudjetni Tahrirlash' : 'Yangi Byudjet'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 ios-transition"
                    >
                        <X size={18} className="text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Kategoriya
                        </label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="Masalan: Oziq-ovqat"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Miqdor (UZS)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Davr
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {periods.map((period) => (
                                <button
                                    key={period.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, period: period.value })}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold ios-transition ${
                                        formData.period === period.value
                                            ? 'bg-accent text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Boshlanish Sanasi
                        </label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Tugash Sanasi (ixtiyoriy)
                        </label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                            Faol
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-slate-100 text-slate-700 rounded-xl font-bold"
                        >
                            Bekor Qilish
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-accent text-white rounded-xl font-bold"
                        >
                            Saqlash
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


