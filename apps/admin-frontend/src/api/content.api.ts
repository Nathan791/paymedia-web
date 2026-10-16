
import client from './client';

export const contentApi = {
    getAll: () => client.get('/contents'),
    approve: (id: number) => client.post(`/contents/${id}/approve`),
    block: (id: number) => client.post(`/contents/${id}/block`),
    unblock: (id: number) => client.post(`/contents/${id}/unblock`),
    archive: (id: number) => client.post(`/contents/${id}/archive`),
    getDetail: (id: number) => client.get(`/contents/${id}/detail`),
        create: (data: any) => client.post('/contents', data),
        update: (id: number, data: any) => client.put(`/contents/${id}`, data),
        delete: (id: number) => client.delete(`/contents/${id}`)
}
;



