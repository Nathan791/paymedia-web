import mockClient from './mockClient';


export const auditApi = {
            //Récupère tous les journaux d'audit

    getAll: () => mockClient.get('/audit'),

            //Récupère les logs d'un admin spécifique

    getByAdmin: (adminId: number) => mockClient.get(`/audit/admin/${adminId}`),

            //Récupère les logs par type d'action
    getByAction: (action: string) => mockClient.get(`/audit/action/${action}`),
};


