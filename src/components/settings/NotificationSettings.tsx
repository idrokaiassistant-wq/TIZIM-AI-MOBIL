import React, { useState } from 'react';
import { Card, Button } from '../shared/UI';
import { Bell, Mail, Smartphone, Save, CheckCircle } from 'lucide-react';
import { useToast } from '../shared/ErrorToast';
import { useNotificationsStore } from '../../lib/store';

export const NotificationSettings: React.FC = () => {
    const { showToast } = useToast();
    const { permissionGranted, requestPermission } = useNotificationsStore();
    
    const [pushEnabled, setPushEnabled] = useState(permissionGranted);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [taskReminders, setTaskReminders] = useState(true);
    const [habitReminders, setHabitReminders] = useState(true);
    const [dailySummary, setDailySummary] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleRequestPushPermission = async () => {
        try {
            const granted = await requestPermission();
            if (granted) {
                setPushEnabled(true);
                showToast('Push bildirishnomalar yoqildi', 'success');
            } else {
                showToast('Push bildirishnomalar ruxsati rad etildi', 'warning');
            }
        } catch (error) {
            showToast('Push bildirishnomalar sozlanmadi', 'error');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // TODO: Save settings to backend
            await new Promise(resolve => setTimeout(resolve, 500));
            showToast('Sozlamalar saqlandi', 'success');
        } catch (error) {
            showToast('Sozlamalarni saqlashda xatolik', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-5 space-y-6 animate-ios-slide-up flex flex-col h-full bg-ios-bg">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bildirishnomalar</h1>
                <p className="text-slate-500 text-xs font-medium mt-0.5">
                    Bildirishnoma turlarini boshqaring
                </p>
            </div>

            {/* Push Notifications */}
            <Card className="p-5">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Smartphone size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Push bildirishnomalar</h3>
                                <p className="text-xs text-slate-500">
                                    Mobil qurilma va brauzer bildirishnomalari
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {pushEnabled ? (
                                <div className="flex items-center gap-2 text-emerald-600">
                                    <CheckCircle size={18} />
                                    <span className="text-xs font-bold">Yoqilgan</span>
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={handleRequestPushPermission}
                                    variant="outline"
                                >
                                    Ruxsat berish
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Email Notifications */}
            <Card className="p-5">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                                <Mail size={20} className="text-orange-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Email bildirishnomalar</h3>
                                <p className="text-xs text-slate-500">
                                    Email orqali bildirishnomalar olish
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={emailEnabled}
                                onChange={(e) => setEmailEnabled(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Notification Types */}
            <Card className="p-5">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell size={20} className="text-slate-600" />
                        <h3 className="text-base font-bold text-slate-900">Bildirishnoma turlari</h3>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Vazifa eslatmalari</p>
                                <p className="text-xs text-slate-500">Muddati yaqinlashayotgan vazifalar haqida eslatma</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={taskReminders}
                                onChange={(e) => setTaskReminders(e.target.checked)}
                                className="w-5 h-5 text-accent rounded focus:ring-accent"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Odat eslatmalari</p>
                                <p className="text-xs text-slate-500">Kunlik odatlar haqida eslatma</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={habitReminders}
                                onChange={(e) => setHabitReminders(e.target.checked)}
                                className="w-5 h-5 text-accent rounded focus:ring-accent"
                            />
                        </label>

                        <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                            <div>
                                <p className="text-sm font-bold text-slate-900">Kunlik xulosa</p>
                                <p className="text-xs text-slate-500">Har kuni ertalab kunlik xulosa email</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={dailySummary}
                                onChange={(e) => setDailySummary(e.target.checked)}
                                className="w-5 h-5 text-accent rounded focus:ring-accent"
                            />
                        </label>
                    </div>
                </div>
            </Card>

            {/* Save Button */}
            <div className="pt-4">
                <Button
                    onClick={handleSave}
                    loading={saving}
                    className="w-full flex items-center justify-center gap-2"
                >
                    <Save size={18} />
                    Saqlash
                </Button>
            </div>
        </div>
    );
};

