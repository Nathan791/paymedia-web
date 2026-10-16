// src/pages/Editions/EditorEditionDetail.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Text, Group, Button, Stack, Loader, Center, Alert, Badge,
    Paper, Title, SimpleGrid, Card, ActionIcon, Select, Box, Avatar,
} from '@mantine/core';
import {
    IconArrowLeft, IconAlertCircle, IconTrash, IconSend, IconArchive,
    IconRestore, IconBook2, IconHeadphones, IconMovie, IconPlus,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEditionStore } from '@/stores/edition.store';
import { useContentStore } from '@/stores/content.store';
import { EDITION_STATUS_COLORS, EDITION_STATUS_LABELS, ContentMediaType } from '@/models';

const MEDIA_ICON: Record<ContentMediaType, any> = {
    epub: IconBook2,
    audio: IconHeadphones,
    video: IconMovie,
};

export function EditorEditionDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { currentEdition, isLoading, isSaving, error, fetchEdition, addContent, removeContent, publish, archive, restore, clearError } = useEditionStore();
    const { contents, fetchContents } = useContentStore();

    const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

    useEffect(() => {
        if (id) fetchEdition(id);
        fetchContents('published'); // seuls des contenus publiés intègrent une édition
        return () => clearError();
    }, [id]);

    const run = async (action: () => Promise<void>, successTitle: string) => {
        try {
            await action();
            notifications.show({ title: successTitle, message: 'Action effectuée avec succès.', color: 'forest' });
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        }
    };

    if (isLoading && !currentEdition) {
        return <Container size="lg" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }
    if (!currentEdition) {
        return <Container size="lg" py="xl">{error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}</Container>;
    }

    const e = currentEdition;
    const availableContents = contents.filter((c) => c.status === 'published' && !e.contentIds.includes(c.id));

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="lg" wrap="wrap">
                <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/editor/editions')}>
                    Retour
                </Button>
                <Group>
                    {e.status === 'draft' && (
                        <Button color="forest" leftSection={<IconSend size={16} />} loading={isSaving} onClick={() => run(() => publish(e.id), 'Édition publiée')}>
                            Publier l'édition
                        </Button>
                    )}
                    {e.status === 'published' && (
                        <Button variant="subtle" color="dark" leftSection={<IconArchive size={16} />} loading={isSaving} onClick={() => run(() => archive(e.id), 'Archivée')}>
                            Archiver
                        </Button>
                    )}
                    {e.status === 'archived' && (
                        <Button variant="subtle" leftSection={<IconRestore size={16} />} loading={isSaving} onClick={() => run(() => restore(e.id), 'Restaurée en brouillon')}>
                            Restaurer
                        </Button>
                    )}
                </Group>
            </Group>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            <Paper radius="lg" p="xl" mb="lg">
                <Group justify="space-between" mb="md">
                    <Box>
                        <Title order={3} style={{ fontFamily: 'Fraunces, serif' }} fw={600}>{e.title}</Title>
                        <Text size="sm" c="dimmed">{e.authorName}</Text>
                    </Box>
                    <Badge color={EDITION_STATUS_COLORS[e.status]} variant="light" size="lg">
                        {EDITION_STATUS_LABELS[e.status]}
                    </Badge>
                </Group>
                <Text size="sm" c={e.description ? undefined : 'dimmed'}>{e.description || 'Aucune description.'}</Text>
            </Paper>

            {e.status === 'draft' && (
                <Paper radius="lg" p="xl" mb="lg">
                    <Text fw={600} size="sm" mb="sm">Ajouter un contenu</Text>
                    <Group>
                        <Select
                            placeholder="Choisir un contenu publié" style={{ flex: 1 }}
                            data={availableContents.map((c) => ({ value: c.id, label: c.title }))}
                            value={selectedContentId} onChange={setSelectedContentId} searchable
                            nothingFoundMessage="Aucun contenu publié disponible"
                        />
                        <Button
                            leftSection={<IconPlus size={16} />} disabled={!selectedContentId} loading={isSaving}
                            onClick={() => {
                                if (selectedContentId) {
                                    run(() => addContent(e.id, selectedContentId), 'Contenu ajouté');
                                    setSelectedContentId(null);
                                }
                            }}
                        >
                            Ajouter
                        </Button>
                    </Group>
                </Paper>
            )}

            <Paper radius="lg" p="xl">
                <Text fw={600} size="sm" mb="md">Contenus de l'édition ({e.contents.length})</Text>
                {e.contents.length === 0 ? (
                    <Text size="sm" c="dimmed">Aucun contenu pour l'instant.</Text>
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        {e.contents.map((content) => {
                            const Icon = MEDIA_ICON[content.mediaType];
                            return (
                                <Card key={content.id} padding="sm">
                                    <Group justify="space-between" wrap="nowrap">
                                        <Group gap="sm" wrap="nowrap">
                                            <Avatar radius="md" color="forest" variant="light" size="sm"><Icon size={16} /></Avatar>
                                            <Box>
                                                <Text size="sm" fw={500} lineClamp={1} maw={220}>{content.title}</Text>
                                                <Text size="xs" c="dimmed">{content.category?.name || 'Non catégorisé'}</Text>
                                            </Box>
                                        </Group>
                                        {e.status === 'draft' && (
                                            <ActionIcon
                                                variant="subtle" color="red"
                                                onClick={() => run(() => removeContent(e.id, content.id), 'Contenu retiré')}
                                            >
                                                <IconTrash size={14} />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                )}
            </Paper>
        </Container>
    );
}
