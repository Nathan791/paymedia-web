import { Content } from './content.model.js';

export interface Transaction {
    id: number;
    wallet_id: number;
    content_id?: number;
    transaction_type: 'recharge' | 'paiement';
    amount: number;
    external_provider?: string;
    external_reference?: string;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
    content?: Content;
}

export interface TransactionStats {
    total_transactions: number;
    total_revenue: number;
    total_commission: number;
    average_amount: number;
}