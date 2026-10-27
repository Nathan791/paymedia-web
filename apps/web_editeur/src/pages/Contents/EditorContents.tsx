// src/pages/Contents/EditorContents.tsx
import { useEffect, useMemo, useState, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Text,
    Button,
    Group,
    ActionIcon,
    Menu,
    Loader,
    Alert,
    Stack,
    TextInput,
    SegmentedControl,
    SimpleGrid,
    Card,
    Avatar,
    Divider,
    Center,
    Badge,
    Modal,
    Image,
    Textarea,
    Box,
} from '@mantine/core';
import {
    IconPlus,
    IconEye,
    IconEdit,
    IconDots,
    IconArchive,
    IconSend,
    IconRefresh,
    IconSearch,
    IconBook2,
    IconHeadphones,
    IconMovie,
    IconAlertCircle,
    IconFiles,
    IconTrash,
    IconCheck,
    IconX,
    IconRestore,
    IconCalendarEvent,
} from '@tabler/icons-react';
import { useContentStore } from '@/stores/content.store';
import { useAuthStore } from '@/stores/auth.store';
import { notifications } from '@mantine/notifications';
import { Content, ContentMediaType, ROLE_PERMISSIONS } from '@/models';
import { StatusBadge } from '@/components/StatusBadge';

const MEDIA_ICON: Record<ContentMediaType, ReactElement> = {
    epub: <IconBook2 size={18} />,
    audio: <IconHeadphones size={18} />,
    video: <IconMovie size={18} />,
};

const FILTERS: { value: string; label: string }[] = [
    { value: 'all', label: 'Tous' },
    { value: 'draft', label: 'mes Brouillons' },
    { value: 'pending_review', label: 'En révision' },
    { value: 'correction_requested', label: 'À corriger' },
    { value: 'approved', label: 'Approuvés' },
    { value: 'scheduled', label: 'Programmés' },
    { value: 'published', label: 'Publiés' },
    { value: 'archived', label: 'Archivés' },
];

const formatPrice = (content: Content) =>
    !content.isPremium || content.price === 0 ? 'Gratuit' : `${content.price.toLocaleString('fr-FR')} ${content.currency}`;

