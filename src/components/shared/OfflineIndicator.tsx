import { useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineStore } from '../../lib/store/offline-store';

export const OfflineIndicator: React.FC = () => {
    const { isOnline, setIsOnline, syncQueue } = useOfflineStore();

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [setIsOnline]);

    if (isOnline) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-red-500 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold">
            <WifiOff size={16} />
            <span>Offline rejim - {syncQueue.length} ta o'zgarish kutilmoqda</span>
        </div>
    );
};


