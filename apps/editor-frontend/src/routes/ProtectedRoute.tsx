import {Navigate, Outlet,} from 'react-router-dom';
import { authStorage } from '@/auth/auth.storage';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

export function ProtectedRoute({
                                   allowedRoles,
                               }: ProtectedRouteProps) {
    if (!authStorage.isAuthenticated()) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    if (
        allowedRoles &&
        allowedRoles.length > 0
    ) {
        const role =
            authStorage.getRole();

        if (
            !role ||
            !allowedRoles.includes(role)
        ) {
            return (
                <Navigate
                    to="/"
                    replace
                />
            );
        }
    }

    return <Outlet />;


}
