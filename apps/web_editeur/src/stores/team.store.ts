// src/stores/team.store.ts
import { create } from 'zustand';
import { teamService } from '@/services/team.service';
import type { TeamRole } from '@/models/auth.model';

export type { TeamRole };
export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: TeamRole;
    status: 'active' | 'invited' | 'suspended' | string;
    joinedAt: string;
}

interface TeamState {
    members: TeamMember[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    fetchMembers: () => Promise<void>;
    inviteMember: (email: string, role: string) => Promise<void>;
    updateRole: (id: string, role: string) => Promise<void>;
    suspendMember: (id: string) => Promise<void>;
    reactivateMember: (id: string) => Promise<void>;
    clearError: () => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
    members: [],
    isLoading: false,
    isSaving: false,
    error: null,

    fetchMembers: async () => {
        set({ isLoading: true, error: null });
        try {
            const members = await teamService.list();
            set({ members, isLoading: false });
        } catch (error: any) {
            set({ error: error.message || 'Erreur de chargement.', isLoading: false });
        }
    },

    inviteMember: async (email, role) => {
        set({ isSaving: true, error: null });
        try {
            const member = await teamService.invite(email, role as TeamRole);
            set({ members: [...get().members, member], isSaving: false });
        } catch (error: any) {
            set({ error: error.message || "Erreur lors de l'invitation.", isSaving: false });
            throw error;
        }
    },

    updateRole: async (id, role) => {
        try {
            const updated = await teamService.updateRole(id, role as TeamRole);
            set({ members: get().members.map((m) => (m.id === id ? updated : m)) });
        } catch (error: any) {
            set({ error: error.message || 'Erreur lors du changement de rôle.' });
            throw error;
        }
    },

    suspendMember: async (id) => {
        try {
            const updated = await teamService.suspend(id);
            set({ members: get().members.map((m) => (m.id === id ? updated : m)) });
        } catch (error: any) {
            set({ error: error.message || 'Erreur.' });
            throw error;
        }
    },

    reactivateMember: async (id) => {
        try {
            const updated = await teamService.reactivate(id);
            set({ members: get().members.map((m) => (m.id === id ? updated : m)) });
        } catch (error: any) {
            set({ error: error.message || 'Erreur.' });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));