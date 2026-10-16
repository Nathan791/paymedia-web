// src/context/AuthContext.tsx
//
// Pourquoi un Context ET un store Zustand ?
// Le store porte l'état et la logique (réutilisable partout, y compris hors
// React si besoin). Le Context, lui, a un rôle précis et limité : déclencher
// UNE FOIS la restauration de session au montage de l'app, et exposer un
// point d'entrée unique (`useAuth()`) aux composants — qui n'ont pas besoin
// de savoir que Zustand existe en dessous.
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface AuthContextValue {
    isAuthenticated: boolean;
    isRestoring: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isRestoring = useAuthStore((s) => s.isRestoring);
    const restoreSession = useAuthStore((s) => s.restoreSession);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isRestoring }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>.');
    return ctx;
}
