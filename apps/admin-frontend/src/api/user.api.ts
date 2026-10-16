import client from './client';

export const userApi = {
    //  Récupérer tous les utilisateurs
    getAll: () => client.get('/users'),
    getDetail: (id: number) => client.get(`/users/${id}/detail`),
    //  Bloquer un utilisateur (à adapter si l'API réelle a cet endpoint)
    block: (id: number) => client.post(`/users/${id}/block`),
    unblock: (id: number) => client.post(`/users/${id}/unblock`),
    //  Mettre à jour le rôle
    updateRole: (id: number, role: string) =>
        client.put(`/users/${id}/role`, { role }),

    //  Créer un utilisateur
    create: (data: any) => client.post('/users', data),

    //  Mettre à jour un utilisateur
    update: (id: number, data: any) => client.put(`/users/${id}`, data),

    //  Supprimer un utilisateur
    delete: (id: number) => client.delete(`/users/${id}`),

};







/*
import mockClient from './mockClient';

  //API pour la gestion des utilisateurs

export const userApi = {

     //Récupère la liste de tous les utilisateurs

    getAll: () => mockClient.get('/users'),



     // Récupère les détails d'un utilisateur avec ses statistiques


    getDetail: (id: number) => mockClient.get(`/users/${id}/detail`),

     //Bloque un utilisateur (désactive son compte)

    block: (id: number) => mockClient.post(`/users/${id}/block`),

     //Débloque un utilisateur (réactive son compte)

    unblock: (id: number) => mockClient.post(`/users/${id}/unblock`),

      //Met à jour le rôle d'un utilisateur

    updateRole: (id: number, role: string) =>
        mockClient.put(`/users/${id}/role`, { role }),

    //  Ajouter un utilisateur
    create: (data: { username: string; email: string; role: string; password?: string }) =>
        mockClient.post('/users', data),

    //  Modifier un utilisateur
    update: (id: number, data: { username?: string; email?: string; role?: string; isActive?: boolean }) =>
        mockClient.put(`/users/${id}`, data),

    //  Supprimer un utilisateur
    delete: (id: number) => mockClient.delete(`/users/${id}`),
};

 */

