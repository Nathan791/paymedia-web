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

                    //  EXTRAIRE LES DONNÉES (gérer les deux formats)
                    const response = await authApi.login({
                        email,
                        password,
                    });
                    const userData = response.user;
                    const accessToken = response.accessToken;
                    if (!userData || !accessToken) {
                        console.error(' login - Données manquantes:', { userData, accessToken });
                        throw new Error('Données de connexion invalides');
                    }

                    //  RÉCUPÉRER L'ID ET L'ULID
                    const userId = userData.id;
                    const userUlid = userData.ulid;
                    console.log('🔵 login - userId extrait:', userId);
                    console.log('🔵 login - userUlid extrait:', userUlid);

                    //  STOCKER DANS LOCALSTORAGE
                    localStorage.setItem('access_token', accessToken);
                    localStorage.setItem('user_id', String(userId));
                    localStorage.setItem('user_ulid', userUlid);

                    console.log('🔵 login - user_id stocké:', localStorage.getItem('user_id'));
                    console.log('🔵 login - user_ulid stocké:', localStorage.getItem('user_ulid'));

                    //  CONSTRUIRE L'OBJET USER
                    const user = {
                        id: userId,
                        ulid: userUlid,
                        username: userData.username || '',
                        email: userData.email || '',
                        role: userData.role || 'editor',
                        roles: [userData.role || 'editor'],
                        whatsappPhone: userData.whatsappPhone || '',
                        countryCode: userData.countryCode || '',
                        isVerified: userData.isVerified ?? false,
                        isActive: userData.isActive ?? true,
                        lastLoginAt: userData.lastLoginAt || new Date().toISOString(),
                        createdAt: userData.createdAt || new Date().toISOString(),
                        updatedAt: userData.updatedAt || new Date().toISOString(),
                        walletId: userData.walletId,
                        wallet: userData.wallet,
                    };
                    set({
                        user: user,
                        token: accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });

                    console.log(' login - Terminé avec succès');
                } catch (error: any) {
                    console.error(' login error:', error);
                    set({
                        error: error.response?.data?.message || 'Erreur de connexion',
                        isLoading: false,
                        isAuthenticated: false,
                    });
                    throw error;
                }
            },

            logout: async () => {
                console.log(' Store - Logout - Début');
                set({ isLoading: true });
                try {
                    await authApi.logout();
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

                    console.log(' Store - Logout - Terminé');
                    window.location.href = '/login';
                }
            },

            register: async (data: any) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authApi.register(data);

                    const accessToken = response.accessToken;
                    const userData = response.user;

                    if (accessToken) {
                        localStorage.setItem('access_token', accessToken);
                    }
                    if (userData) {
                        const userId = userData.ulid || userData.id;
                        localStorage.setItem('user_id', String(userId));
                    }

                    set({
                        user: userData,
                        token: accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error: any) {
                    console.error(' Register error:', error);
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
                    // À implémenter si besoin
                    set({ isLoading: false });
                } catch (error: any) {
                    console.error(' GetProfile error:', error);
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