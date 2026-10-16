export interface Payout {
    id: number;
    user_id: number;
    period_start: string;
    period_end: string;
    gross_amount: number;
    commission_amount: number;
    net_amount: number;
    status: 'pending' | 'paid' | 'failed';
    paid_at?: string;
    created_at: string;
}

export interface PayoutStats {
    total_pending: number;
    total_paid: number;
    total_amount: number;
    last_payout_date?: string;
}