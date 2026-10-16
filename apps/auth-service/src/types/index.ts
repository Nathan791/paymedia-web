// types/index.ts
export type AppOrigin = 'web_admin' | 'web_editor';

export interface RequestWithOrigin {
    origin: AppOrigin;
    token?: string;
}