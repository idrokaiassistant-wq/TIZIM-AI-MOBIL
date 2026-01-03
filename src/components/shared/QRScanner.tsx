import React, { useState, useRef } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Button } from './UI';
import { X, Camera as CameraIcon, Image, Loader2 } from 'lucide-react';
import jsQR from 'jsqr';

export const QRScanner: React.FC<{ onResult: (result: string) => void; onCancel: () => void }> = ({ onResult, onCancel }) => {
    const [scanning, setScanning] = useState(false);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const startScan = async () => {
        try {
            const status = await BarcodeScanner.checkPermission({ force: true });

            if (status.granted) {
                setScanning(true);
                // Hide main app content
                document.querySelector('body')?.classList.add('scanner-active');
                await BarcodeScanner.hideBackground();

                const result = await BarcodeScanner.startScan();

                if (result.hasContent) {
                    onResult(result.content);
                }
            } else {
                alert('Kamera ruxsati berilmadi. Iltimos, sozlamalardan ruxsat bering.');
            }
        } catch (e) {
            console.error('Scan error:', e);
            stopScan();
        } finally {
            stopScan();
        }
    };

    const stopScan = () => {
        setScanning(false);
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
        document.querySelector('body')?.classList.remove('scanner-active');
    };

    const pickFromGallery = async () => {
        try {
            setProcessing(true);
            const image = await Camera.pickImages({
                quality: 100,
                limit: 1,
                source: CameraSource.Photos,
            });

            if (image.photos && image.photos.length > 0) {
                const photo = image.photos[0];
                await processImageFromUrl(photo.webPath || photo.path || '');
            }
        } catch (error) {
            console.error('Gallery pick error:', error);
            // Fallback to file input for web
            fileInputRef.current?.click();
        } finally {
            setProcessing(false);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setProcessing(true);
        try {
            const imageUrl = URL.createObjectURL(file);
            await processImageFromUrl(imageUrl);
            URL.revokeObjectURL(imageUrl);
        } catch (error) {
            console.error('File processing error:', error);
            alert('Rasmdan QR kodni o\'qib bo\'lmadi. Iltimos, boshqa rasmni tanlang.');
        } finally {
            setProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const processImageFromUrl = async (imageUrl: string) => {
        return new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    
                    if (!ctx) {
                        reject(new Error('Canvas context not available'));
                        return;
                    }
                    
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        onResult(code.data);
                        onCancel();
                    } else {
                        alert('QR kod topilmadi. Iltimos, boshqa rasmni tanlang.');
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => {
                reject(new Error('Rasm yuklanmadi'));
            };
            
            img.src = imageUrl;
        });
    };

    if (scanning) {
        return (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-10 bg-transparent">
                <div className="w-full flex justify-end">
                    <button 
                        onClick={stopScan} 
                        className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 ios-transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="w-64 h-64 border-2 border-accent rounded-3xl relative">
                    <div className="absolute inset-0 border-4 border-white/20 rounded-3xl animate-pulse"></div>
                </div>

                <div className="text-white text-center">
                    <p className="font-bold text-lg">QR Kodni kvadrat ichiga joylashtiring</p>
                    <p className="text-sm opacity-70 mt-2">Skanerlash avtomatik amalga oshadi</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 gap-6">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-black text-white mb-2">QR Kod Skanerlash</h2>
                <p className="text-white/70 text-sm">Kameradan yoki galereyadan QR kodni skanerlang</p>
            </div>
            
            <div className="w-full max-w-sm space-y-4">
                <Button
                    variant="gradient"
                    icon={<CameraIcon size={20} />}
                    onClick={startScan}
                    className="w-full py-4 text-base"
                    disabled={processing}
                >
                    Kameradan skanerlash
                </Button>

                <Button
                    variant="secondary"
                    icon={processing ? <Loader2 size={20} className="animate-spin" /> : <Image size={20} />}
                    onClick={pickFromGallery}
                    className="w-full py-4 text-base bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20"
                    disabled={processing}
                >
                    {processing ? 'Ishlanmoqda...' : 'Galereyadan tanlash'}
                </Button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                />
            </div>

            {processing && (
                <div className="fixed inset-0 z-[101] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center gap-4">
                        <Loader2 size={32} className="animate-spin text-white" />
                        <p className="text-white font-bold">QR kod o'qilmoqda...</p>
                    </div>
                </div>
            )}
        </div>
    );
};
