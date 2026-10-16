// src/models/analytics.model.ts

export interface KpiSummary {
    totalRevenue: number;
    revenueTrend: number;

    totalSales: number;
    salesTrend: number;

    totalViews: number;
    viewsTrend: number;

    totalLikes: number;
    likesTrend: number;

    conversionRate: number;
    conversionTrend: number;

    engagementRate: number;
    engagementTrend: number;

    publishedContents: number;
    premiumContents: number;
    draftContents: number;
    pendingReviewContents: number;
}

export interface RevenuePoint {
    date: string;
    revenue: number;
    sales: number;
}

export interface ContentAnalyticsPoint {
    date: string;
    views: number;
    purchases: number;
    revenue: number;
}

export interface CategoryPerformance {
    categoryName: string;
    mediaType: string;
    contentCount: number;
    views: number;
    likes: number;
    purchases: number;
    revenue: number;
    engagementRate: number;
}

/**
 * Contenu individuel utilisé dans les classements et
 * les recommandations du dashboard.
 */
export interface TopContent {
    contentId: string;
    title: string;
    coverUrl: string | null;
    categoryName: string;
    mediaType: string;
    views: number;
    likes: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
}

/**
 * Contenu nécessitant potentiellement une intervention éditoriale.
 */
export interface ContentAttention {
    contentId: string;
    title: string;
    reason:
        | 'low_conversion'
        | 'low_engagement'
        | 'high_views_low_sales'
        | 'inactive'
        | 'needs_update';

    priority: 'high' | 'medium' | 'low';

    views: number;
    likes: number;
    purchases: number;
    conversionRate: number;
    engagementRate: number;

    recommendation: string;
}

/**
 * Action concrète que l'éditeur devrait traiter.
 */
export interface EditorialTask {
    id: string;
    type:
        | 'draft'
        | 'correction'
        | 'missing_cover'
        | 'missing_category'
        | 'low_performance';

    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';

    contentId?: string;

    actionLabel: string;
}

/**
 * Analyse interprétée des données.
 *
 * Contrairement à un simple KPI, un insight explique
 * ce que les chiffres veulent dire pour l'éditeur.
 */
export interface EditorialInsight {
    id: string;
    type:
        | 'positive'
        | 'warning'
        | 'opportunity'
        | 'recommendation';

    title: string;
    description: string;

    metric?: string;
    metricValue?: string;

    contentId?: string;
    actionLabel?: string;
}

export interface ActivityEvent {
    id: string;

    type:
        | 'content_created'
        | 'content_published'
        | 'content_correction_requested'
        | 'like_received'
        | 'sale'
        | 'access_point_scanned'
        | 'payout_paid';

    label: string;
    timestamp: string;
}