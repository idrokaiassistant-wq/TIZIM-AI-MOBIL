import React, { useState, useRef } from 'react';
import { Camera, X, Save, User, Mail } from 'lucide-react';
import { Camera as CapacitorCamera, CameraSource, CameraResultType } from '@capacitor/camera';
import { Card, Button, LoadingSpinner } from '../shared';
import { useAuthStore } from '../../lib/store';
import { authApi } from '../../lib/api/auth';
import { useToast } from '../shared/ErrorToast';

interface ProfileSettingsProps {
    onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onClose }) => {
    const { user, setUser } = useAuthStore();
    const { showToast } = useToast();
    const [fullName, setFullName] = useState(user?.full_name || '');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const takePhoto = async () => {
        try {
            const photo = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: true,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
            });

            if (photo.dataUrl) {
                setAvatar(photo.dataUrl);
            }
        } catch (error) {
            console.error('Camera error:', error);
            showToast('Kameradan rasm olishda xatolik yuz berdi', 'error');
        }
    };

    const pickFromGallery = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast('Faqat rasm fayllari qabul qilinadi', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setAvatar(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            showToast('Ism bo\'sh bo\'lmasligi kerak', 'warning');
            return;
        }

        setSaving(true);
        try {
            const updatedUser = await authApi.updateProfile({
                full_name: fullName.trim(),
            });

            setUser(updatedUser);
            showToast('Profil muvaffaqiyatli yangilandi', 'success');
            onClose();
        } catch (error: any) {
            console.error('Update profile error:', error);
            showToast(error.detail || 'Profilni yangilashda xatolik yuz berdi', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="bg-white max-w-md w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900">Profil Sozlamalari</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 ios-transition"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black border-4 border-white shadow-lg">
                            {avatar ? (
                                <img src={avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span>{(fullName || user?.email || 'U').charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 flex gap-2">
                            <button
                                onClick={takePhoto}
                                className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:bg-accent-dark ios-transition"
                                title="Kameradan olish"
                            >
                                <Camera size={18} />
                            </button>
                            <button
                                onClick={pickFromGallery}
                                className="w-10 h-10 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 ios-transition"
                                title="Galereyadan tanlash"
                            >
                                <User size={18} />
                            </button>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block flex items-center gap-2">
                            <User size={14} />
                            Ism Familiya
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ism Familiya"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 text-slate-900 font-medium"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 block flex items-center gap-2">
                            <Mail size={14} />
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">Email o'zgartirib bo'lmaydi</p>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Bekor qilish
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Save size={18} />}
                        onClick={handleSave}
                        loading={saving}
                        className="flex-1"
                    >
                        Saqlash
                    </Button>
                </div>
            </Card>
        </div>
    );
};


