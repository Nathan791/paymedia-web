export interface User {
    id: number;
    ulid: string;

    username: string;
    email: string;

    role: string;
    effectiveRole?: string;

    whatsappPhone?: string;
    countryCode?: string;

    isVerified?: boolean;
    isActive?: boolean;

    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;

    walletId?: number;

    wallet?: {
        ulid: string;
        balance: string;
        currency: string;
    };

    roles?: string[];
}