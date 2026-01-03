import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingSpinner, LoadingOverlay } from '../shared';
import { Plus, Calendar, TrendingUp, Target, Zap, BookOpen, CheckCircle2 } from 'lucide-react';
import { productivityApi } from '../../lib/api';
import type { ProductivityLog, ProductivityStats } from '../../lib/api/types';
import { useToast } from '../shared/ErrorToast';
import { ProductivityLogForm } from './ProductivityLogForm';

export const ProductivityHome: React.FC = () => {
    const { showToast } = useToast();
    const [logs, setLogs] = useState<ProductivityLog[]>([]);
    const [stats, setStats] = useState<ProductivityStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [logsData, statsData] = await Promise.all([
                productivityApi.getAllLogs({
                    start_date: selectedDate,
                    end_date: selectedDate,
                    limit: 100
                }),
                productivityApi.getStats({
                    start_date: selectedDate,
                    end_date: selectedDate
                })
            ]);
            setLogs(logsData);
            setStats(statsData);
        } catch (error) {
            showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLog = async (logData: Partial<ProductivityLog>) => {
        try {
            await productivityApi.createLog({
                ...logData,
                log_date: selectedDate
            });
            showToast('Produktivlik jurnali muvaffaqiyatli qo\'shildi', 'success');
            setShowForm(false);
            loadData();
        } catch (error) {
            showToast('Jurnal qo\'shishda xatolik yuz berdi', 'error');
        }
    };

    const handleUpdateLog = async (logId: string, logData: Partial<ProductivityLog>) => {
        try {
            await productivityApi.updateLog(logId, logData);
            showToast('Jurnal muvaffaqiyatli yangilandi', 'success');
            loadData();
        } catch (error) {
            showToast('Jurnalni yangilashda xatolik yuz berdi', 'error');
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (!window.confirm('Bu jurnalni o\'chirishni xohlaysizmi?')) return;
        
        try {
            await productivityApi.deleteLog(logId);
            showToast('Jurnal muvaffaqiyatli o\'chirildi', 'success');
            loadData();
        } catch (error) {
            showToast('Jurnalni o\'chirishda xatolik yuz berdi', 'error');
        }
    };

    const todayLog = logs.find(log => log.log_date === selectedDate);
    const tasksCompletionRate = stats ? (stats.total_tasks > 0 ? (stats.total_tasks_completed / stats.total_tasks) * 100 : 0) : 0;
    const habitsCompletionRate = stats ? (stats.total_habits > 0 ? (stats.total_habits_completed / stats.total_habits) * 100 : 0) : 0;

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg relative">
            {loading && <LoadingOverlay />}

            <div className="flex justify-between items-center pt-2">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Produktivlik</h1>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">
                        {new Date(selectedDate).toLocaleDateString('uz-UZ', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <Button
                    className="w-10 h-10 rounded-2xl p-0 flex items-center justify-center shadow-lg"
                    onClick={() => setShowForm(true)}
                >
                    <Plus size={20} className="text-white" />
                </Button>
            </div>

            {/* Date Picker */}
            <div className="flex gap-2">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="flex-1 bg-white/50 border-none rounded-2xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 ios-transition"
                />
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 size={20} className="text-blue-600" />
                            <span className="text-xs font-bold text-blue-600">Vazifalar</span>
                        </div>
                        <div className="text-2xl font-black text-blue-900">
                            {stats.total_tasks_completed}/{stats.total_tasks}
                        </div>
                        <div className="text-xs text-blue-700 font-medium mt-1">
                            {tasksCompletionRate.toFixed(0)}% bajarildi
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                            <Zap size={20} className="text-purple-600" />
                            <span className="text-xs font-bold text-purple-600">Odatlar</span>
                        </div>
                        <div className="text-2xl font-black text-purple-900">
                            {stats.total_habits_completed}/{stats.total_habits}
                        </div>
                        <div className="text-xs text-purple-700 font-medium mt-1">
                            {habitsCompletionRate.toFixed(0)}% bajarildi
                        </div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                            <Target size={20} className="text-orange-600" />
                            <span className="text-xs font-bold text-orange-600">Focus Vaqti</span>
                        </div>
                        <div className="text-2xl font-black text-orange-900">
                            {stats.total_focus_time_minutes}
                        </div>
                        <div className="text-xs text-orange-700 font-medium mt-1">daqiqa</div>
                    </Card>

                    <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={20} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-600">Energiya</span>
                        </div>
                        <div className="text-2xl font-black text-emerald-900">
                            {stats.average_energy_level.toFixed(1)}
                        </div>
                        <div className="text-xs text-emerald-700 font-medium mt-1">o'rtacha</div>
                    </Card>
                </div>
            )}

            {/* Today's Log */}
            {todayLog ? (
                <Card className="p-5 bg-white/80 border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900">Bugungi Jurnal</h3>
                        <div className="flex gap-2">
                            <Button
                                className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-xl"
                                onClick={() => {
                                    // Edit functionality
                                }}
                            >
                                Tahrirlash
                            </Button>
                            <Button
                                className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-xl"
                                onClick={() => handleDeleteLog(todayLog.id)}
                            >
                                O'chirish
                            </Button>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Kayfiyat:</span>
                            <span className="text-sm font-bold text-slate-900">{todayLog.mood || 'Belgilanmagan'}</span>
                        </div>
                        {todayLog.notes && (
                            <div>
                                <span className="text-sm text-slate-600">Eslatmalar:</span>
                                <p className="text-sm text-slate-900 mt-1">{todayLog.notes}</p>
                            </div>
                        )}
                    </div>
                </Card>
            ) : (
                <Card className="p-8 bg-white/50 border-slate-200 text-center">
                    <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm font-medium">
                        Bugun uchun jurnal yozilmagan
                    </p>
                    <Button
                        className="mt-4 px-6 py-2.5 bg-accent text-white rounded-xl font-bold"
                        onClick={() => setShowForm(true)}
                    >
                        Jurnal Yozish
                    </Button>
                </Card>
            )}

            {/* Form Modal */}
            {showForm && (
                <ProductivityLogForm
                    log={todayLog}
                    onSave={todayLog ? (data) => handleUpdateLog(todayLog.id, data) : handleCreateLog}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};


