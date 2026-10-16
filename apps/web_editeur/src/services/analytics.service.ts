// src/services/analytics.service.ts

import { analyticsRepository } from '@/repositories/analytics.repository';

export const analyticsService = {

    getKpiSummary: () =>
        analyticsRepository.getKpiSummary(),

    getRevenueSeries: (days?: number) =>
        analyticsRepository.getRevenueSeries(days),

    getCategoryPerformance: () =>
        analyticsRepository.getCategoryPerformance(),

    getTopContents: (limit?: number) =>
        analyticsRepository.getTopContents(limit),

    getAttentionContents: () =>
        analyticsRepository.getAttentionContents(),

    getEditorialTasks: () =>
        analyticsRepository.getEditorialTasks(),

    getInsights: () =>
        analyticsRepository.getInsights(),

    getActivity: (limit?: number) =>
        analyticsRepository.getActivity(limit),

    getContentSeries: (
        contentId: string,
        days?: number
    ) =>
        analyticsRepository.getContentSeries(
            contentId,
            days
        ),
};