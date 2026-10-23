import { ContentWithStats } from './content.model.js';

export interface Analytics {
    date: string;
    views: number;
    purchases: number;
    revenue: number;
    conversion_rate: number;
}

export interface DashboardStats {
    total_contents: number;
    total_published: number;
    total_archived: number;
    total_blocked: number;
    total_purchases: number;
    total_revenue: number;
    total_commission: number;
    net_revenue: number;
    conversion_rate: number;
    last_30_days: Analytics[];
    top_contents: ContentWithStats[];
}