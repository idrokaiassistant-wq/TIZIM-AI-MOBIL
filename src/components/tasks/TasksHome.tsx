import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, LoadingSpinner, LoadingOverlay, TaskSkeleton } from '../shared';
import { Search, Plus, Clock, Check, Edit, Trash2, AlertCircle, Flag, Calendar, Grid, List } from 'lucide-react';
import { useTasksStore, type TaskLocal } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { WeeklyView } from './views/WeeklyView';
import { MonthlyView } from './views/MonthlyView';
import { CalendarView } from './views/CalendarView';

export const TasksHome: React.FC = () => {
    const {
        tasks,
        loading,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask
    } = useTasksStore();
    const { showToast } = useToast();
    const [activeDate, setActiveDate] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
    const [activeCategory, setActiveCategory] = useState('Barchasi');
    const [editingTask, setEditingTask] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
    const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly' | 'calendar'>(() => {
        const saved = localStorage.getItem('tasksViewMode');
        return (saved as 'daily' | 'weekly' | 'monthly' | 'calendar') || 'daily';
    });

    useEffect(() => {
        fetchTasks().catch(() => {
            showToast('Vazifalarni yuklashda xatolik yuz berdi', 'error');
        });
    }, [fetchTasks, showToast]);

    useEffect(() => {
        localStorage.setItem('tasksViewMode', viewMode);
    }, [viewMode]);

    const weekDays = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];

    // Get dates for current week starting from Monday
    const getWeekDates = () => {
        const now = new Date();
        const monday = new Date(now);
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d.toISOString().split('T')[0];
        });
    };
    const dateObjects = getWeekDates();
    const dates = dateObjects.map(d => new Date(d).getDate());

    const handleAddTask = async () => {
        const newTask: Partial<TaskLocal> = {
            title: 'Yangi vazifa',
            time: 'Hozir',
            date: dateObjects[activeDate],
            cat: 'Ish',
            color: 'indigo',
            status: 'pending',
            isFocus: false
        };
        try {
            await addTask(newTask);
            showToast('Vazifa muvaffaqiyatli qo\'shildi', 'success');
        } catch {
            showToast('Vazifa qo\'shishda xatolik yuz berdi', 'error');
        }
    };

    const handleToggleTask = async (id: string) => {
        try {
            await toggleTask(id);
        } catch {
            showToast('Vazifa statusini o\'zgartirishda xatolik yuz berdi', 'error');
        }
    };

    const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bu vazifani o\'chirishni xohlaysizmi?')) {
            try {
                await deleteTask(id);
                showToast('Vazifa muvaffaqiyatli o\'chirildi', 'success');
            } catch {
                showToast('Vazifani o\'chirishda xatolik yuz berdi', 'error');
            }
        }
    };

    const handleStartEdit = (task: TaskLocal, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTask(task.id);
        setEditTitle(task.title);
    };

    const handleSaveEdit = async (id: string) => {
        if (!editTitle.trim()) {
            showToast('Vazifa nomi bo\'sh bo\'lmasligi kerak', 'warning');
            return;
        }
        try {
            await updateTask(id, { title: editTitle });
            setEditingTask(null);
            showToast('Vazifa muvaffaqiyatli yangilandi', 'success');
        } catch {
            showToast('Vazifani yangilashda xatolik yuz berdi', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingTask(null);
        setEditTitle('');
    };

    const filteredTasks = tasks.filter(t => {
        const matchesCategory = activeCategory === 'Barchasi' ? true : t.cat === activeCategory;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDate = t.date === dateObjects[activeDate];
        return matchesCategory && matchesSearch && matchesDate;
    });

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === 'priority') {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority || 'medium'] || 2;
            const bPriority = priorityOrder[b.priority || 'medium'] || 2;
            return bPriority - aPriority;
        } else if (sortBy === 'title') {
            return a.title.localeCompare(b.title);
        } else { // date
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
    });

    const pendingTasks = sortedTasks.filter(t => t.status === 'pending');
    const doneTasks = sortedTasks.filter(t => t.status === 'done');

    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long'
    });

    // Render different views
    if (viewMode === 'weekly') {
        return <WeeklyView />;
    }

    if (viewMode === 'monthly') {
        return <MonthlyView />;
    }

    if (viewMode === 'calendar') {
        return <CalendarView />;
    }

    // Daily view (default)
    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg relative">
            {loading.tasks && <LoadingOverlay />}

            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vazifalar</h1>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">Bugun, {dateStr}</p>
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
                        onClick={handleAddTask}
                        loading={loading.tasks}
                    >
                        <Plus size={24} />
                    </Button>
                </div>
            </div>

            {/* View Switcher */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {[
                    { value: 'daily', label: 'Kunlik', icon: List },
                    { value: 'weekly', label: 'Haftalik', icon: Grid },
                    { value: 'monthly', label: 'Oylik', icon: Calendar },
                    { value: 'calendar', label: 'Kalendar', icon: Calendar },
                ].map((view) => {
                    const Icon = view.icon;
                    return (
                        <button
                            key={view.value}
                            onClick={() => setViewMode(view.value as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ios-transition flex items-center gap-2 ${
                                viewMode === view.value 
                                    ? 'bg-accent text-white shadow-md' 
                                    : 'bg-white text-slate-500 border border-gray-100'
                            }`}
                        >
                            <Icon size={14} />
                            {view.label}
                        </button>
                    );
                })}
            </div>

            <Card glass className="p-3">
                <div className="flex justify-between items-center px-1">
                    {weekDays.map((day, i) => (
                        <div
                            key={i}
                            onClick={() => setActiveDate(i)}
                            className={`flex flex-col items-center justify-center w-10 h-14 rounded-xl cursor-pointer ios-transition ${activeDate === i ? 'bg-accent text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-white/50'}`}
                        >
                            <span className="text-[10px] font-bold opacity-70 uppercase">{day}</span>
                            <span className="text-sm font-extrabold">{dates[i]}</span>
                            {activeDate === i && <div className="w-1 h-1 bg-white rounded-full mt-1"></div>}
                        </div>
                    ))}
                </div>
            </Card>

            <div className="space-y-2">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    {['Barchasi', 'Ish', 'Shaxsiy', 'O\'qish'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap ios-transition ${activeCategory === cat ? 'bg-accent text-white shadow-md' : 'bg-white text-slate-500 border border-gray-100'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                    {[
                        { value: 'date', label: 'Sana' },
                        { value: 'priority', label: 'Prioritet' },
                        { value: 'title', label: 'Nomi' }
                    ].map((sort) => (
                        <button
                            key={sort.value}
                            onClick={() => setSortBy(sort.value as 'date' | 'priority' | 'title')}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap ios-transition ${
                                sortBy === sort.value 
                                    ? 'bg-slate-200 text-slate-900 shadow-sm' 
                                    : 'bg-white/50 text-slate-500 border border-gray-100'
                            }`}
                        >
                            {sort.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto pb-6">
                {/* Pending Tasks */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        Kutilmoqda
                        <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{pendingTasks.length}</span>
                    </h3>
                    {loading.tasks && tasks.length === 0 ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <TaskSkeleton key={i} />
                            ))}
                        </div>
                    ) : pendingTasks.length > 0 ? (
                        <div className="space-y-3">
                            {pendingTasks.map((task) => (
                                <Card
                                    key={task.id}
                                    className="flex items-start gap-4 active:scale-[0.99] border-l-4 border-l-accent p-4 group relative"
                                    onClick={() => handleToggleTask(task.id)}
                                >
                                    <div className="mt-1">
                                        <div className="w-6 h-6 border-2 border-slate-200 rounded-lg ios-transition group-hover:border-accent cursor-pointer flex items-center justify-center">
                                            {task.status === 'done' && <Check size={14} className="text-accent" />}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            {editingTask === task.id ? (
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onBlur={() => handleSaveEdit(task.id)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveEdit(task.id);
                                                        } else if (e.key === 'Escape') {
                                                            handleCancelEdit();
                                                        }
                                                    }}
                                                    className="flex-1 font-bold text-slate-800 text-sm leading-snug border-2 border-accent rounded-lg px-2 py-1 focus:outline-none"
                                                    autoFocus
                                                />
                                            ) : (
                                                <h4 className="font-bold text-slate-800 text-sm leading-snug">{task.title}</h4>
                                            )}
                                            <div className="flex gap-1">
                                                {editingTask !== task.id && (
                                                    <>
                                                        <button
                                                            onClick={(e) => handleStartEdit(task, e)}
                                                            className="text-gray-300 hover:text-slate-600 p-1"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDeleteTask(task.id, e)}
                                                            className="text-gray-300 hover:text-red-600 p-1"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                <Clock size={10} /> {task.time}
                                            </span>
                                            <Badge variant={task.color || 'blue'}>{task.cat}</Badge>
                                            {task.priority && (
                                                <Badge 
                                                    variant={
                                                        task.priority === 'high' ? 'red' : 
                                                        task.priority === 'medium' ? 'orange' : 
                                                        'gray'
                                                    }
                                                    className="flex items-center gap-1"
                                                >
                                                    <Flag size={8} />
                                                    {task.priority === 'high' ? 'Yuqori' : 
                                                     task.priority === 'medium' ? 'O\'rta' : 'Past'}
                                                </Badge>
                                            )}
                                            {task.description && (
                                                <span className="text-[10px] text-slate-400 italic" title={task.description}>
                                                    {task.description.length > 30 ? task.description.substring(0, 30) + '...' : task.description}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : pendingTasks.length === 0 && doneTasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-ios-slide-up">
                            <img src="/assets/empty-tasks.png" alt="Bo'sh" className="w-48 h-48 object-contain mb-4 opacity-80" />
                            <p className="text-slate-400 text-sm font-bold">Hozircha vazifalar yo'q!</p>
                            <span className="text-slate-300 text-[10px] mt-1 font-medium">Yangi vazifa qo'shish uchun + ni bosing.</span>
                        </div>
                    ) : null}
                </div>

                {/* Completed Tasks */}
                {doneTasks.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            Bajarildi
                            <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-[10px] font-bold">{doneTasks.length}</span>
                        </h3>
                        <div className="space-y-3">
                            {doneTasks.map((task) => (
                                <Card
                                    key={task.id}
                                    className="flex items-start gap-4 opacity-50 grayscale active:scale-[0.99] p-4"
                                    onClick={() => handleToggleTask(task.id)}
                                >
                                    <div className="mt-1">
                                        <div className="w-6 h-6 bg-emerald-500 border-2 border-emerald-500 rounded-lg flex items-center justify-center text-white">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800 text-sm leading-snug line-through">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="gray">Bajarildi</Badge>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
