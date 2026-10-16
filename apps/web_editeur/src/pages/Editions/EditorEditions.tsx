// src/pages/Editions/EditorEditions.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Text, Group, Button, SimpleGrid, Card, Badge, Loader, Center,
    Stack, Modal, TextInput, Textarea, Alert, Image, Box, Avatar,
} from '@mantine/core';
import { IconPlus, IconStack3, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useEditionStore } from '@/stores/edition.store';
import { EDITION_STATUS_COLORS, EDITION_STATUS_LABELS } from '@/models';

export function EditorEditions() {
    const navigate = useNavigate();
    const { editions, isLoading, isSaving, error, fetchEditions, createEdition, clearError } = useEditionStore();

    const [createOpen, setCreateOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        fetchEditions();
    }, [fetchEditions]);

    const handleCreate = async () => {
        try {
            await createEdition({ title: title.trim(), description: description.trim() });
            notifications.show({ title: 'Édition créée', message: 'Ajoutez-y maintenant des contenus.', color: 'forest' });
            setCreateOpen(false);
            setTitle(''); setDescription('');
        } catch (e: any) {
            notifications.show({ title: 'Création impossible', message: e.message, color: 'red' });
        }
    };

    if (isLoading && editions.length === 0) {
        return <Container size="xl" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Text size="sm" c="dimmed">
                    {editions.length} édition{editions.length > 1 ? 's' : ''} — regroupez plusieurs contenus en une seule publication
                </Text>
                <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateOpen(true)}>
                    Créer une édition
                </Button>
            </Group>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            {editions.length === 0 ? (
                <Card padding="xl">
                    <Center>
                        <Stack align="center" gap="xs">
                            <IconStack3 size={40} color="var(--mantine-color-gray-4)" />
                            <Text c="dimmed">Aucune édition pour l'instant</Text>
                        </Stack>
                    </Center>
                </Card>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {editions.map((edition) => (
                        <Card key={edition.id} padding={0} style={{ cursor: 'pointer' }} onClick={() => navigate(`/editor/editions/${edition.id}`)}>
                            <Box pos="relative">
                                {edition.coverUrl ? (
                                    <Image src={edition.coverUrl} h={130} fit="cover" />
                                ) : (
                                    <Center h={130} bg="var(--mantine-color-gray-0)">
                                        <Avatar radius="md" size={44} color="forest" variant="light"><IconStack3 size={20} /></Avatar>
                                    </Center>
                                )}
                                <Box pos="absolute" top={10} right={10}>
                                    <Badge color={EDITION_STATUS_COLORS[edition.status]} variant="filled">
                                        {EDITION_STATUS_LABELS[edition.status]}
                                    </Badge>
                                </Box>
                            </Box>
                            <Stack gap={4} p="md">
                                <Text fw={600} size="sm" lineClamp={1}>{edition.title}</Text>
                                <Text size="xs" c="dimmed" lineClamp={2}>{edition.description || 'Aucune description'}</Text>
                                <Text size="xs" c="dimmed" mt={4}>{edition.contents.length} contenu{edition.contents.length > 1 ? 's' : ''}</Text>
                            </Stack>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Créer une édition" centered>
                <Stack>
                    <TextInput label="Titre" placeholder="Ex : Édition du 21 août 2026" required value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea label="Description" minRows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
                    <Text size="xs" c="dimmed">Elle sera créée en brouillon — vous pourrez y ajouter des contenus juste après.</Text>
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setCreateOpen(false)}>Annuler</Button>
                        <Button disabled={!title.trim()} loading={isSaving} onClick={handleCreate}>Créer</Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
