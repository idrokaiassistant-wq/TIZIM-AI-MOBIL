import React, { useState, useMemo, useCallback } from 'react';
import { Card, Badge, Button } from '../../shared';
import { ChevronLeft, ChevronRight, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { useTasksStore, type TaskLocal } from '../../../lib/store';
import { useToast } from '../../shared/ErrorToast';
import { motion, AnimatePresence } from 'framer-motion';

interface DragState {
    taskId: string | null;
    sourceDate: string | null;
}

export const CalendarView: React.FC = () => {
    const { tasks, updateTask, deleteTask, toggleTask } = useTasksStore();
    const { showToast } = useToast();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dragState, setDragState] = useState<DragState>({ taskId: null, sourceDate: null });
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [editingTask, setEditingTask] = useState<string | null>(null);

    const weekDays = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];

    const getMonthDates = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + diff);

        const dates: Date[] = [];
        const currentDate = new Date(startDate);
        
        for (let i = 0; i < 42; i++) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    };

    const monthDates = useMemo(() => getMonthDates(currentMonth), [currentMonth]);

    const getTasksForDate = useCallback((date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => task.date === dateStr);
    }, [tasks]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newDate);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth() && 
               date.getFullYear() === currentMonth.getFullYear();
    };

    const handleDragStart = (taskId: string, date: string) => {
        setDragState({ taskId, sourceDate: date });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetDate: Date) => {
        if (!dragState.taskId || !dragState.sourceDate) return;

        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        if (targetDateStr === dragState.sourceDate) {
            setDragState({ taskId: null, sourceDate: null });
            return;
        }

        try {
            await updateTask(dragState.taskId, { date: targetDateStr });
            showToast('Vazifa muvaffaqiyatli ko\'chirildi', 'success');
        } catch {
            showToast('Vazifani ko\'chirishda xatolik yuz berdi', 'error');
        }

        setDragState({ taskId: null, sourceDate: null });
    };

    const handleTaskClick = (taskId: string, e: React.MouseEvent) => {
        if (e.ctrlKey || e.metaKey) {
            setSelectedTasks(prev => {
                const newSet = new Set(prev);
                if (newSet.has(taskId)) {
                    newSet.delete(taskId);
                } else {
                    newSet.add(taskId);
                }
                return newSet;
            });
        } else {
            setSelectedTasks(new Set([taskId]));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedTasks.size === 0) return;

        if (!window.confirm(`${selectedTasks.size} ta vazifani o'chirishni xohlaysizmi?`)) {
            return;
        }

        try {
            await Promise.all(Array.from(selectedTasks).map(id => deleteTask(id)));
            showToast(`${selectedTasks.size} ta vazifa muvaffaqiyatli o'chirildi`, 'success');
            setSelectedTasks(new Set());
        } catch {
            showToast('Vazifalarni o\'chirishda xatolik yuz berdi', 'error');
        }
    };

    const monthYear = currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Kalendar ko'rinish</h2>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">{monthYear}</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedTasks.size > 0 && (
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleDeleteSelected}
                            className="text-xs"
                        >
                            <Trash2 size={14} />
                            {selectedTasks.size} ta o'chirish
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={goToToday}
                        className="text-xs"
                    >
                        <Calendar size={14} />
                        Bugun
                    </Button>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonth('prev')}
                            className="p-2"
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateMonth('next')}
                            className="p-2"
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card glass className="p-3">
                <div className="space-y-2">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day, i) => (
                            <div key={i} className="text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {day}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-1">
                        {monthDates.map((date, i) => {
                            const dayTasks = getTasksForDate(date);
                            const pendingCount = dayTasks.filter(t => t.status === 'pending').length;
                            const isSelected = selectedDate?.toDateString() === date.toDateString();

                            return (
                                <motion.div
                                    key={i}
                                    onDragOver={handleDragOver}
                                    onDrop={() => handleDrop(date)}
                                    className={`
                                        aspect-square p-1 rounded-lg transition-all min-h-[60px]
                                        ${!isCurrentMonth(date) ? 'opacity-30' : ''}
                                        ${isToday(date) ? 'bg-accent/10 border-2 border-accent' : ''}
                                        ${isSelected && !isToday(date) ? 'bg-slate-100 border border-slate-300' : ''}
                                        ${!isSelected && !isToday(date) && isCurrentMonth(date) ? 'hover:bg-slate-50 border border-transparent hover:border-slate-200' : 'border border-transparent'}
                                        cursor-pointer
                                    `}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <div className="flex flex-col h-full">
                                        <span className={`
                                            text-xs font-bold mb-1
                                            ${isToday(date) ? 'text-accent' : 'text-slate-700'}
                                        `}>
                                            {date.getDate()}
                                        </span>
                                        <div className="flex-1 space-y-0.5 overflow-hidden">
                                            {dayTasks.slice(0, 3).map((task) => (
                                                <div
                                                    key={task.id}
                                                    draggable
                                                    onDragStart={() => handleDragStart(task.id, task.date)}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleTaskClick(task.id, e);
                                                    }}
                                                    className={`
                                                        text-[8px] px-1 py-0.5 rounded truncate cursor-move
                                                        ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700 line-through' : 'bg-accent/20 text-accent'}
                                                        ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}
                                                    `}
                                                    title={task.title}
                                                >
                                                    {task.title}
                                                </div>
                                            ))}
                                            {dayTasks.length > 3 && (
                                                <div className="text-[8px] text-slate-400 font-medium">
                                                    +{dayTasks.length - 3} ta
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Selected date tasks */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="flex-1 space-y-3 overflow-y-auto"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                    {selectedDate.toLocaleDateString('uz-UZ', { 
                                        weekday: 'long', 
                                        day: 'numeric', 
                                        month: 'long' 
                                    })}
                                </h3>
                                <Badge variant="gray" className="text-[10px]">
                                    {selectedDateTasks.length} ta
                                </Badge>
                            </div>
                        </div>

                        {selectedDateTasks.length > 0 ? (
                            <div className="space-y-2">
                                {selectedDateTasks.map((task) => (
                                    <Card
                                        key={task.id}
                                        className={`p-3 border-l-4 transition-all ${
                                            task.status === 'done' 
                                                ? 'border-l-emerald-500 opacity-60' 
                                                : 'border-l-accent'
                                        } ${selectedTasks.has(task.id) ? 'ring-2 ring-blue-500' : ''}`}
                                        onClick={(e) => handleTaskClick(task.id, e)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className={`font-bold text-sm mb-1 ${
                                                    task.status === 'done' 
                                                        ? 'text-slate-600 line-through' 
                                                        : 'text-slate-800'
                                                }`}>
                                                    {task.title}
                                                </h4>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {task.time && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            {task.time}
                                                        </span>
                                                    )}
                                                    <Badge variant={task.color || 'blue'}>
                                                        {task.cat}
                                                    </Badge>
                                                    {task.status === 'done' && (
                                                        <Badge variant="gray">Bajarildi</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleTask(task.id);
                                                    }}
                                                    className="text-gray-300 hover:text-slate-600 p-1"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Bu kunda vazifalar yo'q
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

