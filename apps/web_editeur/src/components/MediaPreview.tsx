// src/components/MediaPreview.tsx
//
// Un seul composant pour prévisualiser/lire les 3 formats supportés (epub,
// audio, vidéo — le PDF n'est plus un format PayMedia, voir
// content.model.ts). Une page (détail, création, édition) n'a jamais à
// savoir comment on affiche un epub vs une vidéo — elle passe juste l'asset
// et le type.
import { Box, Center, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBook2, IconHeadphones, IconMovie } from '@tabler/icons-react';
import { ContentAsset, ContentMediaType } from '@/models';

const ICONS: Record<ContentMediaType, any> = {
    epub: IconBook2,
    audio: IconHeadphones,
    video: IconMovie,
};

export function MediaPreview({ mediaType, asset, height = 320 }: { mediaType: ContentMediaType; asset: ContentAsset | null; height?: number }) {
    if (!asset || !asset.fileUrl) {
        const Icon = ICONS[mediaType];
        return (
            <Center
                h={height}
                style={{ borderRadius: 12, border: '1px dashed var(--mantine-color-ink-1)', backgroundColor: 'var(--mantine-color-gray-0)' }}
            >
                <Stack align="center" gap={6}>
                    <ThemeIcon variant="light" color="gray" size={40} radius="xl">
                        <Icon size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed">Aucun fichier pour l'instant</Text>
                </Stack>
            </Center>
        );
    }

    if (mediaType === 'video') {
        return (
            <Box h={height} style={{ borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
                <video src={asset.fileUrl} controls style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
        );
    }

    if (mediaType === 'audio') {
        return (
            <Center h={height} style={{ borderRadius: 12, backgroundColor: 'var(--mantine-color-ink-8)' }}>
                <Stack align="center" gap="md" w="80%">
                    <ThemeIcon size={56} radius="xl" variant="light" color="forest">
                        <IconHeadphones size={28} />
                    </ThemeIcon>
                    <Text c="white" size="sm" fw={500} ta="center">{asset.fileName}</Text>
                    <audio src={asset.fileUrl} controls style={{ width: '100%' }} />
                </Stack>
            </Center>
        );
    }

    // epub : pas de rendu natif dans le navigateur sans librairie dédiée
    // (epub.js) — on affiche une fiche technique claire plutôt que de
    // simuler un rendu qui induirait le lecteur en erreur.
    return (
        <Center h={height} style={{ borderRadius: 12, border: '1px solid var(--mantine-color-gray-2)', backgroundColor: 'var(--mantine-color-gray-0)' }}>
            <Stack align="center" gap={8}>
                <ThemeIcon variant="light" color="forest" size={44} radius="xl">
                    <IconBook2 size={22} />
                </ThemeIcon>
                <Text size="sm" fw={500}>{asset.fileName}</Text>
                <Text size="xs" c="dimmed">
                    {(asset.fileSizeBytes / (1024 * 1024)).toFixed(1)} Mo · Aperçu EPUB disponible dans l'application mobile
                </Text>
            </Stack>
        </Center>
    );
}
