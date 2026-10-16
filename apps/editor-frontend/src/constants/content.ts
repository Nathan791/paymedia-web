import type { ContentStatus, MediaType } from '@/models/content.model';

export const CONTENT_STATUS_LABELS: Record<
    ContentStatus,
    string
> = {
    draft: 'Brouillon',
    pending: 'En attente',
    published: 'Publié',
    blocked: 'Bloqué',
    archived: 'Archivé',
};

export const CONTENT_MEDIA_LABELS: Record<
    MediaType,
    string
> = {
    epub: 'EPUB',
    pdf: 'PDF',
    audio: 'Audio',
    video: 'Vidéo',
};