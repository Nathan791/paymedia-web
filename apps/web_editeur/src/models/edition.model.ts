// src/models/edition.model.ts
//
// Une édition regroupe plusieurs contenus déjà existants (voir Master Prompt
// §18) — ex. "Édition du 21 août 2026" contenant l'Une, Politique, Économie,
// Sport, Culture. Elle a son propre cycle de vie (plus simple que celui d'un
// contenu individuel : pas de révision éditoriale séparée, une édition est
// composée de contenus qui ont déjà chacun été validés).
import { Content } from './content.model';

export type EditionStatus = 'draft' | 'published' | 'archived';

export interface Edition {
    id: string;
    ulid: string;
    title: string;
    description: string;
    coverUrl: string | null;
    contentIds: string[];
    status: EditionStatus;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;
    authorId: string;
    authorName: string;
}

// Une édition "enrichie" avec les contenus résolus — c'est ce que consomment
// les pages, pour éviter à chaque composant de recroiser contentIds avec la
// liste des contenus lui-même.
export interface EditionWithContents extends Edition {
    contents: Content[];
}

export const EDITION_STATUS_LABELS: Record<EditionStatus, string> = {
    draft: 'Brouillon',
    published: 'Publiée',
    archived: 'Archivée',
};

export const EDITION_STATUS_COLORS: Record<EditionStatus, string> = {
    draft: 'gray',
    published: 'forest',
    archived: 'dark',
};

export interface EditionDraftInput {
    title: string;
    description: string;
}
