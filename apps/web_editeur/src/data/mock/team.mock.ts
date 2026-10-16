// src/data/mock/team.mock.ts
import { TeamMember } from '@/models';

export const MOCK_TEAM_MEMBERS: TeamMember[] = [
    {
        id: '34',
        name: 'Ney Da Silver',
        email: 'ney@paymedia.com',
        role: 'journalist',
        status: 'active',
        joinedAt: '2025-02-14T00:00:00.000Z',
    },
    {
        id: 'usr-marc',
        name: 'Marc T.',
        email: 'marc@leregardcameroun.cm',
        role: 'editor_in_chief',
        status: 'active',
        joinedAt: '2024-11-02T00:00:00.000Z',
    },
    {
        id: 'usr-paul',
        name: 'Paul K.',
        email: 'paul@leregardcameroun.cm',
        role: 'media_admin',
        status: 'active',
        joinedAt: '2024-09-18T00:00:00.000Z',
    },
    {
        id: 'usr-linda',
        name: 'Linda M.',
        email: 'linda@leregardcameroun.cm',
        role: 'finance',
        status: 'active',
        joinedAt: '2025-01-10T00:00:00.000Z',
    },
    {
        id: 'usr-jean',
        name: 'Jean M.',
        email: 'jean@leregardcameroun.cm',
        role: 'journalist',
        status: 'invited',
        joinedAt: '2026-08-18T00:00:00.000Z',
    },
];
