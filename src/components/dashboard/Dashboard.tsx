import { useEffect, useState } from 'react';
import { Card, LoadingSpinner } from '../shared';
import { CheckSquare, DollarSign, Activity, TrendingUp, Briefcase, User, BookOpen, LogOut, Settings } from 'lucide-react';
import { useAuthStore, useTasksStore, useFinanceStore } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { useNavigate } from 'react-router-dom';
import { AppSettings } from '../settings/AppSettings';
import { ProfileSettings } from '../settings/ProfileSettings';
import { ActivityChart } from './ActivityChart';
import { analyticsApi } from '../../lib/api/analytics';
import { OfflineIndicator } from '../shared/OfflineIndicator';

export const Dashboard: React.FC = () => {
    const { user, logout } = useAuthStore();
    const { tasks, loading: tasksLoading, fetchTasks } = useTasksStore();
    const { transactions, loading: financeLoading, fetchTransactions } = useFinanceStore();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [activityData, setActivityData] = useState<Array<{ date: string; tasks: number; habits: number; transactions: number }>>([]);
    const [loadingActivity, setLoadingActivity] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([fetchTasks(), fetchTransactions()]);
                
                // Load activity data
                setLoadingActivity(true);
                const activity = await analyticsApi.getActivity();
                setActivityData(activity);
                setLoadingActivity(false);
            } catch {
                showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
                setLoadingActivity(false);
            }
        };
        loadData();
    }, [fetchTasks, fetchTransactions, showToast]);

    const handleLogout = () => {
        logout();
        showToast('Muvaffaqiyatli chiqildi', 'success');
        navigate('/login');
    };

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalBalance = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = Math.abs(transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0));

    const userName = user?.full_name || user?.email?.split('@')[0] || 'Foydalanuvchi';
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long'
    });

    return (
        <div className="p-5 space-y-7 pb-24">
            <OfflineIndicator />
            <header className="flex justify-between items-center pt-2 animate-ios-slide-up" style={{ animationDelay: '100ms' } as React.CSSProperties}>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <img src="/assets/icon.png" alt="Logo" className="w-14 h-14 rounded-2xl shadow-ios border border-white/20 relative" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                            Salom, {userName} 👋
                        </h1>
                        <p className="text-slate-400 text-[10px] font-black mt-0.5 uppercase tracking-[0.2em]">
                            {dateStr}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-600 hover:text-indigo-600 active:scale-95 ios-transition"
                        title="Sozlamalar"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={() => setShowProfile(true)}
                        className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-slate-100 shadow-sm hover:shadow-md ios-transition"
                        title="Profil"
                    >
                        {userName.charAt(0).toUpperCase()}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4 animate-ios-slide-up" style={{ animationDelay: '200ms' } as React.CSSProperties}>
                <Card glass className="p-4 relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-20 h-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <CheckSquare size={20} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vazifalar</span>
                        </div>
                        {tasksLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <h2 className="text-3xl font-black text-slate-900 mb-1">{completedTasks}/{tasks.length}</h2>
                                <p className="text-xs text-slate-500 font-bold">Bajarildi</p>
                            </>
                        )}
                    </div>
                </Card>

                <Card glass className="p-4 relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign size={20} className="text-emerald-600" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balans</span>
                        </div>
                        {financeLoading ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <h2 className="text-3xl font-black text-slate-900 mb-1">
                                    {(totalBalance / 1000000).toFixed(1)}M
                                </h2>
                                <p className="text-xs text-slate-500 font-bold">UZS</p>
                            </>
                        )}
                    </div>
                </Card>
            </div>

            <div className="animate-ios-slide-up" style={{ animationDelay: '300ms' } as React.CSSProperties}>
                <Card glass className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Aktivlik</h3>
                        <TrendingUp size={16} className="text-slate-400" />
                    </div>
                    {loadingActivity ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : (
                        <ActivityChart data={activityData} />
                    )}
                </Card>
            </div>

            <div className="animate-ios-slide-up" style={{ animationDelay: '400ms' } as React.CSSProperties}>
                <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest">Kategoriyalar</h3>
                <div className="grid grid-cols-2 gap-3">
                    {(() => {
                        // Get unique categories from tasks
                        const categories = Array.from(new Set(tasks.map(t => t.cat))).filter(Boolean);
                        const categoryCounts = categories.map(cat => ({
                            label: cat,
                            count: tasks.filter(t => t.cat === cat).length,
                            icon: Briefcase, // Default icon
                            color: 'indigo'
                        }));
                        
                        // Add "Barchasi" at the end
                        categoryCounts.push({
                            label: 'Barchasi',
                            count: tasks.length,
                            icon: Activity,
                            color: 'purple'
                        });
                        
                        // Limit to 4 items for grid
                        const displayCategories = categoryCounts.slice(0, 4);
                        
                        return displayCategories.map((cat, i) => {
                            const Icon = cat.icon;
                            return (
                                <Card key={i} glass className="p-4 group cursor-pointer active:scale-[0.98]">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-10 h-10 bg-${cat.color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 ios-transition`}>
                                            <Icon size={20} className={`text-${cat.color}-600`} />
                                        </div>
                                        <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {cat.count}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800">{cat.label}</p>
                                </Card>
                            );
                        });
                    })()}
                </div>
            </div>

            {showSettings && (
                <AppSettings onClose={() => setShowSettings(false)} />
            )}

            {showProfile && (
                <ProfileSettings onClose={() => setShowProfile(false)} />
            )}
        </div>
    );
};
