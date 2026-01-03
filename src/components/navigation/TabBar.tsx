import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Maximize, Calendar, DollarSign, X, History, QrCode, TrendingUp } from 'lucide-react';
import { QRScanner } from '../shared/QRScanner';
import { QRGenerator } from '../shared/QRGenerator';
import { QRHistory } from '../shared/QRHistory';
import { parseQRCode, handleQRResultAction } from '../../utils/qrHandler';
import { useFinanceStore } from '../../lib/store';
import { useQRHistory } from '../../lib/store/qrHistory';
import { useToast } from '../shared/ErrorToast';

export const TabBar: React.FC = () => {
    const [showScanner, setShowScanner] = useState(false);
    const [showGenerator, setShowGenerator] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { addTransaction } = useFinanceStore();
    const { addToHistory } = useQRHistory();
    const { showToast } = useToast();

    // Click outside to close menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleQRResult = async (data: string) => {
        // Tarixga qo'shish
        addToHistory(data);

        const result = parseQRCode(data);

        // Tranzaksiya bo'lsa, avtomatik qo'shish
        if (result.type === 'transaction' && result.parsed?.amount) {
            try {
                await addTransaction({
                    title: result.parsed.description || 'QR kod orqali to\'lov',
                    amount: -result.parsed.amount, // Chiqim sifatida
                    type: 'expense',
                    cat: 'Boshqa',
                    date: new Date().toISOString().split('T')[0],
                    icon: 'CreditCard',
                    color: 'bg-slate-100 text-slate-600'
                });
                showToast(`Tranzaksiya muvaffaqiyatli qo'shildi: ${result.parsed.amount.toLocaleString()} UZS`, 'success');
            } catch (error) {
                showToast('Tranzaksiyani qo\'shishda xatolik yuz berdi', 'error');
            }
        } else {
            // Boshqa ma'lumotlar uchun standart ishlov berish
            await handleQRResultAction(result);
        }

        setShowScanner(false);
    };

    return (
        <>
            <div className={`fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none transition-transform duration-500 ${showScanner || showGenerator || showHistory ? 'translate-y-32' : ''}`}>
                <div className="max-w-md mx-auto relative pointer-events-auto">
                    <div className="glass shadow-ios-lg rounded-[2.5rem] h-[72px] flex items-center justify-around px-2 relative overflow-visible">
                        <TabItem to="/dashboard" icon={<Home size={24} />} label="Uy" />
                        <TabItem to="/tasks" icon={<CheckSquare size={24} />} label="Vazifa" />

                        {/* Central FAB Placeholder */}
                        <div className="w-14 h-14" />

                        <TabItem to="/habits" icon={<Calendar size={24} />} label="Odat" />
                        <TabItem to="/productivity" icon={<TrendingUp size={24} />} label="Produktivlik" />
                        <TabItem to="/finance" icon={<DollarSign size={24} />} label="Moliya" />
                    </div>

                    {/* Central FAB - Scanner with Menu */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" ref={menuRef}>
                        {/* Main Scanner Button */}
                        <button
                            onClick={() => {
                                if (showMenu) {
                                    setShowMenu(false);
                                    setShowScanner(true);
                                } else {
                                    setShowMenu(true);
                                }
                            }}
                            className="w-16 h-16 rounded-full flex items-center justify-center shadow-ios-lg ios-transition bg-accent text-white hover:scale-110 active:scale-90 ring-4 ring-white/10 backdrop-blur-sm z-10"
                            title="QR kod skanerlash"
                        >
                            <Maximize size={28} />
                        </button>

                        {/* Menu Options */}
                        {showMenu && (
                            <div className="absolute bottom-full mb-2 flex flex-col gap-2 animate-ios-slide-up">
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowHistory(true);
                                    }}
                                    className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-ios-lg text-slate-700 hover:scale-110 active:scale-90 ios-transition"
                                    title="Tarix"
                                >
                                    <History size={20} />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMenu(false);
                                        setShowGenerator(true);
                                    }}
                                    className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-ios-lg text-slate-700 hover:scale-110 active:scale-90 ios-transition"
                                    title="QR kod yaratish"
                                >
                                    <QrCode size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showScanner && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm">
                    <button
                        onClick={() => setShowScanner(false)}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 ios-transition z-10"
                        aria-label="Yopish"
                    >
                        <X size={24} />
                    </button>
                    <QRScanner
                        onResult={handleQRResult}
                        onCancel={() => setShowScanner(false)}
                    />
                </div>
            )}

            {showGenerator && (
                <QRGenerator onClose={() => setShowGenerator(false)} />
            )}

            {showHistory && (
                <QRHistory
                    onClose={() => setShowHistory(false)}
                    onSelect={(data) => {
                        handleQRResult(data);
                        setShowHistory(false);
                    }}
                />
            )}
        </>
    );
};

const TabItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex flex-col items-center justify-center gap-1 w-14 ios-transition
      ${isActive ? 'text-accent scale-110' : 'text-gray-400 opacity-70'}
    `}
    >
        <div className="relative">
            {icon}
        </div>
        <span className="text-[10px] font-bold">{label}</span>
    </NavLink>
);
