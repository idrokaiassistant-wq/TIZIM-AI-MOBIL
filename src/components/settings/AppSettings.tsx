import React, { useState } from 'react';
import { X, Moon, Sun, Globe, Bell, LogOut, Download, Upload } from 'lucide-react';
import { Card, Button } from '../shared';
import { ExportImport } from '../shared/ExportImport';
import { useAuthStore } from '../../lib/store';
import { useToast } from '../shared/ErrorToast';
import { useNavigate } from 'react-router-dom';

interface AppSettingsProps {
    onClose: () => void;
}

export const AppSettings: React.FC<AppSettingsProps> = ({ onClose }) => {
    const { logout } = useAuthStore();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [language, setLanguage] = useState<'uz' | 'en'>('uz');
    const [notifications, setNotifications] = useState(true);

    const [showExportImport, setShowExportImport] = useState(false);

    const handleLogout = () => {
        logout();
        showToast('Muvaffaqiyatli chiqildi', 'success');
        navigate('/login');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="bg-white max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900">Sozlamalar</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 ios-transition"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Tema */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                {theme === 'light' ? (
                                    <Sun size={20} className="text-yellow-500" />
                                ) : (
                                    <Moon size={20} className="text-indigo-500" />
                                )}
                                <div>
                                    <p className="font-bold text-slate-900">Tema</p>
                                    <p className="text-xs text-slate-500">Yorug'lik/Oqish</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                                className={`w-14 h-8 rounded-full relative transition-colors ${
                                    theme === 'dark' ? 'bg-accent' : 'bg-slate-300'
                                }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                                        theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Til */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Globe size={20} className="text-blue-500" />
                                <div>
                                    <p className="font-bold text-slate-900">Til</p>
                                    <p className="text-xs text-slate-500">O'zbek/Ingliz</p>
                                </div>
                            </div>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value as 'uz' | 'en')}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/20"
                            >
                                <option value="uz">O'zbek</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>

                    {/* Bildirishnomalar */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <Bell size={20} className="text-orange-500" />
                                <div>
                                    <p className="font-bold text-slate-900">Bildirishnomalar</p>
                                    <p className="text-xs text-slate-500">Push bildirishnomalar</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className={`w-14 h-8 rounded-full relative transition-colors ${
                                    notifications ? 'bg-accent' : 'bg-slate-300'
                                }`}
                            >
                                <div
                                    className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                                        notifications ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Eksport/Import */}
                    <div>
                        <button
                            onClick={() => setShowExportImport(!showExportImport)}
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-slate-100 ios-transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                    <Download size={20} className="text-emerald-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-slate-900">Eksport/Import</p>
                                    <p className="text-xs text-slate-500">Ma'lumotlarni eksport/import qilish</p>
                                </div>
                            </div>
                            <X 
                                size={18} 
                                className={`text-slate-400 transition-transform ${showExportImport ? 'rotate-90' : ''}`} 
                            />
                        </button>
                        {showExportImport && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <ExportImport onImportComplete={() => setShowExportImport(false)} />
                            </div>
                        )}
                    </div>

                    {/* Chiqish */}
                    <button
                        onClick={handleLogout}
                        className="w-full p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 hover:bg-red-100 ios-transition"
                    >
                        <LogOut size={20} className="text-red-500" />
                        <div className="flex-1 text-left">
                            <p className="font-bold text-red-600">Hisobdan chiqish</p>
                            <p className="text-xs text-red-400">Barcha ma'lumotlar saqlanadi</p>
                        </div>
                    </button>
                </div>
            </Card>
        </div>
    );
};

