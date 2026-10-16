// src/data/mock/dashboard.mock.ts
import { MOCK_CONTENTS } from './contents.mock';
import { DashboardKPI, CategoryPerformance, TopContent, ActivityEvent } from '@/stores/content.store';

// Calcul des statistiques à partir des contenus réels
const publishedContents = MOCK_CONTENTS.filter(c => c.status === 'published');
const premiumContents = MOCK_CONTENTS.filter(c => c.isPremium);
const draftContents = MOCK_CONTENTS.filter(c => c.status === 'draft');
const pendingReviewContents = MOCK_CONTENTS.filter(c => c.status === 'pending_review');
const rejectedContents = MOCK_CONTENTS.filter(c => c.status === 'rejected');
const archivedContents = MOCK_CONTENTS.filter(c => c.status === 'archived');

// Calcul des KPIs réels
const totalRevenue = publishedContents.reduce((sum, c) => sum + (c.stats?.revenue || 0), 0);
const totalSales = publishedContents.reduce((sum, c) => sum + (c.stats?.purchases || 0), 0);
const totalViews = publishedContents.reduce((sum, c) => sum + (c.stats?.views || 0), 0);
const totalLikes = publishedContents.reduce((sum, c) => sum + (c.stats?.likes || 0), 0);



// Calcul du taux de conversion moyen
const avgConversion = publishedContents.length > 0
    ? publishedContents.reduce((sum, c) => sum + (c.stats?.conversionRate || 0), 0) / publishedContents.length
    : 0;

// KPIs du dashboard
export const MOCK_DASHBOARD_KPI: DashboardKPI = {
    totalRevenue: totalRevenue || 1955200, // Fallback si pas de données
    revenueTrend: 12.5,
    totalSales: totalSales || 1847,
    salesTrend: 8.3,
    totalViews: totalViews || 26570,
    viewsTrend: 15.2,
    totalLikes: totalLikes || 2245,
    likesTrend: 18.5,
    conversionRate: Math.round(avgConversion * 100) / 100 || 6.8,
    conversionTrend: 2.1,
    engagementRate: 12.4,
    engagementTrend: 3.7,
    publishedContents: publishedContents.length,
    premiumContents: premiumContents.length,
    draftContents: draftContents.length,
    pendingReviewContents: pendingReviewContents.length,
};

// Série de revenus (30 derniers jours) - générée à partir des données
export const MOCK_REVENUE_SERIES = [
    { date: '2026-07-20', revenue: 8200 },
    { date: '2026-07-21', revenue: 9500 },
    { date: '2026-07-22', revenue: 7400 },
    { date: '2026-07-23', revenue: 11200 },
    { date: '2026-07-24', revenue: 9800 },
    { date: '2026-07-25', revenue: 13100 },
    { date: '2026-07-26', revenue: 8700 },
    { date: '2026-07-27', revenue: 15400 },
    { date: '2026-07-28', revenue: 10200 },
    { date: '2026-07-29', revenue: 18600 },
    { date: '2026-07-30', revenue: 9400 },
    { date: '2026-07-31', revenue: 21500 },
    { date: '2026-08-01', revenue: 12800 },
    { date: '2026-08-02', revenue: 16700 },
    { date: '2026-08-03', revenue: 14200 },
    { date: '2026-08-04', revenue: 18900 },
    { date: '2026-08-05', revenue: 23100 },
    { date: '2026-08-06', revenue: 15600 },
    { date: '2026-08-07', revenue: 19800 },
    { date: '2026-08-08', revenue: 22400 },
    { date: '2026-08-09', revenue: 17600 },
    { date: '2026-08-10', revenue: 25900 },
    { date: '2026-08-11', revenue: 20300 },
    { date: '2026-08-12', revenue: 28700 },
    { date: '2026-08-13', revenue: 24100 },
    { date: '2026-08-14', revenue: 31200 },
    { date: '2026-08-15', revenue: 26800 },
    { date: '2026-08-16', revenue: 33500 },
    { date: '2026-08-17', revenue: 29400 },
    { date: '2026-08-18', revenue: 42300 },
];

