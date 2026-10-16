export type MediaType =
    | 'epub'
    | 'pdf'
    | 'audio'
    | 'video';

export type ContentStatus =
    | 'draft'
    | 'pending'
    | 'published'
    | 'blocked'
    | 'archived';

export interface Category {
    id: string | number;
    name: string;
    slug: string;
    created_at?: string;
    createdAt?: string;
}

export interface ContentAuthor {
    id?: number;
    ulid?: string;
    username: string;
}

export interface ContentCategory {
    id: number | string;
    name: string;
    slug: string;
}

export interface Content {
    id?: string | number;

    ulid: string;

    title: string;

    description?: string | null;

    mediaType: MediaType;

    fileUrl?: string | null;

    coverUrl?: string | null;

    coverImage?: string | null;

    userId?: number;

    categoryId?: number | string | null;

    isPremium: boolean;

    price: number | string;

    status: ContentStatus;

    createdAt: string;

    updatedAt: string;

    deletedAt?: string | null;

    category?: ContentCategory | null;

    author?: ContentAuthor | null;
}

export interface ContentStats {
    total_views: number;
    total_purchases: number;
    conversion_rate: number;
    revenue: number;
}

export interface ContentWithStats extends Content {
    stats: ContentStats;
}













/*export interface Category {
    id: string;
    name: string;
    slug: string;
    created_at: string;
}


export interface Content {
    id: string;
    ulid?: string;
    title: string;
    description?: string;
    mediaType: 'epub' | 'audio' | 'video';
    fileUrl: string;
    coverUrl?: string;
    coverImage?: string;
    userId?: number;
    categoryId?: number;
    isPremium: boolean;
    price: number | string;

    status: 'draft' | 'published' | 'publie' | 'bloque' | 'archive';
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    author?: {
        id?: number;
        ulid?: string;
        username: string;
    };
}

export interface ContentStats {
    total_views: number;
    total_purchases: number;
    conversion_rate: number;
    revenue: number;
}

export interface ContentWithStats extends Content {
    stats: ContentStats;
}

 */