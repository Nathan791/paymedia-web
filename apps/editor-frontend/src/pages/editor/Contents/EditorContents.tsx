import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Table,
    Button,
    Group,
    Badge,
    Text,
    ActionIcon,
    Menu,
    Loader,
    Alert,
    Box,
    Tooltip,
    Stack,
} from '@mantine/core';
import {
    IconPlus,
    IconEye,
    IconEdit,
    IconTrash,
    IconDots,
    IconArchive,
    IconLock,
    IconCheck,
    IconRefresh,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useContentStore } from '@/stores';

export const EditorContents = () => {
    const navigate = useNavigate();

    const {
        contents,
        isLoading,
        error,
        fetchContents,
        deleteContent,
        changeStatus,
        clearError,
    } = useContentStore();

    const [loadingAction, setLoadingAction] =
        useState<string | null>(null);

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const handleRefresh = async () => {
        await fetchContents();

        notifications.show({
            title: 'Rafraîchissement',
            message:
                'La liste des contenus a été mise à jour',
        });
    };

    const handleDelete = async (
        ulid: string,
        title: string
    ) => {
        if (
            !window.confirm(
                `Voulez-vous vraiment supprimer "${title}" ?`
            )
        ) {
            return;
        }

        setLoadingAction(ulid);

        try {
            await deleteContent(ulid);

            notifications.show({
                title: 'Succès',
                message:
                    'Contenu supprimé avec succès',
            });
        } catch {
            notifications.show({
                title: 'Erreur',
                message:
                    'Erreur lors de la suppression',
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleStatusChange = async (
        ulid: string,
        status: string
    ) => {
        setLoadingAction(ulid);

        try {
            await changeStatus(
                ulid,
                status
            );

            notifications.show({
                title: 'Succès',
                message:
                    `Statut changé en ${status}`,
            });
        } catch {
            notifications.show({
                title: 'Erreur',
                message:
                    'Erreur lors du changement de statut',
            });
        } finally {
            setLoadingAction(null);
        }
    };

    const getStatusBadge = (
        status: string
    ) => {
        const statusMap: Record<
            string,
            {
                label: string;
            }
        > = {
            publie: {
                label: 'Publié',
            },
            published: {
                label: 'Publié',
            },
            bloque: {
                label: 'Bloqué',
            },
            archive: {
                label: 'Archivé',
            },
            draft: {
                label: 'Brouillon',
            },
        };

        const info =
            statusMap[status] ?? {
                label: status,
            };

        return (
            <Badge>
                {info.label}
            </Badge>
        );
    };

    const getMediaIcon = (
        type: string
    ) => {
        const icons: Record<
            string,
            string
        > = {
            epub: 'EPUB',
            audio: 'Audio',
            video: 'Vidéo',
        };

        return (
            icons[type] ?? type
        );
    };

    const contentsArray =
        Array.isArray(contents)
            ? contents
            : [];

    return (
        <Container
            size="xl"
            py="xl"
        >
            <Paper
                shadow="sm"
                p="xl"
                radius="md"
            >
                <Group
                    justify="space-between"
                    mb="lg"
                >
                    <Stack gap={0}>
                        <Title order={2}>
                            Mes contenus
                        </Title>

                        <Text
                            size="sm"
                            c="dimmed"
                        >
                            {contentsArray.length}{' '}
                            contenu(s) au total
                        </Text>
                    </Stack>

                    <Group>
                        <Button
                            variant="light"
                            leftSection={
                                <IconRefresh
                                    size={16}
                                />
                            }
                            onClick={
                                handleRefresh
                            }
                            loading={isLoading}
                        >
                            Rafraîchir
                        </Button>

                        <Button
                            leftSection={
                                <IconPlus
                                    size={16}
                                />
                            }
                            onClick={() =>
                                navigate(
                                    '/editor/contents/create'
                                )
                            }
                        >
                            Nouveau contenu
                        </Button>
                    </Group>
                </Group>

                {error && (
                    <Alert
                        color="red"
                        title="Erreur"
                        mb="md"
                        onClose={clearError}
                        withCloseButton
                    >
                        {error}
                    </Alert>
                )}

                {isLoading &&
                contentsArray.length === 0 ? (
                    <Loader />
                ) : contentsArray.length ===
                0 ? (
                    <Box
                        py="xl"
                        ta="center"
                    >
                        <Text
                            size="lg"
                            c="dimmed"
                            mb="md"
                        >
                            Aucun contenu trouvé
                        </Text>

                        <Button
                            variant="subtle"
                            onClick={() =>
                                navigate(
                                    '/editor/contents/create'
                                )
                            }
                        >
                            Créer votre premier
                            contenu
                        </Button>
                    </Box>
                ) : (
                    <Table
                        striped
                        highlightOnHover
                    >
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>
                                    Type
                                </Table.Th>
                                <Table.Th>
                                    Titre
                                </Table.Th>
                                <Table.Th>
                                    Catégorie
                                </Table.Th>
                                <Table.Th>
                                    Prix
                                </Table.Th>
                                <Table.Th>
                                    Statut
                                </Table.Th>
                                <Table.Th>
                                    Créé le
                                </Table.Th>
                                <Table.Th>
                                    Actions
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>

                        <Table.Tbody>
                            {contentsArray.map(
                                (content) => (
                                    <Table.Tr
                                        key={
                                            content.ulid
                                        }
                                    >
                                        <Table.Td>
                                            <Text
                                                size="sm"
                                            >
                                                {getMediaIcon(
                                                    content.mediaType
                                                )}
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            <Text
                                                fw={500}
                                                size="sm"
                                                lineClamp={
                                                    1
                                                }
                                            >
                                                {
                                                    content.title
                                                }
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            <Text
                                                size="sm"
                                            >
                                                {content
                                                        .category
                                                        ?.name ??
                                                    'Non catégorisé'}
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            <Text fw={600}>
                                                {content.price ===
                                                0
                                                    ? 'Gratuit'
                                                    : `${content.price} XAF`}
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            {getStatusBadge(
                                                content.status
                                            )}
                                        </Table.Td>

                                        <Table.Td>
                                            <Text size="sm">
                                                {new Date(
                                                    content.createdAt
                                                ).toLocaleDateString(
                                                    'fr-FR'
                                                )}
                                            </Text>
                                        </Table.Td>

                                        <Table.Td>
                                            <Group
                                                justify="center"
                                                gap="xs"
                                            >
                                                <Tooltip label="Voir les détails">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        onClick={() =>
                                                            navigate(
                                                                `/editor/contents/${content.ulid}`
                                                            )
                                                        }
                                                    >
                                                        <IconEye
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>

                                                <Tooltip label="Modifier">
                                                    <ActionIcon
                                                        variant="subtle"
                                                        onClick={() =>
                                                            navigate(
                                                                `/editor/contents/${content.ulid}/edit`
                                                            )
                                                        }
                                                    >
                                                        <IconEdit
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    </ActionIcon>
                                                </Tooltip>

                                                <Menu
                                                    position="bottom-end"
                                                    withArrow
                                                >
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle">
                                                            <IconDots
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </ActionIcon>
                                                    </Menu.Target>

                                                    <Menu.Dropdown>
                                                        {content.status !==
                                                            'publie' &&
                                                            content.status !==
                                                            'published' && (
                                                                <Menu.Item
                                                                    leftSection={
                                                                        <IconCheck
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            content.ulid,
                                                                            'publie'
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loadingAction ===
                                                                        content.ulid
                                                                    }
                                                                >
                                                                    Publier
                                                                </Menu.Item>
                                                            )}

                                                        {content.status !==
                                                            'bloque' && (
                                                                <Menu.Item
                                                                    leftSection={
                                                                        <IconLock
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            content.ulid,
                                                                            'bloque'
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loadingAction ===
                                                                        content.ulid
                                                                    }
                                                                >
                                                                    Bloquer
                                                                </Menu.Item>
                                                            )}

                                                        {content.status !==
                                                            'archive' && (
                                                                <Menu.Item
                                                                    leftSection={
                                                                        <IconArchive
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    }
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            content.ulid,
                                                                            'archive'
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loadingAction ===
                                                                        content.ulid
                                                                    }
                                                                >
                                                                    Archiver
                                                                </Menu.Item>
                                                            )}

                                                        <Menu.Divider />

                                                        <Menu.Item
                                                            color="red"
                                                            leftSection={
                                                                <IconTrash
                                                                    size={
                                                                        14
                                                                    }
                                                                />
                                                            }
                                                            onClick={() =>
                                                                handleDelete(
                                                                    content.ulid,
                                                                    content.title
                                                                )
                                                            }
                                                            disabled={
                                                                loadingAction ===
                                                                content.ulid
                                                            }
                                                        >
                                                            Supprimer
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                )
                            )}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>
        </Container>
    );
};