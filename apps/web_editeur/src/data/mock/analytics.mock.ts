// src/data/mock/analytics.mock.ts
//
// Toutes les données analytics/dashboard vivent ici, dérivées de
// MOCK_CONTENTS quand c'est pertinent (évite les chiffres incohérents entre
// la liste des contenus et le tableau de bord).
import {
    ActivityEvent,
    CategoryPerformance,
    ContentAttention,
    EditorialInsight,
    EditorialTask,
    KpiSummary,
    RevenuePoint,
    TopContent,
} from '@/models';
import { MOCK_CONTENTS } from './contents.mock';

// ---------------------------------------------------------------------------
// KPI globaux
// ---------------------------------------------------------------------------
const published = MOCK_CONTENTS.filter((c) => c.status === 'published');
const totalRevenue = published.reduce((sum, c) => sum + c.stats.revenue, 0);
const totalSales = published.reduce((sum, c) => sum + c.stats.purchases, 0);
const totalViews = published.reduce((sum, c) => sum + c.stats.views, 0);
const totalLikes = published.reduce((sum, c) => sum + (c.stats.likes ?? 0), 0);
const avgConversion = published.length > 0
    ? published.reduce((sum, c) => sum + c.stats.conversionRate, 0) / published.length
    : 0;

export const MOCK_KPI_SUMMARY: KpiSummary = {
    totalRevenue,
    revenueTrend: 12.4,
    totalSales,
    salesTrend: 8.1,
    totalViews,
    viewsTrend: 5.6,
    totalLikes,
    likesTrend: 18.5,
    conversionRate: Math.round(avgConversion * 100) / 100,
    conversionTrend: -1.2,
    engagementRate: totalViews > 0 ? Math.round((totalLikes / totalViews) * 10000) / 100 : 0,
    engagementTrend: 3.7,
    publishedContents: published.length,
    premiumContents: MOCK_CONTENTS.filter((c) => c.isPremium).length,
    draftContents: MOCK_CONTENTS.filter((c) => c.status === 'draft').length,
    pendingReviewContents: MOCK_CONTENTS.filter((c) => c.status === 'pending_review').length,
};

// ---------------------------------------------------------------------------
// Série de revenus (30 derniers jours) — générée par formule, pas copiée
// à la main (évite les séries "à la louche" qui ne veulent rien dire).
// ---------------------------------------------------------------------------
function buildRevenueSeries(days: number): RevenuePoint[] {
    const points: RevenuePoint[] = [];
    let base = 8000;
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const noise = Math.sin(i * 1.7) * 3000 + Math.cos(i * 0.5) * 1500;
        base += 600; // légère tendance haussière
        const revenue = Math.max(2000, Math.round(base + noise));
        const sales = Math.max(1, Math.round(revenue / 900));
        points.push({ date: date.toISOString().slice(0, 10), revenue, sales });
    }
    return points;
}

export const MOCK_REVENUE_SERIES: RevenuePoint[] = buildRevenueSeries(30);

// ---------------------------------------------------------------------------
// Performance par catégorie
// ---------------------------------------------------------------------------
export const MOCK_CATEGORY_PERFORMANCE: CategoryPerformance[] = (() => {
    const categoryNames = Array.from(new Set(MOCK_CONTENTS.map((c) => c.category?.name).filter(Boolean))) as string[];

    return categoryNames.map((name) => {
        const inCategory = MOCK_CONTENTS.filter((c) => c.category?.name === name && c.status === 'published');
        const views = inCategory.reduce((sum, c) => sum + c.stats.views, 0);
        const likes = inCategory.reduce((sum, c) => sum + (c.stats.likes ?? 0), 0);
        const purchases = inCategory.reduce((sum, c) => sum + c.stats.purchases, 0);
        const revenue = inCategory.reduce((sum, c) => sum + c.stats.revenue, 0);

        return {
            categoryName: name,
            mediaType: inCategory[0]?.mediaType ?? 'epub',
            contentCount: inCategory.length,
            views,
            likes,
            purchases,
            revenue,
            engagementRate: views > 0 ? Math.round((likes / views) * 10000) / 100 : 0,
        };
    }).filter((c) => c.contentCount > 0);
})();

// ---------------------------------------------------------------------------
// Contenus les plus performants
// ---------------------------------------------------------------------------
export const MOCK_TOP_CONTENTS: TopContent[] = [...MOCK_CONTENTS]
    .filter((c) => c.status === 'published')
    .sort((a, b) => b.stats.revenue - a.stats.revenue)
    .slice(0, 5)
    .map((c) => ({
        contentId: c.id,
        title: c.title,
        coverUrl: c.coverUrl,
        categoryName: c.category?.name ?? 'Non catégorisé',
        mediaType: c.mediaType,
        views: c.stats.views,
        likes: c.stats.likes ?? 0,
        purchases: c.stats.purchases,
        revenue: c.stats.revenue,
        conversionRate: c.stats.conversionRate,
    }));

