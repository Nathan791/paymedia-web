
import mockClient from './mockClient';

export const transactionApi = {
    getAll: () => mockClient.get('/transactions'),
    getDetail: (id: number) => mockClient.get(`/transactions/${id}/detail`)
};



