// src/stores/analytics.store.ts

import { create } from 'zustand';

import { analyticsService } from '@/services/analytics.service';

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


interface AnalyticsState {

    kpi: KpiSummary | null;

    revenueSeries: RevenuePoint[];

    categoryPerformance: CategoryPerformance[];

    topContents: TopContent[];

    attentionContents: ContentAttention[];

    editorialTasks: EditorialTask[];

    insights: EditorialInsight[];

    activity: ActivityEvent[];

    isLoading: boolean;

    error: string | null;

    fetchDashboard: () => Promise<void>;

    clearError: () => void;

    contentSeries: Record<
        string,
        ContentAnalyticsPoint[]
    >;

    isContentSeriesLoading: boolean;

    fetchContentSeries: (
        contentId: string
    ) => Promise<void>;
}


export const useAnalyticsStore =
    create<AnalyticsState>((set) => ({

        kpi: null,

        revenueSeries: [],

        categoryPerformance: [],

        topContents: [],

        attentionContents: [],

        editorialTasks: [],

        insights: [],

        activity: [],

        isLoading: false,

        error: null,

        contentSeries: {},

        isContentSeriesLoading: false,


        fetchDashboard: async () => {

            set({
                isLoading: true,
                error: null,
            });

            try {

                const [
                    kpi,
                    revenueSeries,
                    categoryPerformance,
                    topContents,
                    attentionContents,
                    editorialTasks,
                    insights,
                    activity,
                ] = await Promise.all([

                    analyticsService
                        .getKpiSummary(),

                    analyticsService
                        .getRevenueSeries(30),

                    analyticsService
                        .getCategoryPerformance(),

                    analyticsService
                        .getTopContents(5),

                    analyticsService
                        .getAttentionContents(),

                    analyticsService
                        .getEditorialTasks(),

                    analyticsService
                        .getInsights(),

                    analyticsService
                        .getActivity(8),
                ]);


                set({

                    kpi,

                    revenueSeries,

                    categoryPerformance,

                    topContents,

                    attentionContents,

                    editorialTasks,

                    insights,

                    activity,

                    isLoading: false,
                });

            } catch (error: any) {

                set({

                    error:
                        error?.message ??
                        'Erreur de chargement du tableau de bord.',

                    isLoading: false,
                });
            }
        },


        fetchContentSeries: async (
            contentId
        ) => {

            set({
                isContentSeriesLoading: true,
                error: null,
            });

            try {

                const series =
                    await analyticsService
                        .getContentSeries(
                            contentId,
                            30
                        );

                set((state) => ({

                    contentSeries: {

                        ...state.contentSeries,

                        [contentId]: series,
                    },

                    isContentSeriesLoading: false,
                }));

            } catch (error: any) {

                set({

                    error:
                        error?.message ??
                        'Erreur de chargement des statistiques.',

                    isContentSeriesLoading: false,
                });
            }
        },


        clearError: () => {

            set({
                error: null,
            });
        },
    }));