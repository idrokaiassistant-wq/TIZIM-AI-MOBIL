// QR kod ma'lumotlarini tahlil qilish va ishlash

export interface QRResult {
    type: 'url' | 'phone' | 'email' | 'text' | 'wifi' | 'transaction' | 'unknown';
    data: string;
    parsed?: {
        url?: string;
        phone?: string;
        email?: string;
        ssid?: string;
        password?: string;
        amount?: number;
        description?: string;
    };
}

export const parseQRCode = (data: string): QRResult => {
    const trimmed = data.trim();

    // URL aniqlash
    if (trimmed.match(/^https?:\/\//i) || trimmed.match(/^www\./i)) {
        const url = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
        return {
            type: 'url',
            data: trimmed,
            parsed: { url }
        };
    }

    // Telefon raqami aniqlash
    const phoneMatch = trimmed.match(/^(tel:|phone:)?(\+?[0-9\s\-\(\)]{10,})$/i);
    if (phoneMatch) {
        const phone = phoneMatch[2].replace(/\s/g, '');
        return {
            type: 'phone',
            data: trimmed,
            parsed: { phone }
        };
    }

    // Email aniqlash
    const emailMatch = trimmed.match(/^(mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/i);
    if (emailMatch) {
        const email = emailMatch[2];
        return {
            type: 'email',
            data: trimmed,
            parsed: { email }
        };
    }

    // Wi-Fi ma'lumotlari (WIFI:T:WPA;S:NetworkName;P:Password;;)
    const wifiMatch = trimmed.match(/^WIFI:T:(\w+);S:([^;]+);P:([^;]+);;$/i);
    if (wifiMatch) {
        return {
            type: 'wifi',
            data: trimmed,
            parsed: {
                ssid: wifiMatch[2],
                password: wifiMatch[3]
            }
        };
    }

    // Tranzaksiya ma'lumotlari (to'lov QR kodlari)
    // Format: "tizim://transaction?amount=100000&description=..."
    const transactionMatch = trimmed.match(/^tizim:\/\/transaction\?([^&]+&?)+$/i);
    if (transactionMatch) {
        const params = new URLSearchParams(trimmed.split('?')[1]);
        const amount = params.get('amount');
        const description = params.get('description') || '';
        
        return {
            type: 'transaction',
            data: trimmed,
            parsed: {
                amount: amount ? parseFloat(amount) : undefined,
                description
            }
        };
    }

    // Oddiy matn
    return {
        type: 'text',
        data: trimmed
    };
};

export const handleQRResultAction = async (result: QRResult): Promise<void> => {
    switch (result.type) {
        case 'url':
            if (result.parsed?.url) {
                window.open(result.parsed.url, '_blank');
            }
            break;
        
        case 'phone':
            if (result.parsed?.phone) {
                window.location.href = `tel:${result.parsed.phone}`;
            }
            break;
        
        case 'email':
            if (result.parsed?.email) {
                window.location.href = `mailto:${result.parsed.email}`;
            }
            break;
        
        case 'wifi':
            // Wi-Fi ma'lumotlarini ko'rsatish
            const wifiInfo = `SSID: ${result.parsed?.ssid}\nParol: ${result.parsed?.password}`;
            if (confirm(`Wi-Fi ma'lumotlari:\n\n${wifiInfo}\n\nParolni ko'rsatishni xohlaysizmi?`)) {
                alert(wifiInfo);
            }
            break;
        
        case 'transaction':
            // Tranzaksiya ma'lumotlarini ko'rsatish
            const amount = result.parsed?.amount;
            const description = result.parsed?.description;
            if (amount) {
                alert(`Tranzaksiya ma'lumotlari:\n\nSumma: ${amount.toLocaleString()} UZS\nTavsif: ${description || 'Tavsif yo\'q'}`);
            }
            break;
        
        default:
            // Oddiy matn
            alert(`Skanerlangan ma'lumot:\n\n${result.data}`);
    }
};

