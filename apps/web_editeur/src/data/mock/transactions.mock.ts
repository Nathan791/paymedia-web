// src/data/mock/transactions.mock.ts
import { PayoutRequest, Transaction } from '@/models';

const methods: Transaction['paymentMethod'][] = ['orange_money', 'mtn_momo', 'carte_bancaire', 'wave'];

function buildPurchases(): Transaction[] {
    const items: Transaction[] = [];
    const sources = [
        { contentId: 'cnt-001', contentTitle: "L'édition spéciale : 30 ans d'indépendance économique", amount: 1500 },
        { contentId: 'cnt-002', contentTitle: 'Podcast — Les voix du marché central', amount: 500 },
        { contentId: 'cnt-006', contentTitle: 'Rétrospective — La saison sportive 2025', amount: 800 },
    ];
    for (let i = 0; i < 18; i++) {
        const source = sources[i % sources.length];
        const commission = Math.round(source.amount * 0.15);
        items.push({
            id: `txn-${String(i + 1).padStart(3, '0')}`,
            type: 'purchase',
            status: i === 4 ? 'flagged' : i === 9 ? 'pending' : 'completed',
            contentId: source.contentId,
            contentTitle: source.contentTitle,
            buyerLabel: `Lecteur #${4200 + i * 7}`,
            amount: source.amount,
            commission,
            net: source.amount - commission,
            currency: 'XAF',
            paymentMethod: methods[i % methods.length],
            createdAt: new Date(Date.now() - i * 8 * 60 * 60 * 1000).toISOString(),
            anomalyReason: i === 4 ? 'Double débit détecté pour la même session de paiement' : null,
        });
    }
    return items;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
    ...buildPurchases(),
    {
        id: 'txn-payout-1',
        type: 'payout',
        status: 'completed',
        contentId: null,
        contentTitle: null,
        buyerLabel: null,
        amount: 450000,
        commission: 0,
        net: 450000,
        currency: 'XAF',
        paymentMethod: 'mtn_momo',
        createdAt: '2026-07-30T09:00:00.000Z',
        anomalyReason: null,
    },
];

export const MOCK_PAYOUTS: PayoutRequest[] = [
    {
        id: 'pay-001',
        amount: 450000,
        currency: 'XAF',
        status: 'paid',
        requestedAt: '2026-07-28T10:00:00.000Z',
        paidAt: '2026-07-30T09:00:00.000Z',
        destination: 'MTN MoMo •••• 4821',
    },
    {
        id: 'pay-002',
        amount: 284500,
        currency: 'XAF',
        status: 'pending',
        requestedAt: '2026-08-13T08:30:00.000Z',
        paidAt: null,
        destination: 'MTN MoMo •••• 4821',
    },
];
