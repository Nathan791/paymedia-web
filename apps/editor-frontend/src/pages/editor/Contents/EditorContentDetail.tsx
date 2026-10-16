// src/pages/editor/Contents/EditorContentDetail.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    Group,
    Badge,
    Button,
    Stack,
    Loader,
    Alert,
    Box,
    Divider,
    Grid,
    Image,
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconTrash, IconFileText, IconCurrencyFrank, IconPremiumRights } from '@tabler/icons-react';
import { useContentStore } from '@/stores';
import { notifications } from '@mantine/notifications';

export const EditorContentDetail = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    console.log('🔵 EditorContentDetail - ID récupéré:', id);
    const { currentContent, isLoading, error, fetchContent, deleteContent, clearError } =
        useContentStore();

    useEffect(() => {
        if (id) {
            fetchContent(id);
        }
    }, [id]);

    const handleDelete = async () => {
        if (!currentContent) return;
        if (!confirm(`Voulez-vous vraiment supprimer "${currentContent.title}" ?`)) return;

        try {
            //  Utiliser ulid pour la suppression
            await deleteContent(currentContent.ulid || currentContent.id);
            notifications.show({
                title: 'Succès',
                message: 'Contenu supprimé avec succès',
                color: 'green',
            });
            navigate('/editor/contents');
        } catch (error) {
            notifications.show({
                title: 'Erreur',
                message: 'Erreur lors de la suppression',
                color: 'red',
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            publie: { color: 'green', label: 'Publié' },
            bloque: { color: 'red', label: 'Bloqué' },
            archive: { color: 'gray', label: 'Archivé' },
            draft: { color: 'yellow', label: 'Brouillon' },
        };
        const info = statusMap[status] || { color: 'gray', label: status };
        return <Badge color={info.color} size="lg">{info.label}</Badge>;
    };

    const getMediaIcon = (type: string) => {
        const icons: Record<string, { icon: string; label: string }> = {
            epub: { icon: '📖', label: 'EPUB' },
            audio: { icon: '🎵', label: 'Audio' },
            video: { icon: '🎬', label: 'Vidéo' },
        };
        return icons[type] || { icon: '📄', label: 'Inconnu' };
    };

    if (isLoading && !currentContent) {
        return (
            <Container size="lg" py="xl">
                <Loader size="md" />
            </Container>
        );
    }

    if (!currentContent) {
        return (
            <Container size="lg" py="xl">
                <Alert color="red">Contenu non trouvé</Alert>
            </Container>
        );
    }

    const mediaInfo = getMediaIcon(currentContent.mediaType);

    //  Récupérer l'URL de couverture (coverUrl ou coverImage)
    const coverUrl = currentContent.coverUrl || currentContent.coverImage || null;

    return (
        <Container size="lg" py="xl">
            <Paper shadow="sm" p="xl" radius="md">
                <Group mb="lg" justify="space-between">
                    <Group>
                        <Button
                            variant="subtle"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate('/editor/contents')}
                        >
                            Retour
                        </Button>
                        <Title order={2}>Détail du contenu</Title>
                    </Group>
                    <Group>
                        <Button
                            variant="light"
                            color="yellow"
                            leftSection={<IconEdit size={16} />}

                            onClick={() => navigate(`/editor/contents/${currentContent.ulid || currentContent.id}/edit`)}
                        >
                            Modifier
                        </Button>
                        <Button
                            variant="light"
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            onClick={handleDelete}
                        >
                            Supprimer
                        </Button>
                    </Group>
                </Group>

                <Divider mb="xl" />

                {error && (
                    <Alert color="red" mb="md" onClose={clearError} withCloseButton>
                        {error}
                    </Alert>
                )}

                <Grid>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        {coverUrl ? (
                            <Image
                                src={coverUrl}
                                alt={currentContent.title}
                                radius="md"
                                fit="cover"
                                style={{ width: '100%', maxHeight: 400 }}
                            />
                        ) : (
                            <Box
                                style={{
                                    width: '100%',
                                    height: 300,
                                    backgroundColor: '#f1f3f5',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text c="dimmed">Aucune couverture</Text>
                            </Box>
                        )}
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="md">
                            <Group justify="space-between">
                                <Title order={3}>{currentContent.title}</Title>
                                {getStatusBadge(currentContent.status)}
                            </Group>

                            <Group gap="md">
                                <Badge size="lg" variant="light" color="blue">
                                    {mediaInfo.icon} {mediaInfo.label}
                                </Badge>
                                <Badge size="lg" variant="light" color="green">
                                    <IconCurrencyFrank size={14} /> {currentContent.price} XAF
                                </Badge>
                                {currentContent.isPremium && (
                                    <Badge size="lg" variant="light" color="gold">
                                        <IconPremiumRights size={14} /> Premium
                                    </Badge>
                                )}
                                {currentContent.category && (
                                    <Badge size="lg" variant="light" color="grape">
                                        {currentContent.category.name}
                                    </Badge>
                                )}
                            </Group>

                            <Divider />

                            <Text size="sm" c="dimmed" fw={600}>
                                Description
                            </Text>
                            <Text>{currentContent.description || 'Aucune description'}</Text>

                            <Divider />

                            <Grid>
                                <Grid.Col span={6}>
                                    <Text size="xs" c="dimmed">Créé le</Text>
                                    <Text size="sm">
                                        {new Date(currentContent.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Text size="xs" c="dimmed">Dernière modification</Text>
                                    <Text size="sm">
                                        {new Date(currentContent.updatedAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </Text>
                                </Grid.Col>
                            </Grid>

                            <Divider />

                            <Group>
                                <Button
                                    component="a"
                                    href={currentContent.fileUrl}
                                    target="_blank"
                                    variant="outline"
                                    leftSection={<IconFileText size={16} />}
                                >
                                    Voir le fichier
                                </Button>
                            </Group>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Paper>
        </Container>
    );
};