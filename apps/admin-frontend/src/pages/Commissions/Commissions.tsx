import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Table,
    Badge,
    Group,
    LoadingOverlay,
    Box,
    Card,
    TextInput,
    SimpleGrid,
    Button,
    Pagination,
} from '@mantine/core';
import { IconSearch, IconSettings } from '@tabler/icons-react';
import { commissionApi } from '../../api/commission.api';

const statusColors: Record<string, string> = {
    paid: 'green',
    pending: 'yellow',
    published: 'blue',
};

export default function Commissions() {
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    //  Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchCommissions = async () => {
        try {
            setLoading(true);
            const response = await commissionApi.getAll();
            setCommissions(response.data.data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    // Réinitialiser la page quand la recherche change
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    //  Calcul des statistiques
    const totalCommissions = commissions.reduce((sum: any, c: any) => sum + c.amount, 0);
    const totalPaid = commissions
        .filter((c: any) => c.status === 'paid')
        .reduce((sum: any, c: any) => sum + c.amount, 0);
    const totalPending = commissions
        .filter((c: any) => c.status === 'pending')
        .reduce((sum: any, c: any) => sum + c.amount, 0);

    //  Filtrage par recherche
    const filteredCommissions = commissions.filter((c: any) =>
        c.editor.toLowerCase().includes(search.toLowerCase())
    );

    //  Pagination
    const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
    const paginatedCommissions = filteredCommissions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Statistiques pour l'éditeur recherché
    const searchedEditor = search.trim();
    const editorStats = searchedEditor
        ? filteredCommissions.reduce(
            (acc: any, c: any) => ({
                total: acc.total + c.amount,
                paid: c.status === 'paid' ? acc.paid + c.amount : acc.paid,
                pending: c.status === 'pending' ? acc.pending + c.amount : acc.pending,
            }),
            { total: 0, paid: 0, pending: 0 }
        )
        : null;

    return (
        <Container fluid>
            <Box pos="relative">
                <LoadingOverlay visible={loading} />

                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2}> Commissions</Title>
                        <Text c="dimmed">Gestion des commissions des éditeurs</Text>
                    </div>
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconSettings size={16} />}
                            onClick={() => navigate('/commissions-settings')}
                        >
                            Paramètres
                        </Button>
                    </Group>
                </Group>

                {/* Statistiques globales */}
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Total commissions</Text>
                        <Text fw={700} size="xl">{totalCommissions.toLocaleString()} FCFA</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Payé</Text>
                        <Text fw={700} size="xl" c="green">{totalPaid.toLocaleString()} FCFA</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">En attente</Text>
                        <Text fw={700} size="xl" c="orange">{totalPending.toLocaleString()} FCFA</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Répartition</Text>
                        <Group>
                            <Badge color="blue">Éditeur 85%</Badge>
                            <Badge color="gray">Admin 15%</Badge>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Statistiques spécifiques à l'éditeur recherché */}
                {searchedEditor && editorStats && (
                    <Card withBorder p="md" mb="md" style={{ backgroundColor: '#f0f7ff' }}>
                        <Text fw={600} mb="xs"> Statistiques pour : {searchedEditor}</Text>
                        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                            <Card withBorder p="xs" style={{ backgroundColor: '#fff' }}>
                                <Text size="xs" c="dimmed">Total</Text>
                                <Text fw={600}>{editorStats.total.toLocaleString()} FCFA</Text>
                            </Card>
                            <Card withBorder p="xs" style={{ backgroundColor: '#fff' }}>
                                <Text size="xs" c="dimmed">Payé</Text>
                                <Text fw={600} c="green">{editorStats.paid.toLocaleString()} FCFA</Text>
                            </Card>
                            <Card withBorder p="xs" style={{ backgroundColor: '#fff' }}>
                                <Text size="xs" c="dimmed">En attente</Text>
                                <Text fw={600} c="orange">{editorStats.pending.toLocaleString()} FCFA</Text>
                            </Card>
                        </SimpleGrid>
                    </Card>
                )}

                {/* Recherche */}
                <Card withBorder p="md" mb="md">
                    <Group>
                        <TextInput
                            placeholder="Rechercher un éditeur..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </Group>
                </Card>

                {/* Tableau */}
                <Card withBorder p="0" style={{ overflow: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Éditeur</Table.Th>
                                <Table.Th>Montant</Table.Th>
                                <Table.Th>Statut</Table.Th>
                                <Table.Th>Mois</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedCommissions.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        Aucune commission trouvée
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                paginatedCommissions.map((c: any) => (
                                    <Table.Tr
                                        key={c.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/commissions/${c.id}`)}
                                    >
                                        <Table.Td>#{c.id}</Table.Td>
                                        <Table.Td fw={500}>{c.editor}</Table.Td>
                                        <Table.Td>{c.amount.toLocaleString()} FCFA</Table.Td>
                                        <Table.Td>
                                            <Badge color={statusColors[c.status] || 'gray'} variant="light">
                                                {c.status}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{c.month}</Table.Td>
                                    </Table.Tr>
                                ))
                            )}
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
                    Affichage de {paginatedCommissions.length} sur {filteredCommissions.length} commission(s)
                </Text>
            </Box>
        </Container>
    );
}