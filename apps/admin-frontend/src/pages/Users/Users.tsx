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
    PasswordInput,
    ActionIcon,
    Menu,
    Alert,
} from '@mantine/core';
import {
    IconSearch,
    IconRefresh,
    IconPlus,
    IconEdit,
    IconTrash,
    IconDotsVertical,
    IconUser,
    IconMail,
    IconLock,
    IconPhone,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { userApi } from '../../api/user.api';
import type { User } from '../../types';

export default function Users() {
    // États pour les données
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const navigate = useNavigate();

    //  État pour le chargement du changement de rôle (utilisé)
    const [updatingRole, setUpdatingRole] = useState<number | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    // États pour les modales
    const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

    // États pour le formulaire
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'reader',
        password: '',
        whatsappPhone: '',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');

    // Récupère la liste des utilisateurs
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userApi.getAll();
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

    // ============================================================
    // ACTIONS CRUD
    // ============================================================

    const handleOpenAdd = () => {
        setEditingUser(null);
        setFormData({ username: '', email: '', role: 'reader', password: '',whatsappPhone: '' });
        setFormError('');
        openModal();
    };

    const handleOpenEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '',
            whatsappPhone: '',
        });
        setFormError('');
        openModal();
    };

    const handleSubmitForm = async () => {
        if (!formData.username || !formData.email) {
            setFormError('Nom et email sont requis');
            return;
        }

        try {
            setFormLoading(true);
            setFormError('');

            if (editingUser) {
                await userApi.update(editingUser.id, {
                    username: formData.username,
                    email: formData.email,
                    role: formData.role,
                });
            } else {
                // CORRECTION : Envoyer tous les champs requis
                await userApi.create({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                    countryCode: 'CM',           //  Valeur par défaut
                    whatsappPhone: formData.whatsappPhone || '+237600000000',
                });
            }


            await fetchUsers();
            closeModal();
        } catch (error: any) {
            setFormError(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
        } finally {
            setFormLoading(false);
        }
    };

    const handleOpenDelete = (id: number) => {
        setDeletingUserId(id);
        openDeleteModal();
    };

    const handleConfirmDelete = async () => {
        if (!deletingUserId) return;

        try {
            await userApi.delete(deletingUserId);
            await fetchUsers();
            closeDeleteModal();
            setDeletingUserId(null);
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleBlock = async (id: number) => {
        if (!confirm('Voulez-vous vraiment bloquer cet utilisateur ?')) return;
        try {
            await userApi.block(id);
            await fetchUsers();
        } catch (error) {
            alert('Erreur lors du blocage');
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            await userApi.unblock(id);
            await fetchUsers();
        } catch (error) {
            alert('Erreur lors du déblocage');
        }
    };

    //  handleUpdateRole est maintenant utilisé
    const handleUpdateRole = async (id: number, role: string) => {
        try {
            setUpdatingRole(id);
            await userApi.updateRole(id, role);
            await fetchUsers();
        } catch (error) {
            alert('Erreur lors du changement de rôle');
        } finally {
            setUpdatingRole(null);
        }
    };

    // ============================================================
    // FILTRAGE ET PAGINATION
    // ============================================================

    const filteredUsers = users.filter((user) => {
        const matchSearch =
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter ? user.role === roleFilter : true;
        return matchSearch && matchRole;
    });

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ============================================================
    // UTILITAIRES
    // ============================================================

    const getRoleOptions = () => [
        { value: 'admin', label: 'Admin' },
        { value: 'editor', label: 'Éditeur' },
        { value: 'reader', label: 'Lecteur' },
    ];

    // @ts-ignore
    // @ts-ignore
    return (
        <Container fluid>
            <Box pos="relative">
                <LoadingOverlay visible={loading} />


                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2}> Utilisateurs</Title>
                        <Text c="dimmed">Gestion des utilisateurs de la plateforme</Text>
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
                            onClick={fetchUsers}
                        >
                            Actualiser
                        </Button>
                    </Group>
                </Group>


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
                            placeholder="Filtrer par rôle"
                            value={roleFilter}
                            onChange={setRoleFilter}
                            data={[
                                { value: 'admin', label: 'Admin' },
                                { value: 'editor', label: 'Éditeur' },
                                { value: 'reader', label: 'Lecteur' },
                            ]}
                            clearable
                            style={{ width: 180 }}
                        />
                    </Group>
                </Card>

                <Card withBorder p="0" style={{ overflow: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Nom</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>Rôle</Table.Th>
                                <Table.Th>Statut</Table.Th>
                                <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedUsers.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        Aucun utilisateur trouvé
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <Table.Tr
                                        key={user.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/users/${user.id}`)}
                                    >
                                        <Table.Td>#{user.id}</Table.Td>
                                        <Table.Td fw={500}>{user.username}</Table.Td>
                                        <Table.Td>{user.email}</Table.Td>
                                        <Table.Td>
                                            <Select
                                                value={user.role}
                                                onChange={(value) => {
                                                    if (value) handleUpdateRole(user.id, value);
                                                }}
                                                data={getRoleOptions()}
                                                size="xs"
                                                style={{ width: 120 }}
                                                disabled={updatingRole === user.id}
                                                loading={updatingRole === user.id}
                                            />
                                        </Table.Td>

                                        <Table.Td>
                                            <Badge size="sm" color={user.isActive ? 'green' : 'red'} variant="light">
                                                {user.isActive ? 'Actif' : 'Bloqué'}
                                            </Badge>
                                        </Table.Td>

                                        <Table.Td style={{ textAlign: 'center' }}>
                                            <Group gap="xs" justify="center" wrap="nowrap">
                                                {user.isActive ? (
                                                    <Button size="xs" color="red" onClick={() => handleBlock(user.id)}>
                                                        Bloquer
                                                    </Button>
                                                ) : (
                                                    <Button size="xs" color="green" onClick={() => handleUnblock(user.id)}>
                                                        Débloquer
                                                    </Button>
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
                                                            onClick={() => handleOpenEdit(user)}
                                                        >
                                                            Modifier
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            color="red"
                                                            leftSection={<IconTrash size={14} />}
                                                            onClick={() => handleOpenDelete(user.id)}
                                                        >
                                                            Supprimer
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </Card>

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
                    Affichage de {paginatedUsers.length} sur {filteredUsers.length} utilisateur(s)
                </Text>

                <Modal
                    opened={modalOpened}
                    onClose={closeModal}
                    title={editingUser ? ' Modifier l\'utilisateur' : '➕ Ajouter un utilisateur'}
                    centered
                >
                    <Stack>
                        {formError && (
                            <Alert color="red" title="Erreur">
                                {formError}
                            </Alert>
                        )}

                        <TextInput
                            label="Nom d'utilisateur"
                            placeholder="Entrez le nom"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({ ...formData, username: e.target.value })
                            }
                            leftSection={<IconUser size={16} />}
                            required
                        />

                        <TextInput
                            label="Email"
                            placeholder="exemple@email.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            leftSection={<IconMail size={16} />}
                            required
                        />

                        <Select
                            label="Rôle"
                            value={formData.role}
                            onChange={(value) =>
                                setFormData({ ...formData, role: value || 'reader' })
                            }
                            data={getRoleOptions()}
                            required
                        />

                        {!editingUser && (
                            <PasswordInput
                                label="Mot de passe"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                leftSection={<IconLock size={16} />}
                                required
                            />
                        )}
                        <TextInput
                            label="Numéro WhatsApp"
                            placeholder="+237600000000"
                            value={formData.whatsappPhone || ''}
                            onChange={(e) =>
                                setFormData({ ...formData, whatsappPhone: e.target.value })
                            }
                            leftSection={<IconPhone size={16} />}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="light" onClick={closeModal}>
                                Annuler
                            </Button>
                            <Button loading={formLoading} onClick={handleSubmitForm} color="blue">
                                {editingUser ? 'Enregistrer' : 'Créer'}
                            </Button>
                        </Group>
                    </Stack>
                </Modal>

                <Modal
                    opened={deleteModalOpened}
                    onClose={closeDeleteModal}
                    title=" Confirmer la suppression"
                    centered
                >
                    <Text>
                        Êtes-vous sûr de vouloir supprimer cet utilisateur ?
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