// ============================================================
// TYPES DE BASE
// ============================================================

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'admin' | 'editor' | 'reader';
    isActive: boolean;
    countryCode?: string;
    createdAt?: string;
}

export interface Content {
    id: number;
    title: string;
    description?: string;
    mediaType: 'epub' | 'audio' | 'video' | 'pdf';
    price: number;
    status: 'draft' | 'pending' | 'published' | 'blocked' | 'archived';
    author: {
        id: number;
        username: string;
    } | null;
    userId: number;
    isPremium?: boolean;
    category?: string;
    publishedAt?: string;
    views?: number;
    createdAt: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

// ============================================================
// DASHBOARD TYPES (CORRIGÉS)
// ============================================================

export interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    totalContents: number;
    publishedContents: number;
    pendingModeration: number;
    blockedContents: number;
    monthlyRevenue: number;
    totalRevenue: number;
    totalTransactions: number;
    failedTransactions: number;
    completedTransactions: number;
    conversionRate: number;
    growth: {
        users: number;
        contents: number;
        revenue: number;
        transactions: number;
    };
    alerts: {
        total: number;
        items: AlertItem[];
    };
    recentActivities: ActivityItem[];
    topContents: TopContentItem[];
    chartData: ChartData;
}

export interface AlertItem {
    id: number;
    type: 'security' | 'content' | 'payment' | 'system';
    severity: 'high' | 'medium' | 'low';
    message: string;
    date: string;
}

export interface ActivityItem {
    id: number;
    user: string;
    action: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed';
    date: string;
}

export interface TopContentItem {
    id: number;
    title: string;
    author: string;
    sales: number;
    revenue: number;
}

export interface ChartData {
    labels: string[];
    sales: number[];
    users: number[];
    contents: number[];
}

// ============================================================
// USER DETAIL TYPES
// ============================================================

export interface UserDetail extends User {
    stats: {
        totalPurchases?: number;
        totalSpent?: number;
        recentlyViewed?: { id: number; title: string; viewedAt: string }[];
        totalContents?: number;
        totalRevenue?: number;
        totalCommission?: number;
        topContents?: { id: number; title: string; sales: number; revenue: number }[];
        totalActions?: number;
        totalModerations?: number;
        recentActions?: { id: number; action: string; target: string; date: string }[];
    };
}
// ============================================================
// CONTENT DETAIL TYPES
// ============================================================

export interface ContentDetail {
    id: number;
    title: string;
    description?: string;
    mediaType: 'epub' | 'audio' | 'video' | 'pdf';
    price: number;
    status: 'draft' | 'pending' | 'published' | 'blocked' | 'archived';
    author: {
        id: number;
        username: string;
        email: string;
    } | null;
    userId: number;
    isPremium?: boolean;
    category?: string;
    publishedAt?: string;
    views?: number;
    createdAt: string;
    stats: {
        views: number;
        downloads: number;
        purchases: number;
        revenue: number;
    };
    moderationHistory: {
        id: number;
        action: string;
        moderator: string;
        comment: string;
        date: string;
    }[];
    chartData: {
        labels: string[];
        sales: number[];
    };
}

// ============================================================
// TRANSACTION DETAIL TYPES (à conserver si existants)
// ============================================================

export interface TransactionDetail {
    id: number;
    user: string;
    type: 'recharge' | 'achat' | 'reversement';
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    date: string;
    userInfo: {
        id: number;
        username: string;
        email: string;
        countryCode: string;
    } | null;
    userStats: {
        totalTransactions: number;
        totalSpent: number;
        averageAmount: number;
    };
    userHistory: {
        id: number;
        type: string;
        amount: number;
        status: string;
        date: string;
    }[];
}

// ============================================================
// COMMISSION DETAIL TYPES (à conserver si existants)
// ============================================================

export interface CommissionDetail {
    id: number;
    editor: string;
    amount: number;
    status: 'paid' | 'pending' | 'published';
    month: string;
    history: {
        id: number;
        amount: number;
        status: string;
        month: string;
    }[];
    stats: {
        totalCommissions: number;
        averageCommission: number;
        totalPaid: number;
        totalPending: number;
    };
}