import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card } from '../shared';
import { useAuthStore } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register, loading } = useAuthStore();
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; fullName?: string }>({});

    const validate = () => {
        const newErrors: { email?: string; password?: string; confirmPassword?: string; fullName?: string } = {};
        if (!email) {
            newErrors.email = 'Email kiritish majburiy';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email formati noto\'g\'ri';
        }
        if (!password) {
            newErrors.password = 'Parol kiritish majburiy';
        } else if (password.length < 6) {
            newErrors.password = 'Parol kamida 6 ta belgi bo\'lishi kerak';
        }
        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Parollar mos kelmaydi';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await register(email, password, fullName || undefined);
            showToast('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast('Ro\'yxatdan o\'tishda xatolik yuz berdi. Qayta urinib ko\'ring.', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-ios-bg flex items-center justify-center p-5">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/assets/icon.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-ios" />
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Ro'yxatdan o'tish</h1>
                    <p className="text-slate-500 text-sm">Yangi hisob yarating</p>
                </div>

                <Card className="p-6 space-y-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                To'liq ism
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-ios-2xl border-2 border-slate-200 bg-white focus:border-accent focus:outline-none transition-colors"
                                    placeholder="Ism Familiya"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3 rounded-ios-2xl border-2 ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                                        } focus:border-accent focus:outline-none transition-colors`}
                                    placeholder="email@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Parol
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full pl-12 pr-12 py-3 rounded-ios-2xl border-2 ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                                        } focus:border-accent focus:outline-none transition-colors`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Parolni tasdiqlash
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full pl-12 pr-12 py-3 rounded-ios-2xl border-2 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                                        } focus:border-accent focus:outline-none transition-colors`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                            disabled={loading}
                        >
                            Ro'yxatdan o'tish
                        </Button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-sm text-slate-500">
                            Allaqachon hisobingiz bormi?{' '}
                            <Link to="/login" className="text-accent font-bold hover:underline">
                                Kirish
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

