import React, { useState, useMemo } from 'react';
import { Card, Badge, Button } from '../../shared';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTasksStore } from '../../../lib/store';
import { motion } from 'framer-motion';

export const WeeklyView: React.FC = () => {
    const { tasks } = useTasksStore();
    const [currentWeek, setCurrentWeek] = useState(new Date());

    const weekDays = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];
    const weekDaysShort = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];

    const getWeekDates = (date: Date) => {
        const monday = new Date(date);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d;
        });
    };

    const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

    const getTasksForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return tasks.filter(task => task.date === dateStr);
    };

    const navigateWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentWeek(newDate);
    };

    const goToToday = () => {
        setCurrentWeek(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    const monthYear = weekStart.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Haftalik ko'rinish</h2>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">
                        {weekStart.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })} - {weekEnd.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
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
                            onClick={() => navigateWeek('prev')}
                            className="p-2"
                        >
                            <ChevronLeft size={18} />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigateWeek('next')}
                            className="p-2"
                        >
                            <ChevronRight size={18} />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Week days header */}
            <Card glass className="p-3">
                <div className="grid grid-cols-7 gap-2">
                    {weekDaysShort.map((day, i) => {
                        const date = weekDates[i];
                        const dayTasks = getTasksForDate(date);
                        const pendingCount = dayTasks.filter(t => t.status === 'pending').length;
                        const doneCount = dayTasks.filter(t => t.status === 'done').length;

                        return (
                            <div
                                key={i}
                                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                                    isToday(date)
                                        ? 'bg-accent text-white shadow-lg'
                                        : 'bg-white/50 text-slate-600'
                                }`}
                            >
                                <span className="text-[10px] font-bold opacity-70 uppercase mb-1">
                                    {day}
                                </span>
                                <span className={`text-lg font-extrabold mb-1 ${isToday(date) ? 'text-white' : 'text-slate-900'}`}>
                                    {date.getDate()}
                                </span>
                                {dayTasks.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                        {pendingCount > 0 && (
                                            <span className={`text-[8px] px-1 py-0.5 rounded ${isToday(date) ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'}`}>
                                                {pendingCount}
                                            </span>
                                        )}
                                        {doneCount > 0 && (
                                            <span className={`text-[8px] px-1 py-0.5 rounded ${isToday(date) ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {doneCount}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Tasks by day */}
            <div className="flex-1 space-y-6 overflow-y-auto pb-6">
                {weekDates.map((date, dayIndex) => {
                    const dayTasks = getTasksForDate(date);
                    const pendingTasks = dayTasks.filter(t => t.status === 'pending');
                    const doneTasks = dayTasks.filter(t => t.status === 'done');

                    if (dayTasks.length === 0) return null;

                    return (
                        <motion.div
                            key={date.toISOString()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: dayIndex * 0.1 }}
                            className="space-y-3"
                        >
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900">
                                    {weekDays[dayIndex]}, {date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'long' })}
                                </h3>
                                <Badge variant="gray" className="text-[10px]">
                                    {dayTasks.length} ta
                                </Badge>
                            </div>

                            {pendingTasks.length > 0 && (
                                <div className="space-y-2">
                                    {pendingTasks.map((task) => (
                                        <Card
                                            key={task.id}
                                            className="p-3 border-l-4 border-l-accent"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 text-sm mb-1">
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
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {doneTasks.length > 0 && (
                                <div className="space-y-2 opacity-60">
                                    {doneTasks.map((task) => (
                                        <Card
                                            key={task.id}
                                            className="p-3 border-l-4 border-l-emerald-500"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-600 text-sm mb-1 line-through">
                                                        {task.title}
                                                    </h4>
                                                    <Badge variant="gray">Bajarildi</Badge>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

