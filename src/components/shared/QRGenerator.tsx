import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button, Card } from './UI';
import { Download, Copy, Check } from 'lucide-react';
import { useToast } from './ErrorToast';

interface QRGeneratorProps {
    onClose: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({ onClose }) => {
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    const { showToast } = useToast();

    const handleDownload = () => {
        const svg = document.getElementById('qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `qr-code-${Date.now()}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('QR kod yuklab olindi', 'success');
                }
            });
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handleCopy = async () => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            showToast('Matn nusxalandi', 'success');
            setTimeout(() => setCopied(false), 2000);
        } catch {
            showToast('Nusxalashda xatolik', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6">
            <Card className="w-full max-w-md p-6 space-y-6 bg-white">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900">QR Kod Yaratish</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 ios-transition"
                    >
                        <span className="text-slate-600 text-xl">×</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Matn yoki URL kiriting
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Masalan: https://example.com yoki matn..."
                            className="w-full px-4 py-3 rounded-ios-2xl border-2 border-slate-200 bg-white focus:border-accent focus:outline-none transition-colors resize-none"
                            rows={4}
                        />
                    </div>

                    {text && (
                        <div className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-ios-2xl">
                            <div className="bg-white p-4 rounded-ios-2xl">
                                <QRCodeSVG
                                    id="qr-code-svg"
                                    value={text}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>
                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="secondary"
                                    icon={copied ? <Check size={18} /> : <Copy size={18} />}
                                    onClick={handleCopy}
                                    className="flex-1"
                                >
                                    {copied ? 'Nusxalandi' : 'Nusxalash'}
                                </Button>
                                <Button
                                    variant="gradient"
                                    icon={<Download size={18} />}
                                    onClick={handleDownload}
                                    className="flex-1"
                                >
                                    Yuklab olish
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};


