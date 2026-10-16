// packages/schemas/src/commerce.ts
import { z } from 'zod';

export const TxTypeEnum = z.enum(['deposit', 'content_purchase', 'refund']);
export const TxStatusEnum = z.enum(['pending', 'completed', 'failed', 'rejected']);

export const TransactionSchema = z.object({
    amount: z.number().positive(),
    type: TxTypeEnum,
    referenceId: z.string().max(100).optional(),
    description: z.string().optional(),
});