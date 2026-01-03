import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../../shared';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTasksStore } from '../../../lib/store';
import { motion } from 'framer-motion';

export const MonthlyView: React.FC = () => {
    const { tasks } = useTasksStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const weekDays = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];

    const getMonthDates = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const startDate = new Date(firstDay);
        const dayOfWeek = startDate.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startDate.setDate(startDate.getDate() + diff);

        const dates: Date[] = [];
        const currentDate = new Date(startDate);
        
        // Generate 42 days (6 weeks)
        for (let i = 0; i < 42; i++) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    };

    const monthDates = useMemo(() => getMonthDates(currentMonth), [currentMonth]);

    const getTasksForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => task.date === dateStr);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        setCurrentMonth(newDate);
    };

    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(null);
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isCurrentMonth = (date: Date) => {
        return date.getMonth() === currentMonth.getMonth() && 
               date.getFullYear() === currentMonth.getFullYear();
    };

    const monthYear = currentMonth.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
    const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Oylik ko'rinish</h2>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">{monthYear}</p>
                </div>
                <div className="flex items-center gap-2">
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
                                <motion.button
                                    key={i}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(date)}
                                    className={`
                                        aspect-square p-1.5 rounded-lg text-xs font-bold transition-all
                                        ${!isCurrentMonth(date) ? 'text-slate-300' : 'text-slate-700'}
                                        ${isToday(date) ? 'bg-accent text-white shadow-lg' : ''}
                                        ${isSelected && !isToday(date) ? 'bg-slate-200' : ''}
                                        ${!isSelected && !isToday(date) && isCurrentMonth(date) ? 'hover:bg-slate-100' : ''}
                                    `}
                                >
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <span>{date.getDate()}</span>
                                        {pendingCount > 0 && (
                                            <span className={`
                                                w-1.5 h-1.5 rounded-full mt-0.5
                                                ${isToday(date) ? 'bg-white' : 'bg-orange-500'}
                                            `} />
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </Card>

            {/* Selected date tasks */}
            {selectedDate && selectedDateTasks.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                >
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

                    <div className="space-y-2">
                        {selectedDateTasks.map((task) => (
                            <Card
                                key={task.id}
                                className={`p-3 border-l-4 ${
                                    task.status === 'done' 
                                        ? 'border-l-emerald-500 opacity-60' 
                                        : 'border-l-accent'
                                }`}
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
                                </div>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}

            {selectedDate && selectedDateTasks.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-sm">
                    Bu kunda vazifalar yo'q
                </div>
            )}
        </div>
    );
};

