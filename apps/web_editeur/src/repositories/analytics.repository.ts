// src/repositories/analytics.repository.ts

import {
    ActivityEvent,
    CategoryPerformance,
    ContentAnalyticsPoint,
    ContentAttention,
    EditorialInsight,
    EditorialTask,
    KpiSummary,
    RevenuePoint,
    TopContent,
} from '@/models';

import {
    MOCK_ACTIVITY,
    MOCK_ATTENTION_CONTENTS,
    MOCK_CATEGORY_PERFORMANCE,
    MOCK_EDITORIAL_TASKS,
    MOCK_INSIGHTS,
    MOCK_KPI_SUMMARY,
    MOCK_REVENUE_SERIES,
    MOCK_TOP_CONTENTS,
} from '@/data/mock';

import { contentRepository } from './content.repository';
import { delay } from './_utils';


function seededNoise(seed: string, index: number): number {
    let hash = 0;

    for (let i = 0; i < seed.length; i++) {
        hash =
            (hash * 31 + seed.charCodeAt(i)) &
            0xffffffff;
    }

    const x =
        Math.sin(hash + index * 12.9898) *
        43758.5453;

    return x - Math.floor(x);
}


export const analyticsRepository = {

    async getKpiSummary(): Promise<KpiSummary> {
        await delay(null, 350);

        return {
            ...MOCK_KPI_SUMMARY,
        };
    },


    async getRevenueSeries(
        days = 30
    ): Promise<RevenuePoint[]> {
        await delay(null, 400);

        return MOCK_REVENUE_SERIES.slice(-days);
    },


    async getCategoryPerformance(): Promise<CategoryPerformance[]> {
        await delay(null, 350);

        return [...MOCK_CATEGORY_PERFORMANCE];
    },


    async getTopContents(
        limit = 5
    ): Promise<TopContent[]> {
        await delay(null, 350);

        return MOCK_TOP_CONTENTS.slice(0, limit);
    },


    async getAttentionContents(): Promise<ContentAttention[]> {
        await delay(null, 350);

        return [...MOCK_ATTENTION_CONTENTS];
    },


    async getEditorialTasks(): Promise<EditorialTask[]> {
        await delay(null, 300);

        return [...MOCK_EDITORIAL_TASKS];
    },


    async getInsights(): Promise<EditorialInsight[]> {
        await delay(null, 300);

        return [...MOCK_INSIGHTS];
    },


    async getActivity(
        limit = 10
    ): Promise<ActivityEvent[]> {
        await delay(null, 300);

        return [...MOCK_ACTIVITY]
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )
            .slice(0, limit);
    },


    async getContentSeries(
        contentId: string,
        days = 30
    ): Promise<ContentAnalyticsPoint[]> {

        await delay(null, 400);

        const content =
            await contentRepository.getById(contentId);

        if (
            content.status !== 'published' ||
            content.stats.views === 0
        ) {
            return [];
        }

        const weights = Array.from(
            { length: days },
            (_, i) =>
                0.4 +
                seededNoise(contentId, i) * 1.2
        );

        const totalWeight =
            weights.reduce(
                (a, b) => a + b,
                0
            );

        let runningViews = 0;
        let runningPurchases = 0;
        let runningRevenue = 0;

        return weights.map((weight, index) => {

            const isLast =
                index === days - 1;

            const share =
                weight / totalWeight;

            const views = isLast
                ? content.stats.views - runningViews
                : Math.round(
                    content.stats.views * share
                );

            const purchases = isLast
                ? content.stats.purchases -
                runningPurchases
                : Math.round(
                    content.stats.purchases *
                    share
                );

            const revenue = isLast
                ? content.stats.revenue -
                runningRevenue
                : Math.round(
                    content.stats.revenue *
                    share
                );

            runningViews += views;
            runningPurchases += purchases;
            runningRevenue += revenue;

            const date = new Date(
                Date.now() -
                (days - 1 - index) *
                24 *
                60 *
                60 *
                1000
            )
                .toISOString()
                .slice(0, 10);

            return {
                date,
                views: Math.max(0, views),
                purchases: Math.max(0, purchases),
                revenue: Math.max(0, revenue),
            };
        });
    },
};