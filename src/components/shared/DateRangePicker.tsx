import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Card } from './UI';

interface DateRangePickerProps {
    startDate: string | null;
    endDate: string | null;
    onChange: (startDate: string | null, endDate: string | null) => void;
    onClose: () => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    startDate,
    endDate,
    onChange,
    onClose,
}) => {
    const [localStartDate, setLocalStartDate] = useState(startDate || '');
    const [localEndDate, setLocalEndDate] = useState(endDate || '');

    const handleApply = () => {
        onChange(
            localStartDate || null,
            localEndDate || null
        );
        onClose();
    };

    const handleClear = () => {
        setLocalStartDate('');
        setLocalEndDate('');
        onChange(null, null);
        onClose();
    };

    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const quickSelect = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setLocalStartDate(start.toISOString().split('T')[0]);
        setLocalEndDate(end.toISOString().split('T')[0]);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="bg-white max-w-md w-full p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-black text-slate-900">Sana Oralig'i</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 ios-transition"
                    >
                        <X size={18} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">
                            Boshlanish Sanasi
                        </label>
                        <input
                            type="date"
                            value={localStartDate}
                            onChange={(e) => setLocalStartDate(e.target.value)}
                            max={today}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 text-slate-900 font-medium"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block">
                            Tugash Sanasi
                        </label>
                        <input
                            type="date"
                            value={localEndDate}
                            onChange={(e) => setLocalEndDate(e.target.value)}
                            max={today}
                            min={localStartDate || undefined}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 text-slate-900 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Tezkor Tanlov</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={() => quickSelect(7)}
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 ios-transition"
                        >
                            Oxirgi 7 kun
                        </button>
                        <button
                            onClick={() => quickSelect(30)}
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 ios-transition"
                        >
                            Oxirgi 30 kun
                        </button>
                        <button
                            onClick={() => quickSelect(90)}
                            className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 ios-transition"
                        >
                            Oxirgi 90 kun
                        </button>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        onClick={handleClear}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 ios-transition"
                    >
                        Tozalash
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white font-bold hover:bg-accent-dark ios-transition"
                    >
                        Qo'llash
                    </button>
                </div>
            </Card>
        </div>
    );
};


