import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ActivityChartProps {
    data: Array<{ date: string; tasks: number; habits: number; transactions: number }>;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm font-bold">
                Ma'lumotlar yo'q
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                    dataKey="date"
                    stroke="#64748b"
                    fontSize={10}
                    tick={{ fill: '#64748b' }}
                />
                <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tick={{ fill: '#64748b' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                    }}
                />
                <Line
                    type="monotone"
                    dataKey="tasks"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Vazifalar"
                />
                <Line
                    type="monotone"
                    dataKey="habits"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Odatlar"
                />
                <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="Tranzaksiyalar"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};


