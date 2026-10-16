// src/services/team.service.ts
import { teamRepository } from '@/repositories/team.repository';
import { TeamRole } from '@/models';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const teamService = {
    list: () => teamRepository.list(),

    invite(email: string, role: TeamRole) {
        if (!EMAIL_RE.test(email.trim())) throw new Error('Adresse e-mail invalide.');
        return teamRepository.invite(email.trim(), role);
    },

    updateRole: (id: string, role: TeamRole) => teamRepository.updateRole(id, role),

    suspend: (id: string) => teamRepository.setStatus(id, 'suspended'),
    reactivate: (id: string) => teamRepository.setStatus(id, 'active'),
};
