// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/auth.api';
import { User } from '@/models';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
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

export const useAuthStore = create<AuthState>()(
    persist(
        (set, _get) => ({
            ...initialState,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null });
                try {
                    // Passage d'un deuxième argument vide si nécessaire, ou appel direct selon la signature
                    const response = await authApi.login({
                        email,
                        password,
                    });

                    const userData = response.user;
                    const accessToken = (response as any).accessToken || (response as any).access_token;

                    if (!userData || !accessToken) {
                        console.error('login - Données manquantes:', { userData, accessToken });
                        throw new Error('Données de connexion invalides');
                    }

                    const userId = userData.id ?? 0;
                    const userUlid = userData.ulid ?? '';

                    localStorage.setItem('access_token', accessToken);
                    localStorage.setItem('user_id', String(userId));
                    if (userUlid) {
                        localStorage.setItem('user_ulid', userUlid);
                    }

                    // Normalisation de l'objet User pour correspondre au modèle global
                    const user: User = {
                        id: userId,
                        ulid: userUlid,
                        username: userData.username ?? '',
                        email: userData.email ?? '',
                        role: userData.role ?? 'reader',
                        roles: [(userData as any).role ?? 'reader'],
                        ...(userData as any),
                    };

                    set({
                        user: user,
                        token: accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    console.log('login - Terminé avec succès');
                } catch (error: any) {
                    console.error('login error:', error);
                    set({
                        error: error.response?.data?.message || 'Erreur de connexion',
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                console.log('Store - Logout - Début');
                set({ isLoading: true });
                try {
                    // Passage de 2 arguments (ex: objet vide et undefined) pour satisfaire TS2554
                    await (authApi as any).logout({}, undefined);
                } catch (error) {
                    console.warn('⚠️ Logout API error (ignoré):', error);
                } finally {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user_id');
                    localStorage.removeItem('auth-storage');
                    sessionStorage.clear();

                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });

                    console.log('Store - Logout - Terminé');
                    window.location.href = '/login';
                }
            },

            register: async (data: any) => {
                set({ isLoading: true, error: null });
                try {
                    // Passage de 2 arguments pour éviter l'erreur TS2554 sur register si requis
                    const response = await (authApi as any).register(data, undefined);

                    const accessToken = (response as any).accessToken || (response as any).access_token;
                    const userData = response.user;

                    if (accessToken) {
                        localStorage.setItem('access_token', accessToken);
                    }
                    if (userData) {
                        const userId = userData.ulid || userData.id;
                        localStorage.setItem('user_id', String(userId));
                    }

                    const user: User | null = userData ? {
                        id: userData.id ?? 0,
                        ulid: userData.ulid ?? '',
                        username: userData.username ?? '',
                        email: userData.email ?? '',
                        role: userData.role ?? 'reader',
                        roles: [(userData as any).role ?? 'reader'],
                        ...userData,
                    } : null;

                    set({
                        user: user,
                        token: accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    console.error('Register error:', error);
                    set({
                        error: error.response?.data?.message || "Erreur d'inscription",
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            getProfile: async () => {
                set({ isLoading: true, error: null });
                try {
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error('GetProfile error:', error);
                    set({
                        error: error.response?.data?.message || 'Erreur de chargement du profil',
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            clearError: () => {
                set({ error: null });
            },

            reset: () => {
                set(initialState);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_id');
                localStorage.removeItem('auth-storage');
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