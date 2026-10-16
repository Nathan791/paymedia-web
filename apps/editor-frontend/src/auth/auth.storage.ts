export interface AuthUser {
    id?: number;
    ulid?: string;
    username?: string;
    email?: string;

    role?: string;
    effectiveRole?: string;
}

const TOKEN_KEY = 'access_token';
const USER_KEY = 'auth_user';

export const authStorage = {
    setToken(token: string) {
        localStorage.setItem(
            TOKEN_KEY,
            token
        );
    },

    getToken(): string | null {
        return localStorage.getItem(
            TOKEN_KEY
        );
    },

    setUser(user: AuthUser) {
        localStorage.setItem(
            USER_KEY,
            JSON.stringify(user)
        );

        if (user.ulid) {
            localStorage.setItem(
                'user_ulid',
                user.ulid
            );
        }

        if (user.role) {
            localStorage.setItem(
                'user_role',
                user.role
            );
        }

        if (user.effectiveRole) {
            localStorage.setItem(
                'effective_role',
                user.effectiveRole
            );
        }
    },

    getUser(): AuthUser | null {
        const raw =
            localStorage.getItem(USER_KEY);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    getRole(): string | null {
        const user =
            authStorage.getUser();

        return (
            user?.effectiveRole ||
            user?.role ||
            localStorage.getItem('effective_role') ||
            localStorage.getItem('user_role')
        );
    },

    clear() {
        localStorage.removeItem(
            TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );

        localStorage.removeItem(
            'user_ulid'
        );

        localStorage.removeItem(
            'user_role'
        );

        localStorage.removeItem(
            'effective_role'
        );
    },

    isAuthenticated(): boolean {
        return Boolean(
            authStorage.getToken()
        );
    },
};