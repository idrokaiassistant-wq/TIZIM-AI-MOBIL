import React, { useEffect, useState } from 'react';
import { Card, Button, LoadingSpinner, LoadingOverlay } from '../shared';
import { Plus, Check, Flame, Book, Droplets, Zap, Dumbbell, Edit, Trash2, Search, type LucideIcon } from 'lucide-react';
import { useHabitsStore, type HabitLocal } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';

const ICON_MAP: Record<string, LucideIcon> = {
    Book, Droplets, Zap, Dumbbell
};

export const HabitsHome: React.FC = () => {
    const {
        habits,
        loading,
        fetchHabits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit
    } = useHabitsStore();
    const { showToast } = useToast();
    const [editingHabit, setEditingHabit] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState('Barchasi');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchHabits({ search: searchQuery, category: activeCategory }).catch(() => {
            showToast('Odatlarni yuklashda xatolik yuz berdi', 'error');
        });
    }, [fetchHabits, showToast, searchQuery, activeCategory]);

    const weekDays = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];

    const handleAddHabit = async () => {
        const newHabit: Partial<HabitLocal> = {
            title: 'Yangi odat',
            goal: 'Har kuni',
            progress: 0,
            streak: 0,
            completed: false,
            icon: 'Zap',
            color: 'text-purple-500',
            bg: 'bg-purple-100'
        };
        try {
            await addHabit(newHabit);
            showToast('Odat muvaffaqiyatli qo\'shildi', 'success');
        } catch {
            showToast('Odat qo\'shishda xatolik yuz berdi', 'error');
        }
    };

    const handleToggleHabit = async (id: string) => {
        try {
            await toggleHabit(id);
            showToast('Odat bajarilgan deb belgilandi', 'success');
        } catch {
            showToast('Odatni bajarilgan deb belgilashda xatolik yuz berdi', 'error');
        }
    };

    const handleDeleteHabit = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu odatni o\'chirishni xohlaysizmi?')) {
            try {
                await deleteHabit(id);
                showToast('Odat muvaffaqiyatli o\'chirildi', 'success');
            } catch {
                showToast('Odatni o\'chirishda xatolik yuz berdi', 'error');
            }
        }
    };

    const handleStartEdit = (habit: HabitLocal, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingHabit(habit.id);
        setEditTitle(habit.title);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editTitle.trim()) {
            showToast('Odat nomi bo\'sh bo\'lmasligi kerak', 'warning');
            return;
        }
        try {
            await updateHabit(id, { title: editTitle });
            setEditingHabit(null);
            showToast('Odat muvaffaqiyatli yangilandi', 'success');
        } catch {
            showToast('Odatni yangilashda xatolik yuz berdi', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingHabit(null);
        setEditTitle('');
    };

    const filteredHabits = habits; // Already filtered by API

    // Calculate weekly completion from actual habits data
    const weeklyCompletion = filteredHabits.filter(h => h.completed).length;
    const totalHabits = filteredHabits.length;
    const completionRate = totalHabits > 0 ? (weeklyCompletion / totalHabits) * 100 : 0;

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up bg-ios-bg relative">
            {loading && <LoadingOverlay />}

            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Odatlar</h1>
                    <p className="text-slate-500 text-xs font-bold mt-0.5 uppercase tracking-wide">Barqarorlik — muvaffaqiyat kaliti</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Qidiruv..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-32 focus:w-48 bg-white/50 border-none rounded-full px-4 h-10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 ios-transition pr-10"
                        />
                        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <Button
                        className="w-10 h-10 rounded-2xl p-0 flex items-center justify-center shadow-lg"
                        onClick={handleAddHabit}
                        loading={loading}
                    >
                        <Plus size={24} />
                    </Button>
                </div>
            </div>

            <Card glass className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Haftalik Natija</h3>
                    <span className="text-[10px] font-black text-white bg-accent px-2 py-1 rounded-full">
                        {weeklyCompletion}/{totalHabits} ODAT
                    </span>
                </div>
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600">Bajarilgan:</span>
                        <span className="text-xs font-bold text-slate-900">{completionRate.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-accent rounded-full ios-transition" 
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>
                <div className="flex justify-between">
                    {weekDays.map((day, i) => {
                        // Calculate completion for each day (simplified - using current habits)
                        const dayCompleted = i < weeklyCompletion;
                        return (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400">{day}</span>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ios-transition ${
                                    dayCompleted 
                                        ? 'bg-accent border-accent text-white shadow-lg' 
                                        : 'bg-white border-slate-100 text-slate-200'
                                }`}>
                                    {dayCompleted ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">{i + 1}</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {['Barchasi', 'Salomatlik', 'O\'qish', 'Sport'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ios-transition ${activeCategory === cat ? 'bg-accent text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading && habits.length === 0 ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredHabits.map((habit) => {
                        const HabitIcon = ICON_MAP[habit.icon] || Zap;
                        return (
                            <Card
                                key={habit.id}
                                className="relative overflow-hidden group border-none shadow-md"
                                onClick={() => handleToggleHabit(habit.id)}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${habit.bg} ${habit.color} ios-transition group-hover:scale-110`}>
                                        <HabitIcon size={26} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            {editingHabit === habit.id ? (
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onBlur={() => handleSaveEdit(habit.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveEdit(habit.id);
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    className="flex-1 font-bold text-lg text-slate-800 border-2 border-accent rounded-lg px-2 py-1 focus:outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h4 className={`font-bold text-lg text-slate-800 ios-transition ${habit.completed ? 'line-through opacity-40' : ''}`}>
                                                    {habit.title}
                                                </h4>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-100" title={`Joriy: ${habit.streak}, Eng uzoq: ${habit.longestStreak || 0}`}>
                                                    <Flame size={12} className="text-orange-500 fill-orange-500" />
                                                    <span className="text-xs font-black text-orange-600">{habit.streak}</span>
                                                </div>
                                                {habit.longestStreak > 0 && habit.longestStreak !== habit.streak && (
                                                    <div className="text-[10px] font-bold text-slate-400">
                                                        Rekord: {habit.longestStreak}
                                                    </div>
                                                )}
                                                {editingHabit !== habit.id && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => handleStartEdit(habit, e)}
                                                            className="text-gray-300 hover:text-slate-600 p-1"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteHabit(habit.id, e)}
                                                            className="text-gray-300 hover:text-red-600 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end mt-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{habit.goal}</span>
                                            {!habit.completed && <span className="text-[10px] font-black text-slate-300">{habit.progress}%</span>}
                                        </div>
                                        {!habit.completed && (
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                                                <div className={`h-full rounded-full ios-transition ${habit.color.replace('text-', 'bg-')}`} style={{ width: `${habit.progress}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ios-transition shadow-sm ${habit.completed ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-50 text-slate-200 hover:bg-emerald-50 hover:text-emerald-500'}`}>
                                        <Check size={20} strokeWidth={3} />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                    {habits.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <p className="text-slate-400 text-sm font-bold">Hozircha odatlar yo'q!</p>
                            <span className="text-slate-300 text-[10px] mt-1 font-medium">Yangi odat qo'shish uchun + ni bosing.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
