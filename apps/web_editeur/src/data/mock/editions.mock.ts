// src/data/mock/editions.mock.ts
import { Edition } from '@/models';

export const MOCK_EDITIONS: Edition[] = [
    {
        id: 'ed-001',
        ulid: '01HZY0001AAAAAAAAAAAAAAAAA',
        title: "Édition spéciale — Numéro d'août 2026",
        description: "Notre sélection des meilleurs contenus du mois : économie, société et podcasts.",
        coverUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
        contentIds: ['cnt-001', 'cnt-002'],
        status: 'published',
        createdAt: '2026-08-01T09:00:00.000Z',
        updatedAt: '2026-08-04T15:30:00.000Z',
        publishedAt: '2026-08-04T15:30:00.000Z',
        authorId: 'usr-marc',
        authorName: 'Marc T. (rédacteur en chef)',
    },
    {
        id: 'ed-002',
        ulid: '01HZY0002BBBBBBBBBBBBBBBBB',
        title: 'Bilan sportif 2025',
        description: 'Le meilleur de la saison sportive rassemblé en une seule édition.',
        coverUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        contentIds: ['cnt-006'],
        status: 'draft',
        createdAt: '2026-08-15T10:00:00.000Z',
        updatedAt: '2026-08-15T10:00:00.000Z',
        publishedAt: null,
        authorId: '34',
        authorName: 'Ney Da Silver',
    },
];
