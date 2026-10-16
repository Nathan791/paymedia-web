// src/repositories/team.repository.ts
//
// Flux d'invitation (Master Prompt §28) : on ne crée jamais un compte
// dupliqué si l'email existe déjà dans l'équipe — on renvoie une erreur
// claire plutôt que de créer un doublon silencieux.
import { TeamMember, TeamRole } from '@/models';
import { MOCK_TEAM_MEMBERS } from '@/data/mock';
import { delay, generateId } from './_utils';

let teamDb: TeamMember[] = MOCK_TEAM_MEMBERS.map((m) => ({ ...m }));

export const teamRepository = {
    async list(): Promise<TeamMember[]> {
        await delay(null);
        return [...teamDb].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    },

    async invite(email: string, role: TeamRole): Promise<TeamMember> {
        await delay(null, 500);
        const existing = teamDb.find((m) => m.email.toLowerCase() === email.toLowerCase());
        if (existing) {
            throw new Error(`${email} fait déjà partie de l'équipe (${existing.status === 'invited' ? 'invitation en attente' : existing.status}).`);
        }
        const member: TeamMember = {
            id: generateId('usr'),
            name: email.split('@')[0],
            email,
            role,
            status: 'invited',
            joinedAt: new Date().toISOString(),
        };
        teamDb = [...teamDb, member];
        return { ...member };
    },

    async updateRole(id: string, role: TeamRole): Promise<TeamMember> {
        await delay(null, 350);
        const index = teamDb.findIndex((m) => m.id === id);
        if (index === -1) throw new Error('Membre introuvable.');
        const updated = { ...teamDb[index], role };
        teamDb = [...teamDb.slice(0, index), updated, ...teamDb.slice(index + 1)];
        return { ...updated };
    },

    async setStatus(id: string, status: TeamMember['status']): Promise<TeamMember> {
        await delay(null, 350);
        const index = teamDb.findIndex((m) => m.id === id);
        if (index === -1) throw new Error('Membre introuvable.');
        const updated = { ...teamDb[index], status };
        teamDb = [...teamDb.slice(0, index), updated, ...teamDb.slice(index + 1)];
        return { ...updated };
    },
};
