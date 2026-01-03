import { useEffect } from 'react';
import { Card, LoadingSpinner } from '../shared';
import { CheckSquare, DollarSign, Activity, TrendingUp, Briefcase, User, BookOpen, Check, LogOut } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const { 
        tasks, 
        transactions, 
        user,
        loading,
        fetchTasks, 
        fetchTransactions,
        logout 
    } = useStore();
    const { showToast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([fetchTasks(), fetchTransactions()]);
            } catch {
                showToast('Ma\'lumotlarni yuklashda xatolik yuz berdi', 'error');
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
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-600 hover:text-red-600 active:scale-95 ios-transition"
                        title="Chiqish"
                    >
                        <LogOut size={18} />
                    </button>
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-slate-100 shadow-sm">
                        {userName.charAt(0).toUpperCase()}
                    </div>
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
                        {loading.tasks ? (
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
                        {loading.transactions ? (
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

            <Card glass className="p-5 animate-ios-slide-up" style={{ animationDelay: '300ms' } as React.CSSProperties}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Aktivlik</h3>
                    <TrendingUp size={16} className="text-slate-400" />
                </div>
                <div className="space-y-3">
                    {loading.tasks || loading.transactions ? (
                        <div className="flex justify-center py-4">
                            <LoadingSpinner size="sm" />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <CheckSquare size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Vazifalar</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{completedTasks} bajarildi</p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                    {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <DollarSign size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">Moliya</p>
                                        <p className="text-[10px] text-slate-400 font-medium">
                                            +{(income / 1000000).toFixed(1)}M / -{(expense / 1000000).toFixed(1)}M
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                                    {transactions.length} ta
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            <div className="animate-ios-slide-up" style={{ animationDelay: '400ms' } as React.CSSProperties}>
                <h3 className="text-sm font-black text-slate-900 mb-3 uppercase tracking-widest">Kategoriyalar</h3>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { icon: Briefcase, label: 'Ish', color: 'indigo', count: tasks.filter(t => t.cat === 'Ish').length },
                        { icon: User, label: 'Shaxsiy', color: 'blue', count: tasks.filter(t => t.cat === 'Shaxsiy').length },
                        { icon: BookOpen, label: 'O\'qish', color: 'orange', count: tasks.filter(t => t.cat === 'O\'qish').length },
                        { icon: Activity, label: 'Barchasi', color: 'purple', count: tasks.length },
                    ].map((cat, i) => {
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
                    })}
                </div>
            </div>
        </div>
    );
};
