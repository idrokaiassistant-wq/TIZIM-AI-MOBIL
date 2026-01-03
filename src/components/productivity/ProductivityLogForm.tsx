import React, { useState, useEffect } from 'react';
import { Card, Button } from '../shared';
import { X } from 'lucide-react';
import type { ProductivityLog } from '../../lib/api/types';

interface ProductivityLogFormProps {
    log?: ProductivityLog;
    onSave: (data: Partial<ProductivityLog>) => Promise<void>;
    onCancel: () => void;
}

export const ProductivityLogForm: React.FC<ProductivityLogFormProps> = ({
    log,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState({
        tasks_completed: log?.tasks_completed || 0,
        tasks_total: log?.tasks_total || 0,
        habits_completed: log?.habits_completed || 0,
        habits_total: log?.habits_total || 0,
        focus_time_minutes: log?.focus_time_minutes || 0,
        energy_level: log?.energy_level || 5,
        mood: log?.mood || '',
        notes: log?.notes || ''
    });

    const moods = ['Great', 'Good', 'OK', 'Bad', 'Terrible'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {log ? 'Jurnalni Tahrirlash' : 'Yangi Jurnal'}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 ios-transition"
                    >
                        <X size={18} className="text-slate-600" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tasks */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Vazifalar
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.tasks_completed}
                                    onChange={(e) => setFormData({ ...formData, tasks_completed: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="Bajarilgan"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.tasks_total}
                                    onChange={(e) => setFormData({ ...formData, tasks_total: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="Jami"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Habits */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Odatlar
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.habits_completed}
                                    onChange={(e) => setFormData({ ...formData, habits_completed: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="Bajarilgan"
                                />
                            </div>
                            <div>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.habits_total}
                                    onChange={(e) => setFormData({ ...formData, habits_total: parseInt(e.target.value) || 0 })}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                                    placeholder="Jami"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Focus Time */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Focus Vaqti (daqiqa)
                        </label>
                        <input
                            type="number"
                            min="0"
                            value={formData.focus_time_minutes}
                            onChange={(e) => setFormData({ ...formData, focus_time_minutes: parseInt(e.target.value) || 0 })}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 h-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20"
                            placeholder="0"
                        />
                    </div>

                    {/* Energy Level */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Energiya Darajasi: {formData.energy_level}/10
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={formData.energy_level}
                            onChange={(e) => setFormData({ ...formData, energy_level: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    {/* Mood */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Kayfiyat
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {moods.map((mood) => (
                                <button
                                    key={mood}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, mood })}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold ios-transition ${
                                        formData.mood === mood
                                            ? 'bg-accent text-white'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Eslatmalar
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
                            rows={4}
                            placeholder="Bugun haqida eslatmalar..."
                        />
                    </div>

                    {/* Buttons */}
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


