import { ContentMediaType } from '@/models';

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateContentFile(file: File, mediaType: ContentMediaType): ValidationResult {
    const acceptedTypes: Record<ContentMediaType, string[]> = {
        'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg'],
        'video': ['video/mp4', 'video/webm'],
        'epub': ['application/epub+zip'],
       // 'image': ['image/jpeg', 'image/png', 'image/webp']
    };

    const maxSizes: Record<ContentMediaType, number> = {
        'audio': 100,
        'video': 200,
        'epub': 25,
       // 'image': 20
    };

    if (!acceptedTypes[mediaType]?.includes(file.type)) {
        return {
            valid: false,
            message: `Format invalide. Types acceptés : ${acceptedTypes[mediaType]?.map(t => t.split('/')[1]?.toUpperCase()).join(', ') || 'Non défini'}`
        };
    }

    const maxSizeBytes = (maxSizes[mediaType] || 50) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            message: `Fichier trop volumineux. Taille maximale : ${maxSizes[mediaType] || 50} Mo`
        };
    }

    return { valid: true };
}

export function validateCoverFile(file: File): ValidationResult {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            message: 'Format invalide. Utilisez JPG, PNG ou WebP.'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            message: 'Image trop volumineuse. Taille maximale : 10 Mo'
        };
    }

    return { valid: true };
}