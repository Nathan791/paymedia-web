import mockClient from './mockClient.js';

//  On utilise "mockClient" (mock) pour les données admin
export const dashboardApi = {
    //getStats: () => mockClient.get('/dashboard/stats'),
    getStats: (period?: string) =>
        mockClient.get('/dashboard/stats', { params: { period } }),
    getRecentActivities: () => mockClient.get('/dashboard/recent-activities'),
    getChartData: () => mockClient.get('/dashboard/chart-data'),

};




















/*
import client from './client';

export const dashboardApi = {
    getStats: () => client.get('/dashboard/stats'),
    getStats: (period?: string) =>
        client.get('/dashboard/stats', {
            params: { period },
        }),
    getRecentActivities: () => client.get('/dashboard/recent-activities'),
    getChartData: () => client.get('/dashboard/chart-data'),
};

 */


