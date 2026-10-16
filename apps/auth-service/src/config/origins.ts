// config/origins.ts
import { AppOrigin } from '../types';

export const ORIGIN_MAPPING: Record<string, AppOrigin> = {
    'web_admin': 'web_admin',
    'web_editor': 'web_editor',
};

export const DEFAULT_ORIGIN: AppOrigin = 'web_admin';

export const detectOrigin = (headerValue?: string): AppOrigin => {
    if (!headerValue) return DEFAULT_ORIGIN;
    return ORIGIN_MAPPING[headerValue] || DEFAULT_ORIGIN;
};