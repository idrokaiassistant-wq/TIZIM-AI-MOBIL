import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card } from '../shared';
import { useAuthStore } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { Mail, Lock, Eye, EyeOff, Phone, MessageSquare } from 'lucide-react';
import { authApi } from '../../lib/api';

type LoginMethod = 'email' | 'telegram';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, loginWithTelegram, loading } = useAuthStore();
    const { showToast } = useToast();
    const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
    
    // Email/Password state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    
    // Telegram state
    const [phoneNumber, setPhoneNumber] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [telegramErrors, setTelegramErrors] = useState<{ phoneNumber?: string; code?: string }>({});

    const validateEmail = () => {
        const newErrors: { email?: string; password?: string } = {};
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePhoneNumber = (phone: string): boolean => {
        // Remove all non-digit characters
        const digits = phone.replace(/\D/g, '');
        // Check if it's a valid Uzbekistan phone number (9 or 12 digits)
        return digits.length >= 9 && digits.length <= 12;
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail()) return;

        try {
            await login(email, password);
            showToast('Muvaffaqiyatli kirildi!', 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast('Kirishda xatolik yuz berdi. Email va parolni tekshiring.', 'error');
        }
    };

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { phoneNumber?: string } = {};
        
        if (!phoneNumber) {
            newErrors.phoneNumber = 'Telefon raqami kiritish majburiy';
        } else if (!validatePhoneNumber(phoneNumber)) {
            newErrors.phoneNumber = 'Telefon raqami formati noto\'g\'ri';
        }
        
        setTelegramErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSendingCode(true);
        try {
            await authApi.sendTelegramCode(phoneNumber);
            setCodeSent(true);
            showToast('Tasdiqlash kodi yuborildi!', 'success');
        } catch (error) {
            const apiError = error as { detail?: string };
            showToast(apiError.detail || 'Kod yuborishda xatolik yuz berdi', 'error');
        } finally {
            setSendingCode(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { code?: string } = {};
        
        if (!code) {
            newErrors.code = 'Kod kiritish majburiy';
        } else if (code.length !== 6 || !/^\d+$/.test(code)) {
            newErrors.code = 'Kod 6 xonali raqam bo\'lishi kerak';
        }
        
        setTelegramErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        try {
            await loginWithTelegram(phoneNumber, code);
            showToast('Muvaffaqiyatli kirildi!', 'success');
            navigate('/dashboard');
        } catch (error) {
            const apiError = error as { detail?: string };
            showToast(apiError.detail || 'Kodni tasdiqlashda xatolik yuz berdi', 'error');
        }
    };

    return (
        <div className="min-h-screen bg-ios-bg flex items-center justify-center p-5">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <img src="/assets/icon.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-ios" />
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Xush kelibsiz!</h1>
                    <p className="text-slate-500 text-sm">Hisobingizga kiring</p>
                </div>

                <Card className="p-6 space-y-5">
                    {/* Login Method Selector */}
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-ios-xl">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod('email');
                                setCodeSent(false);
                                setCode('');
                                setErrors({});
                                setTelegramErrors({});
                            }}
                            className={`flex-1 py-2 px-4 rounded-ios-lg font-bold text-sm transition-colors ${
                                loginMethod === 'email'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Mail className="inline mr-2" size={16} />
                            Email
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod('telegram');
                                setEmail('');
                                setPassword('');
                                setErrors({});
                                setTelegramErrors({});
                            }}
                            className={`flex-1 py-2 px-4 rounded-ios-lg font-bold text-sm transition-colors ${
                                loginMethod === 'telegram'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <MessageSquare className="inline mr-2" size={16} />
                            Telegram
                        </button>
                    </div>

                    {loginMethod === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
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

                            <Button
                                type="submit"
                                className="w-full py-3.5 font-bold text-lg"
                                disabled={loading}
                            >
                                {loading ? 'Kirilmoqda...' : 'Kirish'}
                            </Button>
                        </form>
                    ) : (
                        <>
                            {!codeSent ? (
                                <form onSubmit={handleSendCode} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Telefon raqami
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className={`w-full pl-12 pr-4 py-3 rounded-ios-2xl border-2 ${
                                                    telegramErrors.phoneNumber
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-slate-200 bg-white'
                                                } focus:border-accent focus:outline-none transition-colors`}
                                                placeholder="+998901234567"
                                            />
                                        </div>
                                        {telegramErrors.phoneNumber && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {telegramErrors.phoneNumber}
                                            </p>
                                        )}
                                        <p className="text-slate-400 text-xs mt-2">
                                            Telegram bot orqali tasdiqlash kodi yuboriladi
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-3.5 font-bold text-lg"
                                        disabled={sendingCode}
                                    >
                                        {sendingCode ? 'Yuborilmoqda...' : 'Kod yuborish'}
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyCode} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">
                                            Tasdiqlash kodi
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                type="text"
                                                value={code}
                                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                className={`w-full pl-12 pr-4 py-3 rounded-ios-2xl border-2 text-center text-2xl tracking-widest font-bold ${
                                                    telegramErrors.code
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-slate-200 bg-white'
                                                } focus:border-accent focus:outline-none transition-colors`}
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                        </div>
                                        {telegramErrors.code && (
                                            <p className="text-red-500 text-xs mt-1 font-medium">
                                                {telegramErrors.code}
                                            </p>
                                        )}
                                        <p className="text-slate-400 text-xs mt-2 text-center">
                                            {phoneNumber} raqamiga yuborilgan kodni kiriting
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setCodeSent(false);
                                                setCode('');
                                            }}
                                            className="text-accent text-xs font-bold mt-2 hover:underline"
                                        >
                                            Kodni qayta yuborish
                                        </button>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-3.5 font-bold text-lg"
                                        disabled={loading}
                                    >
                                        {loading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
                                    </Button>
                                </form>
                            )}
                        </>
                    )}

                    {loginMethod === 'email' && (
                        <div className="text-center text-sm text-slate-500">
                            Hisobingiz yo'qmi?{' '}
                            <Link to="/register" className="text-accent font-bold hover:underline">
                                Ro'yxatdan o'tish
                            </Link>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
