import mockClient from './mockClient.js';

export const commissionApi = {
    getAll: () => mockClient.get('/commissions'),
    update: (id: number, rate: number) => mockClient.put(`/commissions/${id}`, { rate }),
    updateRate: (id: number, rate: number) => mockClient.put(`/commissions/${id}/rate`, { rate }),
    getDetail: (id: number) => mockClient.get(`/commissions/${id}/detail`),
};



