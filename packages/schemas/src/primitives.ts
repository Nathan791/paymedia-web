import { z } from 'zod'

export { z }

// ─── ULID ─────────────────────────────────────────────────────────────────────

export const UlidSchema = z.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Invalid ULID format')

export const UlidParamSchema = z.object({ id: UlidSchema })

export type UlidParam = z.infer<typeof UlidParamSchema>

// ─── PAGINATION ───────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
    page:  z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type Pagination = z.infer<typeof PaginationSchema>

// ─── ENVELOPPES RÉPONSE ───────────────────────────────────────────────────────

export const ErrorResponseSchema = z.object({
    code:      z.string(),
    message:   z.string(),
    timestamp: z.string().datetime(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export const NonEmptyString  = z.string().trim().min(1)
export const DateTimeString  = z.string().datetime()
export const DecimalString   = z.string().regex(/^\d+(\.\d{1,2})?$/)
export const CurrencyCode    = z.string().length(3).toUpperCase()
export const CountryCode     = z.string().length(2).toUpperCase()
