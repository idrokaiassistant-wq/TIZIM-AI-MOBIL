import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Check, Edit2 } from 'lucide-react';
import { Camera as CapacitorCamera, CameraSource, CameraResultType } from '@capacitor/camera';
import { Button, Card } from '../shared';
import { transactionsApi } from '../../lib/api/transactions';
import { useToast } from '../shared/ErrorToast';
import type { Transaction } from '../../lib/api/types';

interface ReceiptScannerProps {
    onSuccess: (transaction: Transaction) => void;
    onCancel: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({ onSuccess, onCancel }) => {
    const [image, setImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [scanning, setScanning] = useState(false);
    const [scannedData, setScannedData] = useState<Transaction | null>(null);
    const [editing, setEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const takePhoto = async () => {
        try {
            const photo = await CapacitorCamera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.DataUrl,
                source: CameraSource.Camera,
            });

            if (photo.dataUrl) {
                setImage(photo.dataUrl);
                // Convert data URL to File
                const response = await fetch(photo.dataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
                setImageFile(file);
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

        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const scanReceipt = async () => {
        if (!imageFile) {
            showToast('Iltimos, avval rasm yuklang', 'warning');
            return;
        }

        setScanning(true);
        try {
            const transaction = await transactionsApi.scanReceipt(imageFile);
            setScannedData(transaction);
            showToast('Chek muvaffaqiyatli skaner qilindi', 'success');
        } catch (error: any) {
            console.error('Scan error:', error);
            showToast(error.detail || 'Chekni skaner qilishda xatolik yuz berdi', 'error');
        } finally {
            setScanning(false);
        }
    };

    const handleSave = () => {
        if (scannedData) {
            onSuccess(scannedData);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancelEdit = () => {
        setEditing(false);
    };

    if (scannedData && !editing) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
                <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-black text-white">Skaner Natijasi</h2>
                        <button
                            onClick={onCancel}
                            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 ios-transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {image && (
                        <div className="rounded-2xl overflow-hidden border border-white/20">
                            <img src={image} alt="Receipt" className="w-full h-auto" />
                        </div>
                    )}

                    <div className="space-y-3 bg-white/5 p-4 rounded-2xl">
                        <div>
                            <label className="text-xs font-black text-white/70 uppercase tracking-widest">Nomi</label>
                            <p className="text-white font-bold text-lg mt-1">{scannedData.title}</p>
                        </div>
                        <div>
                            <label className="text-xs font-black text-white/70 uppercase tracking-widest">Summa</label>
                            <p className="text-white font-black text-2xl mt-1">{scannedData.amount.toLocaleString()} UZS</p>
                        </div>
                        <div>
                            <label className="text-xs font-black text-white/70 uppercase tracking-widest">Kategoriya</label>
                            <p className="text-white font-bold mt-1">{scannedData.category}</p>
                        </div>
                        {scannedData.description && (
                            <div>
                                <label className="text-xs font-black text-white/70 uppercase tracking-widest">Tavsif</label>
                                <p className="text-white/80 text-sm mt-1">{scannedData.description}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            icon={<Edit2 size={18} />}
                            onClick={handleEdit}
                            className="flex-1 bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
                        >
                            Tahrirlash
                        </Button>
                        <Button
                            variant="gradient"
                            icon={<Check size={18} />}
                            onClick={handleSave}
                            className="flex-1"
                        >
                            Saqlash
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 max-w-md w-full p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-white">Chek Skanerlash</h2>
                    <button
                        onClick={onCancel}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 ios-transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {image ? (
                    <div className="space-y-4">
                        <div className="rounded-2xl overflow-hidden border border-white/20">
                            <img src={image} alt="Receipt preview" className="w-full h-auto" />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                icon={<ImageIcon size={18} />}
                                onClick={pickFromGallery}
                                className="flex-1 bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
                            >
                                O'zgartirish
                            </Button>
                            <Button
                                variant="gradient"
                                icon={scanning ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                onClick={scanReceipt}
                                disabled={scanning}
                                className="flex-1"
                            >
                                {scanning ? 'Skanerlanmoqda...' : 'Skanerlash'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-white/70 text-sm text-center">
                            Chek rasmini kameradan yoki galereyadan yuklang
                        </p>
                        <div className="space-y-3">
                            <Button
                                variant="gradient"
                                icon={<Camera size={20} />}
                                onClick={takePhoto}
                                className="w-full py-4 text-base"
                            >
                                Kameradan olish
                            </Button>
                            <Button
                                variant="secondary"
                                icon={<ImageIcon size={20} />}
                                onClick={pickFromGallery}
                                className="w-full py-4 text-base bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
                            >
                                Galereyadan tanlash
                            </Button>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </Card>
        </div>
    );
};


