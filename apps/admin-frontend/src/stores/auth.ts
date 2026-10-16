import { create } from 'zustand';
import { authApi } from '../api/auth.api';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authApi.login(email, password);

            //  La réponse contient accessToken, pas token
            const data = response.data.data;
            const token = data.accessToken;
            const user = data.user;

            if (!token) {
                console.error(' Aucun token trouvé dans la réponse:', data);
                set({ error: 'Token non trouvé dans la réponse', isLoading: false });
                return false;
            }

            console.log(' Token trouvé:', token.substring(0, 30) + '...');

            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUser', JSON.stringify(user));

            set({ user, isLoading: false });
            return true;
        } catch (error: any) {
            console.error(' Erreur login:', error.response?.data || error.message);
            const msg = error.response?.data?.error || 'Erreur de connexion';
            set({ error: msg, isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        set({ user: null });
    },

    checkAuth: () => {
        const token = localStorage.getItem('adminToken');
        const userStr = localStorage.getItem('adminUser');
        if (token && userStr) {
            try {
                set({ user: JSON.parse(userStr) });
                return true;
            } catch {
                return false;
            }
        }
        return false;
    },
}));




/*
import { create } from 'zustand';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => boolean;
}

// Pour le mock, on simule un utilisateur directement
const MOCK_USER: User = {
    id: 1,
    username: 'SuperAdmin',
    email: 'admin@paymedia.com',
    role: 'admin',
};

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });

        // Simuler un appel API
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Accepter les identifiants mock
        if (email === 'admin@paymedia.com' && password === 'Admin123!') {
            localStorage.setItem('adminUser', JSON.stringify(MOCK_USER));
            set({ user: MOCK_USER, isLoading: false });
            return true;
        }

        set({ error: 'Email ou mot de passe incorrect', isLoading: false });
        return false;
    },

    logout: () => {
        localStorage.removeItem('adminUser');
        set({ user: null });
    },

    checkAuth: () => {
        const userStr = localStorage.getItem('adminUser');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user });
                return true;
            } catch {
                return false;
            }
        }
        return false;
    },
}));

 */





