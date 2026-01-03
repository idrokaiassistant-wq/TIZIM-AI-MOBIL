import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, LoadingSpinner, LoadingOverlay } from '../shared';
import { Settings, ArrowUpRight, ArrowDownLeft, ShoppingBag, Car, CreditCard, Coffee, Camera, Edit, Trash2, Search, Calendar, type LucideIcon } from 'lucide-react';
import { useFinanceStore, type TransactionLocal } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { ReceiptScanner } from './ReceiptScanner';
import { DateRangePicker } from '../shared/DateRangePicker';
import { AppSettings } from '../settings/AppSettings';
import { BudgetManager } from './BudgetManager';
import type { Transaction } from '../../lib/api/types';
import { mapTransactionFromAPI } from '../../lib/store/mappers';

const ICON_MAP: Record<string, LucideIcon> = {
    ShoppingBag, Car, CreditCard, Coffee
};

export const FinanceHome: React.FC = () => {
    const {
        transactions,
        loading,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction
    } = useFinanceStore();
    const { showToast } = useToast();
    const [editingTransaction, setEditingTransaction] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');
    const [activeTab, setActiveTab] = React.useState('Barchasi');
    const [showScanner, setShowScanner] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showBudgets, setShowBudgets] = useState(false);

    useEffect(() => {
        const transactionType = activeTab === 'Barchasi' ? undefined : activeTab === 'Kirim' ? 'income' : 'expense';
        fetchTransactions({
            search: searchQuery || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            transactionType
        }).catch(() => {
            showToast('Tranzaksiyalarni yuklashda xatolik yuz berdi', 'error');
        });
    }, [fetchTransactions, showToast, searchQuery, startDate, endDate, activeTab]);

    const handleScanReceipt = () => {
        setShowScanner(true);
    };

    const handleScanSuccess = async (transaction: Transaction) => {
        try {
            const localTx = mapTransactionFromAPI(transaction);
            await addTransaction(localTx);
            setShowScanner(false);
            showToast('Tranzaksiya muvaffaqiyatli qo\'shildi', 'success');
            await fetchTransactions();
        } catch {
            showToast('Tranzaksiya qo\'shishda xatolik yuz berdi', 'error');
        }
    };

    const handleScanCancel = () => {
        setShowScanner(false);
    };

    const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu tranzaksiyani o\'chirishni xohlaysizmi?')) {
            try {
                await deleteTransaction(id);
                showToast('Tranzaksiya muvaffaqiyatli o\'chirildi', 'success');
            } catch {
                showToast('Tranzaksiyani o\'chirishda xatolik yuz berdi', 'error');
            }
        }
    };

    const handleStartEdit = (transaction: TransactionLocal, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTransaction(transaction.id);
        setEditTitle(transaction.title);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editTitle.trim()) {
            showToast('Tranzaksiya nomi bo\'sh bo\'lmasligi kerak', 'warning');
            return;
        }
        try {
            await updateTransaction(id, { title: editTitle });
            setEditingTransaction(null);
            showToast('Tranzaksiya muvaffaqiyatli yangilandi', 'success');
        } catch {
            showToast('Tranzaksiyani yangilashda xatolik yuz berdi', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingTransaction(null);
        setEditTitle('');
    };

    const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0));

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Bugun';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Kecha';
        } else {
            return date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
        }
    };

    const filteredTransactions = transactions; // Already filtered by API

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up bg-ios-bg relative">
            {loading && <LoadingOverlay />}

            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Moliya</h1>
                    <p className="text-slate-500 text-xs font-bold mt-0.5 uppercase tracking-wide">Xarajatlaringiz nazorat ostida</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-10 h-10 glass rounded-full flex items-center justify-center text-white/80 active:scale-90 ios-transition hover:text-white"
                    >
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Qidiruv..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/50 border-none rounded-full px-4 h-10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 ios-transition pr-10"
                    />
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                    onClick={() => setShowDatePicker(true)}
                    className={`px-4 h-10 rounded-full text-xs font-bold flex items-center gap-2 ios-transition ${
                        startDate || endDate
                            ? 'bg-accent text-white'
                            : 'bg-white/50 text-slate-600 hover:bg-white/70'
                    }`}
                >
                    <Calendar size={16} />
                    {startDate || endDate ? 'Sana' : 'Filtr'}
                </button>
            </div>

            <div className="relative h-56 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-200 group transition-transform hover:scale-[1.02] duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                    <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-20 animate-pulse delay-700"></div>
                </div>
                <div className="relative p-8 flex flex-col h-full justify-between z-10 text-white">
                    <div>
                        <div className="flex justify-between items-start">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Umumiy Balans</p>
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                            </div>
                        </div>
                        <h2 className="text-4xl font-black tracking-tight mt-2 flex items-baseline gap-2">
                            {totalBalance.toLocaleString()} <span className="text-lg font-bold text-slate-500">UZS</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/5 hover:bg-white/10 ios-transition">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                    <ArrowDownLeft size={12} className="text-emerald-400" />
                                </div>
                                <span className="text-[10px] text-emerald-100 font-black uppercase tracking-widest">Kirim</span>
                            </div>
                            <p className="font-black text-xl tracking-tight">+{(income / 1000000).toFixed(1)}M</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/5 hover:bg-white/10 ios-transition">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                                    <ArrowUpRight size={12} className="text-red-400" />
                                </div>
                                <span className="text-[10px] text-red-100 font-black uppercase tracking-widest">Chiqim</span>
                            </div>
                            <p className="font-black text-xl tracking-tight">-{(expense / 1000000).toFixed(1)}M</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-200/50 p-1 rounded-2xl flex gap-1">
                {['Barchasi', 'Kirim', 'Chiqim', 'Byudjet'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            if (tab === 'Byudjet') {
                                setShowBudgets(true);
                            } else {
                                setActiveTab(tab);
                                setShowBudgets(false);
                            }
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ios-transition ${
                            (activeTab === tab && !showBudgets) || (tab === 'Byudjet' && showBudgets)
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {showBudgets ? (
                <BudgetManager />
            ) : (
                <>
                    {loading && transactions.length === 0 ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredTransactions.map((item) => {
                        const TxIcon = ICON_MAP[item.icon] || CreditCard;
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-4 bg-white rounded-ios-2xl border border-gray-100 shadow-ios active:scale-[0.98] ios-transition cursor-pointer hover:shadow-md relative group"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center ios-transition group-hover:scale-110 shadow-sm`}>
                                        <TxIcon size={22} />
                                    </div>
                                    <div className="flex-1">
                                        {editingTransaction === item.id ? (
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                onBlur={() => handleSaveEdit(item.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleSaveEdit(item.id);
                                                    } else if (e.key === 'Escape') {
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                className="w-full font-bold text-slate-800 text-sm border-2 border-accent rounded-lg px-2 py-1 focus:outline-none"
                                                autoFocus
                                            />
                                        ) : (
                                            <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="gray" className="scale-90 origin-left">{item.cat}</Badge>
                                            <span className="text-[10px] font-bold text-slate-300 uppercase">{formatDate(item.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`font-black text-sm tracking-tight ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                                    </span>
                                    {editingTransaction !== item.id && (
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleStartEdit(item, e)}
                                                className="text-gray-300 hover:text-slate-600 p-1"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteTransaction(item.id, e)}
                                                className="text-gray-300 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {transactions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <p className="text-slate-400 text-sm font-bold">Hozircha tranzaksiyalar yo'q!</p>
                            <span className="text-slate-300 text-[10px] mt-1 font-medium">Yangi tranzaksiya qo'shish uchun kamera tugmasini bosing.</span>
                        </div>
                    )}
                </div>
            )}

            <Card className="bg-indigo-50 border-none p-6 relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex-1">
                        <h3 className="text-indigo-900 font-bold text-lg mb-2">Moliyaviy Savodxonlik</h3>
                        <p className="text-indigo-700 text-xs leading-relaxed opacity-80">Harajatlaringizni tahlil qilib, ko'proq tejash yo'llarini o'rganing.</p>
                        <Button variant="primary" className="mt-4 scale-90 origin-left">Boshlash</Button>
                    </div>
                    <img src="/assets/finance-promo.png" alt="Finance" className="w-32 h-32 object-contain transform group-hover:scale-110 ios-transition" />
                </div>
            </Card>

            <button
                onClick={handleScanReceipt}
                className="fixed bottom-28 right-6 bg-accent text-white w-14 h-14 rounded-full shadow-2xl shadow-accent/40 flex items-center justify-center z-40 active:scale-90 ios-transition hover:bg-accent-dark ring-4 ring-white/10"
                disabled={loading}
            >
                {loading ? (
                    <LoadingSpinner size="sm" className="text-white" />
                ) : (
                    <Camera size={26} />
                )}
            </button>

            {showScanner && (
                <ReceiptScanner
                    onSuccess={handleScanSuccess}
                    onCancel={handleScanCancel}
                />
            )}

            {showDatePicker && (
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                    }}
                    onClose={() => setShowDatePicker(false)}
                />
            )}

            {showSettings && (
                <AppSettings onClose={() => setShowSettings(false)} />
            )}
                </>
            )}
        </div>
    );
};