export function EditorContents() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const permissions = ROLE_PERMISSIONS[user?.role ?? 'editor'];

    const {
        contents, isLoading, error,
        fetchContents, deleteContent, clearError,
    } = useContentStore();

    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Content | null>(null);
    const [correctionTarget, setCorrectionTarget] = useState<Content | null>(null);
    const [correctionComment, setCorrectionComment] = useState('');

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    const handleRefresh = () => {
        fetchContents();
        notifications.show({ message: 'Liste mise à jour', color: 'forest' });
    };

    const run = async (id: string, title: string, action: () => Promise<void>, successMessage: string) => {
        setBusyId(id);
        try {
            await action();
            notifications.show({ title: successMessage, message: `« ${title} »`, color: 'forest' });
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message || 'Une erreur est survenue', color: 'red' });
        } finally {
            setBusyId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setBusyId(deleteTarget.id);
        try {
            await deleteContent(deleteTarget.id);
            notifications.show({ title: 'Contenu supprimé', message: `« ${deleteTarget.title} » a été supprimé.`, color: 'gray' });
            setDeleteTarget(null);
        } catch (e: any) {
            notifications.show({ title: 'Suppression impossible', message: e.message, color: 'red' });
        } finally {
            setBusyId(null);
        }
    };

    const handleRequestCorrection = async () => {
        if (!correctionTarget || !correctionComment.trim()) return;
        setBusyId(correctionTarget.id);
        try {
            notifications.show({ title: 'Fonction non disponible', message: 'Le backend ne propose pas encore la demande de correction.', color: 'orange' });
            setCorrectionTarget(null);
            setCorrectionComment('');
            fetchContents();
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        } finally {
            setBusyId(null);
        }
    };

    const filtered = useMemo(() => {
        return contents.filter((c) => {
            const matchStatus = filter === 'all' || c.status === filter;
            const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
            return matchStatus && matchSearch;
        });
    }, [contents, filter, search]);

    const counts = useMemo(() => {
        const base: Record<string, number> = { all: contents.length };
        contents.forEach((c) => { base[c.status] = (base[c.status] || 0) + 1; });
        return base;
    }, [contents]);

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" align="flex-end" mb="lg">
                <Text size="sm" c="dimmed">{contents.length} contenu{contents.length > 1 ? 's' : ''} au total</Text>
                <Group>
                    <Button variant="default" leftSection={<IconRefresh size={16} />} onClick={handleRefresh} loading={isLoading}>
                        Rafraîchir
                    </Button>
                    {permissions.canCreateContent && (
                        <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/editor/contents/create')}>
                            Nouveau contenu
                        </Button>
                    )}
                </Group>
            </Group>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            <Paper radius="lg" p="md" mb="lg">
                <Group justify="space-between" wrap="wrap" gap="md">
                    <SegmentedControl
                        value={filter}
                        onChange={setFilter}
                        data={FILTERS.map((f) => ({
                            value: f.value,
                            label: (
                                <Group gap={6} wrap="nowrap">
                                    <span>{f.label}</span>
                                    <Badge size="xs" variant="light" color="gray">{counts[f.value] ?? 0}</Badge>
                                </Group>
                            ),
                        }))}
                    />
                    <TextInput
                        placeholder="Rechercher un titre..."
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.currentTarget.value)}
                        w={260}
                    />
                </Group>
            </Paper>

            {isLoading && contents.length === 0 ? (
                <Center py="xl"><Loader color="forest" /></Center>
            ) : filtered.length === 0 ? (
                <Paper radius="lg" py="xl">
                    <Center>
                        <Stack align="center" gap="xs">
                            <IconFiles size={40} color="var(--mantine-color-gray-4)" />
                            <Text c="dimmed">Aucun contenu ne correspond à ces critères</Text>
                            {filter === 'all' && !search && permissions.canCreateContent && (
                                <Button variant="subtle" onClick={() => navigate('/editor/contents/create')}>
                                    Créer votre premier contenu
                                </Button>
                            )}
                        </Stack>
                    </Center>
                </Paper>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {filtered.map((content) => {
                        const isOwn = content.authorId === user?.id;
                        const canEditThis = (isOwn && permissions.canEditOwnContent) || permissions.canEditAnyContent;

                        const canSubmit = content.status === 'draft' && canEditThis;
                        const canResubmit = content.status === 'correction_requested' && canEditThis;
                        const canReview = content.status === 'pending_review' && permissions.canReview;
                        const canPublishNow = content.status === 'approved' && permissions.canPublish;
                        const canArchive = (content.status === 'published' || content.status === 'scheduled') && canEditThis;
                        const canRestore = content.status === 'archived' && canEditThis;
                        const canEdit = ['draft', 'correction_requested', 'published'].includes(content.status) && canEditThis;
                        const canDelete = ['draft', 'correction_requested', 'archived'].includes(content.status) && canEditThis;

                        return (
                            <Card key={content.id} padding={0}>
                                <Box pos="relative">
                                    <ContentCover content={content} />
                                    <Box pos="absolute" top={10} right={10}>
                                        <StatusBadge status={content.status} />
                                    </Box>
                                </Box>

                                <Stack gap="xs" p="md">
                                    <Text fw={600} size="sm" lineClamp={2}>{content.title}</Text>
                                    <Text size="xs" c="dimmed">
                                        {content.category?.name || 'Non catégorisé'} · Créé le {new Date(content.createdAt).toLocaleDateString('fr-FR')}
                                    </Text>

                                    {content.status === 'correction_requested' && content.correctionComment && (
                                        <Alert color="red" p="xs" radius="md">
                                            <Text size="xs" lineClamp={2}>{content.correctionComment}</Text>
                                        </Alert>
                                    )}
                                    {content.status === 'scheduled' && content.scheduledAt && (
                                        <Group gap={4}>
                                            <IconCalendarEvent size={13} color="var(--mantine-color-blue-6)" />
                                            <Text size="xs" c="blue">
                                                Publication le {new Date(content.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                            </Text>
                                        </Group>
                                    )}

                                    <Divider my={2} />

                                    <Group justify="space-between" align="center">
                                        <Text fw={700} size="sm">{formatPrice(content)}</Text>
                                        <Group gap={4}>
                                            <ActionIcon variant="subtle" color="gray" onClick={() => navigate(`/editor/contents/${content.id}`)}>
                                                <IconEye size={16} />
                                            </ActionIcon>
                                            <ActionIcon
                                                variant="subtle" color="gray" disabled={!canEdit}
                                                onClick={() => navigate(`/editor/contents/${content.id}/edit`)}
                                            >
                                                <IconEdit size={16} />
                                            </ActionIcon>
                                            <Menu position="bottom-end" withArrow>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray" loading={busyId === content.id}>
                                                        <IconDots size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    {canSubmit && (
                                                        <Menu.Item
                                                            leftSection={<IconSend size={14} />}
                                                            onClick={() => run(content.id, content.title, async () => { throw new Error('Le backend ne propose pas encore la soumission en révision.'); }, 'Envoyé en révision')}
                                                        >
                                                            Soumettre à la révision
                                                        </Menu.Item>
                                                    )}
                                                    {canResubmit && (
                                                        <Menu.Item
                                                            leftSection={<IconSend size={14} />}
                                                            onClick={() => run(content.id, content.title, async () => { throw new Error('Le backend ne propose pas encore la resoumission en révision.'); }, 'Resoumis à la révision')}
                                                        >
                                                            Resoumettre après correction
                                                        </Menu.Item>
                                                    )}
                                                    {canReview && (
                                                        <>
                                                            <Menu.Divider />
                                                            <Menu.Label>Révision éditoriale</Menu.Label>
                                                            <Menu.Item
                                                                leftSection={<IconCheck size={14} />} color="forest"
                                                                onClick={() => run(content.id, content.title, async () => { throw new Error('Le backend ne propose pas encore l’approbation.'); }, 'Approuvé')}
                                                            >
                                                                Approuver
                                                            </Menu.Item>
                                                            <Menu.Item
                                                                leftSection={<IconX size={14} />} color="red"
                                                                onClick={() => setCorrectionTarget(content)}
                                                            >
                                                                Demander une correction
                                                            </Menu.Item>
                                                        </>
                                                    )}
                                                    {canPublishNow && (
                                                        <Menu.Item
                                                            leftSection={<IconSend size={14} />} color="forest"
                                                            onClick={() => run(content.id, content.title, async () => { throw new Error('Le backend ne propose pas encore la publication.'); }, 'Publié')}
                                                        >
                                                            Publier maintenant
                                                        </Menu.Item>
                                                    )}
                                                    {canPublishNow && (
                                                        <Menu.Item
                                                            leftSection={<IconCalendarEvent size={14} />}
                                                            onClick={() => navigate(`/editor/contents/${content.id}`)}
                                                        >
                                                            Programmer la publication
                                                        </Menu.Item>
                                                    )}
                                                    {canArchive && (
                                                        <Menu.Item
                                                            leftSection={<IconArchive size={14} />}
                                                            onClick={() => run(content.id, content.title, async () => { throw new Error('Le backend ne propose pas encore l’archivage.'); }, 'Archivé')}
                                                        >
                                                            Archiver
                                                        </Menu.Item>
                                                    )}
                                                    {canRestore && (
                                                        <Menu.Item
                                                            leftSection={<IconRestore size={14} />}
                                                            onClick={() => run(content.id, content.title, async () => { throw new Error('Le backend ne propose pas encore la restauration.'); }, 'Restauré en brouillon')}
                                                        >
                                                            Restaurer en brouillon
                                                        </Menu.Item>
                                                    )}
                                                    {canDelete && (
                                                        <>
                                                            <Menu.Divider />
                                                            <Menu.Item leftSection={<IconTrash size={14} />} color="red" onClick={() => setDeleteTarget(content)}>
                                                                Supprimer
                                                            </Menu.Item>
                                                        </>
                                                    )}
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Group>
                                </Stack>
                            </Card>
                        );
                    })}
                </SimpleGrid>
            )}

            <Modal opened={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Supprimer ce contenu ?" centered>
                <Stack>
                    <Text size="sm">
                        « {deleteTarget?.title} » sera définitivement supprimé. Cette action est irréversible.
                    </Text>
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setDeleteTarget(null)}>Annuler</Button>
                        <Button color="red" loading={busyId === deleteTarget?.id} onClick={handleDelete}>Supprimer définitivement</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={!!correctionTarget} onClose={() => setCorrectionTarget(null)} title="Demander une correction" centered>
                <Stack>
                    <Text size="sm">
                        « {correctionTarget?.title} » sera renvoyé à son auteur avec votre commentaire.
                    </Text>
                    <Textarea
                        label="Commentaire" placeholder="Expliquez précisément ce qui doit être corrigé..."
                        minRows={3} required value={correctionComment}
                        onChange={(e) => setCorrectionComment(e.target.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setCorrectionTarget(null)}>Annuler</Button>
                        <Button color="red" disabled={!correctionComment.trim()} loading={busyId === correctionTarget?.id} onClick={handleRequestCorrection}>
                            Envoyer la demande
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}

function ContentCover({ content }: { content: Content }) {
    if (content.coverUrl) {
        return <Image src={content.coverUrl} h={140} fit="cover" />;
    }
    return (
        <Center h={140} bg="var(--mantine-color-gray-0)">
            <Avatar radius="md" size={44} color="forest" variant="light">
                {MEDIA_ICON[content.mediaType]}
            </Avatar>
        </Center>
    );
}