import React, { useState } from 'react';
import { Card, Button, Badge } from './UI';
import { useQRHistory, type QRHistoryItem } from '../../lib/store/qrHistory';
import { X, Star, StarOff, Search, Trash2, Copy, ExternalLink, Phone, Mail, Wifi, FileText } from 'lucide-react';
import { useToast } from './ErrorToast';
import { handleQRResultAction } from '../../utils/qrHandler';

interface QRHistoryProps {
    onClose: () => void;
    onSelect?: (data: string) => void;
}

export const QRHistory: React.FC<QRHistoryProps> = ({ onClose, onSelect }) => {
    const { history, favorites, removeFromHistory, toggleFavorite, clearHistory, searchHistory } = useQRHistory();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFavorites, setShowFavorites] = useState(false);
    const { showToast } = useToast();

    const filteredHistory = searchQuery
        ? searchHistory(searchQuery)
        : showFavorites
        ? history.filter(h => favorites.includes(h.id))
        : history;

    const handleCopy = async (data: string) => {
        try {
            await navigator.clipboard.writeText(data);
            showToast('Nusxalandi', 'success');
        } catch {
            showToast('Nusxalashda xatolik', 'error');
        }
    };

    const handleAction = async (item: QRHistoryItem) => {
        if (onSelect) {
            onSelect(item.data);
        } else {
            const result = { type: item.type, data: item.data, parsed: item.parsed };
            await handleQRResultAction(result as any);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'url': return <ExternalLink size={16} />;
            case 'phone': return <Phone size={16} />;
            case 'email': return <Mail size={16} />;
            case 'wifi': return <Wifi size={16} />;
            default: return <FileText size={16} />;
        }
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Hozir';
        if (minutes < 60) return `${minutes} daqiqa oldin`;
        if (hours < 24) return `${hours} soat oldin`;
        if (days < 7) return `${days} kun oldin`;
        return date.toLocaleDateString('uz-UZ');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col">
            <div className="bg-white/10 backdrop-blur-md p-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-white">Skanerlangan QR Kodlar</h2>
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 ios-transition"
                >
                    <X size={24} className="text-white" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Search and Filter */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Qidirish..."
                            className="w-full pl-12 pr-4 py-3 rounded-ios-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-accent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={showFavorites ? 'gradient' : 'secondary'}
                            onClick={() => setShowFavorites(!showFavorites)}
                            className="flex-1 bg-white/10 text-white border-white/20"
                        >
                            {showFavorites ? 'Barchasi' : 'Sevimlilar'}
                        </Button>
                        {history.length > 0 && (
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (confirm('Barcha tarixni o\'chirishni xohlaysizmi?')) {
                                        clearHistory();
                                        showToast('Tarix tozalandi', 'success');
                                    }
                                }}
                                className="bg-red-500/20 text-red-300 border-red-500/30"
                            >
                                <Trash2 size={16} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* History List */}
                {filteredHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-white/70 text-sm font-bold mb-2">
                            {searchQuery ? 'Hech narsa topilmadi' : 'Hozircha tarix yo\'q'}
                        </p>
                        <span className="text-white/50 text-xs">
                            {searchQuery ? 'Boshqa so\'z bilan qidiring' : 'QR kod skanerlang'}
                        </span>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredHistory.map((item) => (
                            <Card
                                key={item.id}
                                className="bg-white/10 backdrop-blur-md border-white/20 p-4 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="gray" className="bg-white/20 text-white border-white/30 text-[10px]">
                                                    {item.type}
                                                </Badge>
                                                <span className="text-white/50 text-[10px]">
                                                    {formatDate(item.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-white font-bold text-sm break-all">
                                                {item.data.length > 50 ? `${item.data.substring(0, 50)}...` : item.data}
                                            </p>
                                            {item.parsed?.url && (
                                                <p className="text-white/70 text-xs mt-1">{item.parsed.url}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleFavorite(item.id)}
                                        className="text-white/50 hover:text-yellow-400 ios-transition"
                                    >
                                        {favorites.includes(item.id) ? (
                                            <Star size={20} className="fill-yellow-400 text-yellow-400" />
                                        ) : (
                                            <StarOff size={20} />
                                        )}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleAction(item)}
                                        className="flex-1 bg-white/10 text-white border-white/20"
                                    >
                                        Ochish
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<Copy size={14} />}
                                        onClick={() => handleCopy(item.data)}
                                        className="bg-white/10 text-white border-white/20"
                                    />
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={<Trash2 size={14} />}
                                        onClick={() => {
                                            if (confirm('Bu yozuvni o\'chirishni xohlaysizmi?')) {
                                                removeFromHistory(item.id);
                                                showToast('O\'chirildi', 'success');
                                            }
                                        }}
                                        className="bg-red-500/20 text-red-300 border-red-500/30"
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

