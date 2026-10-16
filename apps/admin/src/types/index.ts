export interface AdminUser {
    id: number;
    username: string;
    email: string | null;
    role: string;
    isActive: boolean;
    countryCode: string;
    passwordHash?: string | null;
    wallet?: {
        id: number;
        balance: number;
        currency: string;
    } | null;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: AdminUser;
}

// ============================================================
// DASHBOARD TYPES
// ============================================================

export interface DashboardStats {
    // KPI Principaux
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

    // Croissance
    growth: {
        users: number;
        contents: number;
        revenue: number;
        transactions: number;
    };

    // Alertes
    alerts: {
        total: number;
        items: AlertItem[];
    };

    // Activité récente
    recentActivities: ActivityItem[];

    // Top contenus
    topContents: TopContentItem[];

    // Données pour graphiques
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