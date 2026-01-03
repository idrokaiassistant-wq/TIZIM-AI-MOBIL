import React, { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../shared';
import { Check, Plus, BookOpen } from 'lucide-react';
import { useTasksStore, type TaskLocal } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';

export const TodayFocus: React.FC = () => {
    const {
        tasks,
        loading,
        fetchTasks,
        toggleTask,
        addTask
    } = useTasksStore();
    const { showToast } = useToast();
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchTasks().catch(() => {
            showToast('Vazifalarni yuklashda xatolik yuz berdi', 'error');
        });
    }, [fetchTasks, showToast]);

    const focusTasks = tasks.filter(t => t.isFocus && t.status === 'pending').slice(0, 3);

    const handleAddFocus = async () => {
        const newTask: Partial<TaskLocal> = {
            title: 'Yangi Focus vazifa',
            time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            cat: 'Ish',
            color: 'indigo',
            status: 'pending',
            isFocus: true
        };
        try {
            await addTask(newTask);
            showToast('Focus vazifa muvaffaqiyatli qo\'shildi', 'success');
        } catch {
            showToast('Focus vazifa qo\'shishda xatolik yuz berdi', 'error');
        }
    };

    const handleToggleTask = async (id: string) => {
        try {
            await toggleTask(id);
        } catch {
            showToast('Vazifa statusini o\'zgartirishda xatolik yuz berdi', 'error');
        }
    };

    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'short'
    });

    return (
        <div className="p-6 h-full flex flex-col animate-ios-slide-up bg-ios-bg">
            <div className="flex justify-between items-end mb-8 pt-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Bugun <span className="text-slate-400">Focus</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-1 font-semibold italic">Eng muhim 3 ta vazifa</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl shadow-ios border border-gray-100 group hover:scale-105 ios-transition">
                    <span className="text-sm font-extrabold text-slate-800">{dateStr}</span>
                </div>
            </div>

            <div className="flex-1 space-y-5">
                {loading && focusTasks.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                ) : (
                    <>
                        {focusTasks.map((task, index) => (
                            <div key={task.id} className="relative group">
                                {index === 0 && task.status !== 'done' && (
                                    <div className="absolute inset-x-4 -inset-y-2 bg-indigo-500 blur-3xl opacity-10 rounded-full group-hover:opacity-20 ios-transition"></div>
                                )}
                                <Card
                                    glass={task.status !== 'done'}
                                    className={`relative shadow-lg ios-transition ${task.status === 'done' ? 'bg-gray-100/50 opacity-60' : 'bg-white/90 ring-1 ring-white/20'} ${index === 0 ? 'ring-2 ring-indigo-500/20' : ''}`}
                                    onClick={() => handleToggleTask(task.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ios-transition ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 group-hover:border-indigo-400'}`}>
                                            {task.status === 'done' && <Check size={20} strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                {index === 0 && <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">#1 MUHIM</span>}
                                                {index === 1 && <span className="text-purple-600 text-[10px] font-black uppercase tracking-widest">#2 O'RTA</span>}
                                            </div>
                                            <h3 className={`text-lg font-bold leading-tight ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                {task.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-wide">{task.time}</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}

                        {focusTasks.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-slate-400 text-sm font-bold mb-2">Hozircha Focus vazifalar yo'q!</p>
                                <span className="text-slate-300 text-[10px] font-medium">Yangi Focus vazifa qo'shish uchun tugmani bosing.</span>
                            </div>
                        )}

                        <button
                            onClick={handleAddFocus}
                            className="w-full h-16 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center gap-3 text-slate-400 font-bold hover:bg-white hover:border-accent hover:text-accent ios-transition group"
                            disabled={loading}
                        >
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-accent/10 ios-transition">
                                {loading ? (
                                    <LoadingSpinner size="sm" />
                                ) : (
                                    <Plus size={18} />
                                )}
                            </div>
                            Vazifa qo'shish
                        </button>
                    </>
                )}
            </div>

            <div className="mt-8">
                <h3 className="font-bold text-slate-800 mb-4 text-sm ml-1 flex items-center gap-2">
                    <BookOpen size={16} className="text-yellow-500" /> Kunlik Eslatmalar
                </h3>
                <div className="bg-yellow-50/50 border border-yellow-200/50 rounded-3xl p-1 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200 rounded-full blur-[60px] opacity-20 -mr-12 -mt-12 group-hover:opacity-40 ios-transition"></div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full h-28 bg-transparent rounded-2xl p-4 placeholder-yellow-800/30 text-yellow-900 text-sm font-medium focus:outline-none resize-none leading-relaxed"
                        placeholder="Bugungi kun uchun muhim fikrlar..."
                    ></textarea>
                </div>
            </div>
        </div>
    );
};