// Performances par catégorie - calculées à partir des contenus
export const MOCK_CATEGORY_PERFORMANCE: CategoryPerformance[] = (() => {
    const categories = ['Actualités', 'Enquêtes', 'Culture', 'Sport', 'Podcasts', 'Documentaires'];
    const mediaTypes: Record<string, string> = {
        'Actualités': 'pdf',
        'Enquêtes': 'pdf',
        'Culture': 'epub',
        'Sport': 'pdf',
        'Podcasts': 'audio',
        'Documentaires': 'video',
    };

    return categories.map((cat, index) => {
        const contentsInCat = MOCK_CONTENTS.filter(c => c.category?.name === cat && c.status === 'published');
        const likes = Math.floor(Math.random() * 300) + 100;
        const views = contentsInCat.reduce((sum, c) => sum + (c.stats?.views || 0), 0) || Math.floor(Math.random() * 3000) + 500;
        const purchases = contentsInCat.reduce((sum, c) => sum + (c.stats?.purchases || 0), 0) || Math.floor(Math.random() * 150) + 20;
        const revenue = contentsInCat.reduce((sum, c) => sum + (c.stats?.revenue || 0), 0) || Math.floor(Math.random() * 2000) + 100;

        return {
            categoryName: cat,
            likes: likes,
            views: views,
            purchases: purchases,
            revenue: revenue,
            engagementRate: views > 0 ? Math.round((likes / views) * 100 * 100) / 100 : 0,
            mediaType: mediaTypes[cat] || 'pdf',
            contentCount: contentsInCat.length || Math.floor(Math.random() * 5) + 1,
        };
    });
})();

// Top contenus - directement depuis MOCK_CONTENTS
export const MOCK_TOP_CONTENTS: TopContent[] = MOCK_CONTENTS
    .filter(c => c.status === 'published')
    .sort((a, b) => (b.stats?.views || 0) - (a.stats?.views || 0))
    .slice(0, 5)
    .map(c => ({
        contentId: c.id,
        title: c.title,
        views: c.stats?.views || 0,
        likes: c.stats?.likes || Math.floor(Math.random() * 300) + 50,
        purchases: c.stats?.purchases || 0,
        conversionRate: c.stats?.conversionRate || 0,
        revenue: c.stats?.revenue || 0,
        categoryName: c.category?.name || 'Non catégorisé',
        mediaType: c.mediaType,
    }));

// Activité récente
export const MOCK_ACTIVITY: ActivityEvent[] = [
    {
        id: 'act_1',
        type: 'content_published',
        label: `Nouveau contenu publié : "${MOCK_CONTENTS[0]?.title || 'Contenu'}"`,
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
        id: 'act_2',
        type: 'sale',
        label: `Vente réalisée : "${MOCK_CONTENTS[1]?.title || 'Contenu'}" - 500 XAF`,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
        id: 'act_3',
        type: 'like_received',
        label: `Nouveau like sur : "${MOCK_CONTENTS[0]?.title || 'Contenu'}"`,
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
        id: 'act_4',
        type: 'content_created',
        label: `Nouveau brouillon : "${MOCK_CONTENTS[3]?.title || 'Contenu'}"`,
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
    {
        id: 'act_5',
        type: 'content_rejected',
        label: `Contenu refusé : "${MOCK_CONTENTS[4]?.title || 'Contenu'}" - motif : qualité insuffisante`,
        timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    },
    {
        id: 'act_6',
        type: 'trigger_scanned',
        label: 'QR Code scanné : 24 nouvelles interactions',
        timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    },
    {
        id: 'act_7',
        type: 'payout_paid',
        label: 'Paiement de 45 000 XAF effectué',
        timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    },
];

// Export groupé
export const MOCK_DASHBOARD_DATA = {
    kpi: MOCK_DASHBOARD_KPI,
    revenueSeries: MOCK_REVENUE_SERIES,
    categoryPerformance: MOCK_CATEGORY_PERFORMANCE,
    topContents: MOCK_TOP_CONTENTS,
    activity: MOCK_ACTIVITY,
};