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
    Select,
    SimpleGrid,
    Pagination,
} from '@mantine/core';
import { transactionApi } from '../../api/transaction.api';

const typeColors: Record<string, string> = {
    recharge: 'green',
    achat: 'blue',
    reversement: 'orange',
};

const statusColors: Record<string, string> = {
    completed: 'green',
    pending: 'yellow',
    failed: 'red',
};

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const navigate = useNavigate();

    //  Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const response = await transactionApi.getAll();
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    //  Réinitialiser la page quand les filtres changent
    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, statusFilter]);

    //  Calcul des statistiques
    const totalRecharges = transactions
        .filter((t: any) => t.type === 'recharge' && t.status === 'completed')
        .reduce((sum: any, t: any) => sum + t.amount, 0);

    const totalAchats = transactions
        .filter((t: any) => t.type === 'achat' && t.status === 'completed')
        .reduce((sum: any, t: any) => sum + t.amount, 0);

    const totalEnAttente = transactions
        .filter((t: any) => t.status === 'pending')
        .reduce((sum: any, t: any) => sum + t.amount, 0);

    //  Filtrage
    const filtered = transactions.filter((t: any) => {
        const matchType = typeFilter ? t.type === typeFilter : true;
        const matchStatus = statusFilter ? t.status === statusFilter : true;
        return matchType && matchStatus;
    });

    //  Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedData = filtered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // @ts-ignore
    return (
        <Container fluid>
            <Box pos="relative">
                <LoadingOverlay visible={loading} />

                <Title order={2} mb="xs"> Transactions</Title>
                <Text c="dimmed" mb="lg">Supervision des transactions financières</Text>

                {/* Statistiques */}
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Total recharges</Text>
                        <Text fw={700} size="xl" c="green">{totalRecharges.toLocaleString()} FCFA</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Total achats</Text>
                        <Text fw={700} size="xl" c="blue">{totalAchats.toLocaleString()} FCFA</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">En attente</Text>
                        <Text fw={700} size="xl" c="orange">{totalEnAttente.toLocaleString()} FCFA</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Total transactions</Text>
                        <Text fw={700} size="xl">{transactions.length}</Text>
                    </Card>
                </SimpleGrid>

                {/* Filtres */}
                <Card withBorder p="md" mb="md">
                    <Group>
                        <Select
                            placeholder="Filtrer par type"
                            value={typeFilter}
                            onChange={setTypeFilter}
                            data={[
                                { value: 'recharge', label: 'Recharge' },
                                { value: 'achat', label: 'Achat' },
                            ]}
                            clearable
                            style={{ width: 180 }}
                        />
                        <Select
                            placeholder="Filtrer par statut"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            data={[
                                { value: 'completed', label: 'Complété' },
                                { value: 'pending', label: 'En attente' },
                                { value: 'failed', label: 'Échoué' },
                            ]}
                            clearable
                            style={{ width: 180 }}
                        />
                    </Group>
                </Card>

                {/* Tableau */}
                <Card withBorder p="0" style={{ overflow: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>ID</Table.Th>
                                <Table.Th>Utilisateur</Table.Th>
                                <Table.Th>Type</Table.Th>
                                <Table.Th>Montant</Table.Th>
                                <Table.Th>Statut</Table.Th>
                                <Table.Th>Date</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedData.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        Aucune transaction trouvée
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                paginatedData.map((t: any) => (
                                    <Table.Tr
                                        key={t.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(`/transactions/${t.id}`)}
                                    >
                                        <Table.Td>#{t.id}</Table.Td>
                                        <Table.Td>{t.user}</Table.Td>
                                        <Table.Td>
                                            <Badge color={typeColors[t.type] || 'gray'}>{t.type}</Badge>
                                        </Table.Td>
                                        <Table.Td>{t.amount.toLocaleString()} FCFA</Table.Td>
                                        <Table.Td>
                                            <Badge color={statusColors[t.status] || 'gray'} variant="light">
                                                {t.status}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{t.date}</Table.Td>
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
                    Affichage de {paginatedData.length} sur {filtered.length} transaction(s)
                </Text>
            </Box>
        </Container>
    );
}