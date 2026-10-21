// src/components/routes/EditorRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';

export const EditorRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    console.log('🔵 EditorRoute - isLoading:', isLoading);
    console.log('🔵 EditorRoute - isAuthenticated:', isAuthenticated);
    console.log('🔵 EditorRoute - user:', user);

    // ⭐ PENDANT LE CHARGEMENT, AFFICHER UN LOADER
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                Chargement...
            </div>
        );
    }

    // ⭐ SI NON AUTHENTIFIÉ → REDIRIGER VERS LOGIN
    if (!isAuthenticated || !user) {
        console.log('🔴 EditorRoute - Redirection vers /login');
        return <Navigate to="/login" replace />;
    }

    // ⭐ VÉRIFIER LE RÔLE
    const hasEditorRole = user.role === 'editor' || user.roles?.includes('editor');

    if (!hasEditorRole) {
        console.log('🔴 EditorRoute - Rôle non autorisé:', user.role, user.roles);
        return <Navigate to="/access-denied" replace />;
    }

    console.log('🟢 EditorRoute - Accès autorisé');
    return <>{children}</>;
};