// ---------------------------------------------------------------------------
// Activité récente
// ---------------------------------------------------------------------------
export const MOCK_ACTIVITY: ActivityEvent[] = [
    { id: 'act-1', type: 'sale', label: 'Achat — « Podcast : Les voix du marché central »', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
    { id: 'act-2', type: 'access_point_scanned', label: 'QR Code scanné — Affiche abribus Centre-ville', timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString() },
    { id: 'act-3', type: 'content_correction_requested', label: '« Analyse — Les enjeux du prochain sommet régional » nécessite une correction', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: 'act-4', type: 'sale', label: "Achat — « L'édition spéciale : 30 ans d'indépendance économique »", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { id: 'act-5', type: 'like_received', label: '« Interview exclusive — Le nouveau sélectionneur national » a reçu de nouveaux likes', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 'act-6', type: 'content_created', label: '« Roman-feuilleton : "C\'est difficile mais c\'est possible" » enregistré en brouillon', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
    { id: 'act-7', type: 'payout_paid', label: 'Reversement de 450 000 XAF envoyé', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'act-8', type: 'content_published', label: '« Podcast — Les voix du marché central » a été publié', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];
// ---------------------------------------------------------------------------
// CONTENUS À SURVEILLER
// ---------------------------------------------------------------------------

export const MOCK_ATTENTION_CONTENTS: ContentAttention[] = (() => {
    return published
        .map((content) => {
            const views = content.stats.views;
            const likes = content.stats.likes ?? 0;
            const purchases = content.stats.purchases;
            const conversionRate = content.stats.conversionRate;

            const engagementRate =
                views > 0
                    ? Math.round((likes / views) * 10000) / 100
                    : 0;

            let reason: ContentAttention['reason'] | null = null;
            let priority: ContentAttention['priority'] = 'low';
            let recommendation = '';

            if (views >= 500 && conversionRate < 2) {
                reason = 'high_views_low_sales';
                priority = 'high';
                recommendation =
                    'Votre contenu attire l’audience mais transforme peu de lecteurs en acheteurs. Revoyez le titre, le résumé, l’aperçu gratuit ou le positionnement tarifaire.';
            } else if (views >= 200 && engagementRate < 2) {
                reason = 'low_engagement';
                priority = 'medium';
                recommendation =
                    'Le contenu est visible mais génère peu d’interactions. Travaillez le titre, la couverture et l’accroche.';
            } else if (views >= 100 && conversionRate < 1) {
                reason = 'low_conversion';
                priority = 'medium';
                recommendation =
                    'Le contenu reçoit des visites mais génère très peu d’achats. Vérifiez son prix et sa proposition de valeur.';
            }

            if (!reason) {
                return null;
            }

            return {
                contentId: content.id,
                title: content.title,
                reason,
                priority,
                views,
                likes,
                purchases,
                conversionRate,
                engagementRate,
                recommendation,
            };
        })
        .filter(Boolean) as ContentAttention[];
})();


// ---------------------------------------------------------------------------
// TÂCHES ÉDITORIALES
// ---------------------------------------------------------------------------

export const MOCK_EDITORIAL_TASKS: EditorialTask[] = [
    ...MOCK_CONTENTS
        .filter((content) => content.status === 'draft')
        .slice(0, 3)
        .map((content, index) => ({
            id: `task-draft-${index}`,
            type: 'draft' as const,
            title: content.title,
            description: 'Ce contenu est encore enregistré en brouillon.',
            priority: 'medium' as const,
            contentId: content.id,
            actionLabel: 'Continuer la rédaction',
        })),

    ...MOCK_CONTENTS
        .filter((content) => content.status === 'pending_review')
        .slice(0, 3)
        .map((content, index) => ({
            id: `task-review-${index}`,
            type: 'correction' as const,
            title: content.title,
            description: 'Ce contenu attend actuellement une intervention éditoriale.',
            priority: 'high' as const,
            contentId: content.id,
            actionLabel: 'Voir le contenu',
        })),
];


// ---------------------------------------------------------------------------
// INSIGHTS ÉDITORIAUX
// ---------------------------------------------------------------------------

export const MOCK_INSIGHTS: EditorialInsight[] = (() => {
    const insights: EditorialInsight[] = [];

    const bestCategory = MOCK_CATEGORY_PERFORMANCE.length
        ? [...MOCK_CATEGORY_PERFORMANCE].sort(
            (a, b) => b.engagementRate - a.engagementRate
        )[0]
        : null;

    const bestSellingCategory = MOCK_CATEGORY_PERFORMANCE.length
        ? [...MOCK_CATEGORY_PERFORMANCE].sort(
            (a, b) => b.purchases - a.purchases
        )[0]
        : null;

    if (bestCategory) {
        insights.push({
            id: 'insight-best-category',
            type: 'positive',
            title: 'Votre audience réagit particulièrement à cette catégorie',
            description:
                `La catégorie « ${bestCategory.categoryName} » possède votre meilleur taux d’engagement.`,
            metric: 'Engagement',
            metricValue: `${bestCategory.engagementRate}%`,
        });
    }

    if (bestSellingCategory) {
        insights.push({
            id: 'insight-best-selling-category',
            type: 'opportunity',
            title: 'Une catégorie génère davantage de ventes',
            description:
                `« ${bestSellingCategory.categoryName} » est actuellement votre catégorie la plus performante commercialement.`,
            metric: 'Ventes',
            metricValue: formatNumber(bestSellingCategory.purchases),
        });
    }

    const attentionCount = MOCK_ATTENTION_CONTENTS.length;

    if (attentionCount > 0) {
        insights.push({
            id: 'insight-attention',
            type: 'warning',
            title: 'Certains contenus méritent votre attention',
            description:
                `${attentionCount} contenu${attentionCount > 1 ? 's' : ''} présente${attentionCount > 1 ? 'nt' : ''} un potentiel d’amélioration.`,
            metric: 'À optimiser',
            metricValue: `${attentionCount}`,
        });
    }

    if (MOCK_KPI_SUMMARY.viewsTrend > 0) {
        insights.push({
            id: 'insight-growth',
            type: 'positive',
            title: 'Votre audience progresse',
            description:
                'Le nombre de vues évolue positivement par rapport à la période précédente.',
            metric: 'Évolution des vues',
            metricValue: `+${MOCK_KPI_SUMMARY.viewsTrend}%`,
        });
    }

    return insights;
})();

function formatNumber(value: number) {
    return value.toLocaleString('fr-FR');
}
