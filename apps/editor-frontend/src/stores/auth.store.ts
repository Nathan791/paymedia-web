// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth.api.js';
import type { User, RegisterInput } from '@/models/user.model.js';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => Promise<void>;
    getProfile: () => Promise<void>;
    clearError: () => void;
    reset: () => void;
}

const initialState = {
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
};

/** Normalise l'utilisateur de l'API vers le modèle du frontend. */
function toUser(u: User): User {
    const role = u.role ?? 'reader';
    return {
        ...u, // spread d'abord, pour ne pas écraser les champs normalisés
        id: u.id ?? 0,
        ulid: u.ulid ?? '',
        username: u.username ?? '',
        email: u.email ?? '',
        role,
        roles: [role],
    };
}

function clearStoredSession() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_ulid');
    localStorage.removeItem('auth-storage');
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            ...initialState,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authApi.login(email, password);

                    if (!data?.user || !data?.access_token) {
                        throw new Error('Données de connexion invalides');
                    }

                    // AuthUser (auth.storage) -> User (modèle du store)
                    const user = toUser(data.user as unknown as User);

                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('user_id', String(user.id));
                    if (user.ulid) localStorage.setItem('user_ulid', user.ulid);

                    set({
                        user,
                        token: data.access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    set({
                        error:
                            error.response?.data?.message ||
                            error.message ||
                            'Erreur de connexion',
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    // Pas de token à l'inscription : on se connecte ensuite.
                    await authApi.register(data);
                    await get().login(data.email, data.password);
                } catch (error: any) {
                    set({
                        error:
                            error.response?.data?.message ||
                            error.message ||
                            "Erreur d'inscription",
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                // Réinitialiser d'abord : authApi.logout() redirige vers /login
                clearStoredSession();
                sessionStorage.clear();
                set({ ...initialState });
                authApi.logout();
            },

            getProfile: async () => {
                // À brancher sur un endpoint /me quand il existera côté API.
                set({ isLoading: false, error: null });
            },

            clearError: () => set({ error: null }),

            reset: () => {
                set({ ...initialState });
                clearStoredSession();
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);