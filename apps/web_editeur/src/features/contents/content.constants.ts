import { ContentMediaType } from '@/models';

export interface MediaTypeConfig {
    value: ContentMediaType;
    label: string;
    icon: string;
    accept: string[];
    maxSizeMb: number;
}

export const CONTENT_MEDIA_TYPES: MediaTypeConfig[] = [
    {
        value: 'pdf',
        label: 'PDF',
        icon: 'file-pdf',
        accept: ['application/pdf'],
        maxSizeMb: 50
    },
    {
        value: 'audio',
        label: 'Audio',
        icon: 'headphones',
        accept: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        maxSizeMb: 100
    },
    {
        value: 'video',
        label: 'Vidéo',
        icon: 'movie',
        accept: ['video/mp4', 'video/webm'],
        maxSizeMb: 200
    },
    {
        value: 'epub',
        label: 'E-book',
        icon: 'book',
        accept: ['application/epub+zip'],
        maxSizeMb: 25
    }
];