import { Content } from './content.model.js';

export interface Trigger {
    id: string; // ULID
    content_id: string;
    type: 'qrcode' | 'shortcode' | 'audio_watermark';
    code: string;
    qr_image_url?: string;
    audio_watermark_url?: string;
    scans_count: number;
    conversions_count: number;
    created_at: string;
    updated_at: string;
    content?: Content;
}

export interface TriggerStats {
    total_scans: number;
    total_conversions: number;
    conversion_rate: number;
}

export interface TriggerWithStats extends Trigger {
    stats: TriggerStats;
}