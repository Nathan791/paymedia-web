import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Table,
    Badge,
    Button,
    Group,
    TextInput,
    LoadingOverlay,
    Box,
    Card,
    Select,
    Pagination,
    Modal,
    Stack,
    NumberInput,
    ActionIcon,
    Menu,
    Alert,
    Textarea,
} from '@mantine/core';
import {
    IconSearch,
    IconRefresh,
    IconPlus,
    IconEdit,
    IconTrash,
    IconDotsVertical,
    IconFileText,
    IconCurrencyFrank,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { contentApi } from '../../api/content.api';
import type { Content } from '../../types';

export default function Contents() {
    // États pour les données
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const navigate = useNavigate();

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // États pour les modales
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [editingContent, setEditingContent] = useState<Content | null>(null);
    const [deletingContentId, setDeletingContentId] = useState<number | null>(null);

    // États pour le formulaire
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        mediaType: 'epub',
        status: 'draft',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Récupère la liste des contenus
    const fetchContents = async () => {
        try {
            setLoading(true);
            const response = await contentApi.getAll();

            console.log(' Réponse brute des contenus:', response);
            console.log(' Data:', response.data);
            console.log(' Data.data:', response.data.data);

            //  Extraction du tableau quel que soit le format
            let contentsData = [];

            // Format 1: { data: [...] }
            if (Array.isArray(response.data.data)) {
                contentsData = response.data.data;
            }
            else if (response.data.data?.items && Array.isArray(response.data.data.items)) {
                contentsData = response.data.data.items;
            }

            else if (response.data.data?.content && Array.isArray(response.data.data.content)) {
                contentsData = response.data.data.content;
            }
            else if (response.data.data?.results && Array.isArray(response.data.data.results)) {
                contentsData = response.data.data.results;
            }
            else if (Array.isArray(response.data)) {
                contentsData = response.data;
            }

            else if (response.data?.success && Array.isArray(response.data.data)) {
                contentsData = response.data.data;
            }

            else {
                // Chercher la première propriété qui est un tableau
                for (const key in response.data.data) {
                    if (Array.isArray(response.data.data[key])) {
                        contentsData = response.data.data[key];
                        break;
                    }
                }
            }

            console.log(' Tableau extrait:', contentsData);

            setContents(contentsData);
        } catch (error) {
            console.error(' Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    // Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    // ============================================================
    // ACTIONS CRUD
    // ============================================================

    const handleOpenAdd = () => {
        setEditingContent(null);
        setFormData({ title: '', description: '', price: 0, mediaType: 'epub', status: 'draft' });
        setFormError('');
        openModal();
    };

    const handleOpenEdit = (content: Content) => {
        setEditingContent(content);
        setFormData({
            title: content.title,
            description: content.description || '',
            price: content.price,
            mediaType: content.mediaType,
            status: content.status,
        });
        setFormError('');
        openModal();
    };

    const handleSubmitForm = async () => {
        if (!formData.title) {
            setFormError('Le titre est requis');
            return;
        }

        try {
            setFormLoading(true);
            setFormError('');

            if (editingContent) {
                await contentApi.update(editingContent.id, {
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    mediaType: formData.mediaType,
                    status: formData.status,
                });
            } else {
                await contentApi.create({
                    title: formData.title,
                    description: formData.description,
                    price: formData.price,
                    mediaType: formData.mediaType,
                    status: formData.status,
                });
            }

            await fetchContents();
            closeModal();
        } catch (error: any) {
            setFormError(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        } finally {
            setFormLoading(false);
        }
    };

    const handleOpenDelete = (id: number) => {
        setDeletingContentId(id);
        openDeleteModal();
    };

    const handleConfirmDelete = async () => {
        if (!deletingContentId) return;

        try {
            await contentApi.delete(deletingContentId);
            await fetchContents();
            closeDeleteModal();
            setDeletingContentId(null);
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Approuver ce contenu ?')) return;
        try {
            await contentApi.approve(id);
            await fetchContents();
        } catch (error) {
            alert('Erreur lors de l\'approbation');
        }
    };

    const handleBlock = async (id: number) => {
        if (!confirm('Bloquer ce contenu ?')) return;
        try {
            await contentApi.block(id);
            await fetchContents();
        } catch (error) {
            alert('Erreur lors du blocage');
        }
    };

    const handleUnblock = async (id: number) => {
        if (!confirm('Débloquer ce contenu ?')) return;
        try {
            await contentApi.unblock(id);
            await fetchContents();
        } catch (error) {
            alert('Erreur lors du déblocage');
        }
    };

    const handleArchive = async (id: number) => {
        if (!confirm('Archiver ce contenu ?')) return;
        try {
            await contentApi.archive(id);
            await fetchContents();
        } catch (error) {
            alert('Erreur lors de l\'archivage');
        }
    };

    // ============================================================
    // FILTRAGE ET PAGINATION
    // ============================================================

    const filteredContents = contents.filter((content) => {
        const matchSearch =
            content.title.toLowerCase().includes(search.toLowerCase()) ||
            content.author?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter ? content.status === statusFilter : true;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filteredContents.length / itemsPerPage);
    const paginatedContents = filteredContents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ============================================================
    // UTILITAIRES
    // ============================================================

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
            draft: { color: 'gray', label: 'Brouillon' },
            pending: { color: 'yellow', label: 'En attente' },
            published: { color: 'green', label: 'Publié' },
            blocked: { color: 'red', label: 'Bloqué' },
            archived: { color: 'blue', label: 'Archivé' },
        };
        const { color, label } = config[status] || { color: 'gray', label: status };
        return <Badge color={color}>{label}</Badge>;
    };

    const getMediaTypeOptions = () => [
        { value: 'epub', label: ' ePub' },
        { value: 'audio', label: ' Audio' },
        { value: 'video', label: ' Vidéo' },
        { value: 'pdf', label: ' PDF' },
    ];

    const getStatusOptions = () => [
        { value: 'draft', label: 'Brouillon' },
        { value: 'pending', label: 'En attente' },
        { value: 'published', label: 'Publié' },
        { value: 'blocked', label: 'Bloqué' },
        { value: 'archived', label: 'Archivé' },
    ];

    return (
        <Container fluid>
            <Box pos="relative">
                <LoadingOverlay visible={loading} />

                {/*  En-tête avec bouton Ajouter */}
                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2}> Contenus</Title>
                        <Text c="dimmed">Gestion des contenus de la plateforme</Text>
                    </div>
                    <Group>
                        <Button
                            color="blue"
                            leftSection={<IconPlus size={16} />}
                            onClick={handleOpenAdd}
                        >
                            Ajouter
                        </Button>
                        <Button
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={fetchContents}
                        >
                            Actualiser
                        </Button>
                    </Group>
                </Group>

                {/*  Filtres */}
                <Card withBorder p="md" mb="md">
                    <Group>
                        <TextInput
                            placeholder="Rechercher..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <Select
                            placeholder="Filtrer par statut"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            data={[
                                { value: 'draft', label: 'Brouillon' },
                                { value: 'pending', label: 'En attente' },
                                { value: 'published', label: 'Publié' },
                                { value: 'blocked', label: 'Bloqué' },
                                { value: 'archived', label: 'Archivé' },
                            ]}
                            clearable
                            style={{ width: 180 }}
                        />
                    </Group>
                </Card>

                {/*  Tableau */}
                <Card withBorder p="0" style={{ overflow: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Titre</Table.Th>
                                <Table.Th>Auteur</Table.Th>
                                <Table.Th>Prix</Table.Th>
                                <Table.Th>Statut</Table.Th>
                                <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedContents.map((content) => (
                                <Table.Tr
                                    key={content.id}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/contents/${content.id}`)}
                                >
                                    <Table.Td>#{content.id}</Table.Td>
                                    <Table.Td fw={500}>{content.title}</Table.Td>
                                    {/*  Auteur : utiliser une valeur par défaut si non présent */}
                                    <Table.Td>{content.author?.username || 'Inconnu'}</Table.Td>
                                    <Table.Td>{content.price?.toLocaleString() || 0} FCFA</Table.Td>
                                    <Table.Td>{getStatusBadge(content.status)}</Table.Td>
                                    <Table.Td style={{ textAlign: 'center' }}>
                                        <Group gap="xs" justify="center" wrap="nowrap">
                                            {content.status === 'pending' && (
                                                <Button size="xs" color="green" onClick={() => handleApprove(content.id)}>
                                                    Approuver
                                                </Button>
                                            )}
                                            {content.status === 'blocked' ? (
                                                <Button size="xs" color="green" onClick={() => handleUnblock(content.id)}>
                                                    Débloquer
                                                </Button>
                                            ) : (
                                                content.status !== 'archived' && (
                                                    <Button size="xs" color="red" onClick={() => handleBlock(content.id)}>
                                                        Bloquer
                                                    </Button>
                                                )
                                            )}

                                            <Menu shadow="md" width={160} position="bottom-end">
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray">
                                                        <IconDotsVertical size={16} />
                                                    </ActionIcon>
                                                </Menu.Target>

                                                <Menu.Dropdown>
                                                    <Menu.Item
                                                        leftSection={<IconEdit size={14} />}
                                                        onClick={() => handleOpenEdit(content)}
                                                    >
                                                        Modifier
                                                    </Menu.Item>
                                                    {content.status !== 'archived' && (
                                                        <Menu.Item
                                                            leftSection={<IconTrash size={14} />}
                                                            onClick={() => handleArchive(content.id)}
                                                        >
                                                            Archiver
                                                        </Menu.Item>
                                                    )}
                                                    <Menu.Item
                                                        color="red"
                                                        leftSection={<IconTrash size={14} />}
                                                        onClick={() => handleOpenDelete(content.id)}
                                                    >
                                                        Supprimer
                                                    </Menu.Item>
                                                </Menu.Dropdown>
                                            </Menu>
                                        </Group>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Card>

                {/*  Pagination */}
                {totalPages > 1 && (
                    <Group justify="center" mt="md">
                        <Pagination
                            total={totalPages}
                            value={currentPage}
                            onChange={setCurrentPage}
                            color="blue"
                        />
                    </Group>
                )}

                <Text size="sm" c="dimmed" ta="center" mt="xs">
                    Affichage de {paginatedContents.length} sur {filteredContents.length} contenu(s)
                </Text>

                {/*  MODAL : AJOUT / MODIFICATION */}
                <Modal
                    opened={modalOpened}
                    onClose={closeModal}
                    title={editingContent ? '✏️ Modifier le contenu' : '➕ Ajouter un contenu'}
                    centered
                    size="lg"
                >
                    <Stack>
                        {formError && (
                            <Alert color="red" title="Erreur">
                                {formError}
                            </Alert>
                        )}

                        <TextInput
                            label="Titre"
                            placeholder="Entrez le titre du contenu"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            leftSection={<IconFileText size={16} />}
                            required
                        />

                        <Textarea
                            label="Description"
                            placeholder="Description du contenu"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            minRows={3}
                        />

                        <Group grow>
                            <Select
                                label="Type de média"
                                value={formData.mediaType}
                                onChange={(value) =>
                                    setFormData({ ...formData, mediaType: value || 'epub' })
                                }
                                data={getMediaTypeOptions()}
                                required
                            />

                            <NumberInput
                                label="Prix (FCFA)"
                                placeholder="0"
                                value={formData.price}
                                onChange={(value) =>
                                    setFormData({ ...formData, price: Number(value) || 0 })
                                }
                                min={0}
                                step={100}
                                leftSection={<IconCurrencyFrank size={16} />}
                            />
                        </Group>

                        <Select
                            label="Statut"
                            value={formData.status}
                            onChange={(value) =>
                                setFormData({ ...formData, status: value || 'draft' })
                            }
                            data={getStatusOptions()}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={closeModal}>
                                Annuler
                            </Button>
                            <Button loading={formLoading} onClick={handleSubmitForm} color="blue">
                                {editingContent ? 'Enregistrer' : 'Créer'}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

                {/*  MODAL : SUPPRESSION */}
                <Modal
                    opened={deleteModalOpened}
                    onClose={closeDeleteModal}
                    title=" Confirmer la suppression"
                    centered
                >
                    <Text>
                        Êtes-vous sûr de vouloir supprimer ce contenu ?
                        Cette action est irréversible.
                    </Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="light" onClick={closeDeleteModal}>
                            Annuler
                        </Button>
                        <Button color="red" onClick={handleConfirmDelete}>
                            Supprimer
                        </Button>
                    </Group>
                </Modal>

            </Box>
        </Container>
    );
}