import { useEffect, useState } from 'react';
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
    TextInput,
    Pagination,
    SimpleGrid,
    Button,
} from '@mantine/core';
import { IconSearch, IconRefresh,  } from '@tabler/icons-react';
import { auditApi } from '../../api/audit.api';
import type { AuditLog } from '../../types';

/*
 Couleurs des actions pour les badges
 */
const actionColors: Record<string, string> = {
    login: 'blue',
    logout: 'gray',
    block_user: 'red',
    unblock_user: 'green',
    update_role: 'orange',
    approve_content: 'green',
    block_content: 'red',
    unblock_content: 'green',
    archive_content: 'gray',
    update_commission: 'orange',
    update_settings: 'violet',
};

/*
  Libellés des actions
 */
const actionLabels: Record<string, string> = {
    login: 'Connexion',
    logout: 'Déconnexion',
    block_user: 'Blocage utilisateur',
    unblock_user: 'Déblocage utilisateur',
    update_role: 'Modification rôle',
    approve_content: 'Approbation contenu',
    block_content: 'Blocage contenu',
    unblock_content: 'Déblocage contenu',
    archive_content: 'Archivage contenu',
    update_commission: 'Modification commission',
    update_settings: 'Modification paramètres',
};

//Icônes des actions (versions texte simplifiées



export default function Audit() {
    // États
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    /**
     * Récupère les logs depuis l'API
     */
    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await auditApi.getAll();
            setLogs(response.data.data || []);
            setFilteredLogs(response.data.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    /*
      Applique les filtres (recherche + action)
     */
    useEffect(() => {
        let filtered = [...logs];

        // Filtre par recherche
        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter(
                (log) =>
                    log.adminName.toLowerCase().includes(s) ||
                    log.details.toLowerCase().includes(s) ||
                    log.target.toLowerCase().includes(s)
            );
        }

        // Filtre par action

        if (actionFilter) {
            filtered = filtered.filter((log) => log.action === actionFilter);
        }

        setFilteredLogs(filtered);
        setCurrentPage(1);
    }, [search, actionFilter, logs]);

    /*
      Calcule les statistiques
     */
    const stats = {
        total: filteredLogs.length,
        admins: new Set(filteredLogs.map((l) => l.adminName)).size,
        actions: filteredLogs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<string, number>),
    };

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    //Formate la date pour l'affichage

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    //Retourne un badge pour l'action
    const getActionBadge = (action: string) => {
        const color = actionColors[action] || 'gray';
        const label = actionLabels[action] || action;

        return (
            <Badge color={color} variant="light">
                 {label}
            </Badge>
        );
    };

    return (
        <Container fluid>
            <Box pos="relative">
                <LoadingOverlay visible={loading} />

                {/* En-tête */}
                <Group justify="space-between" mb="lg">
                    <div>
                        <Title order={2}>Journaux d'audit</Title>
                        <Text c="dimmed">Traçabilité des actions des administrateurs</Text>
                    </div>
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconRefresh size={16} />}
                            onClick={fetchLogs}
                        >
                            Actualiser
                        </Button>
                    </Group>
                </Group>

                {/* Statistiques */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="lg">
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Total actions</Text>
                        <Text fw={700} size="xl">{stats.total}</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Admins actifs</Text>
                        <Text fw={700} size="xl">{stats.admins}</Text>
                    </Card>
                    <Card withBorder p="md">
                        <Text size="xs" c="dimmed" tt="uppercase">Types d'actions</Text>
                        <Text fw={700} size="xl">{Object.keys(stats.actions).length}</Text>
                    </Card>
                </SimpleGrid>

                {/* filtres */}
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
                            placeholder="Filtrer par action"
                            value={actionFilter}
                            onChange={setActionFilter}
                            data={[
                                { value: 'login', label: 'Connexion' },
                                { value: 'logout', label: 'Déconnexion' },
                                { value: 'block_user', label: 'Utilisateur bloqué' },
                                { value: 'unblock_user', label: 'Utilisateur debloqué' },
                                { value: 'approve_content', label: 'Approbation contenu' },
                                { value: 'block_content', label: 'Blocage contenu' },
                                { value: 'unblock_content', label: 'Déblocage contenu' },
                                { value: 'archive_content', label: 'Archivage contenu' },
                                { value: 'update_commission', label: 'Modification commission' },
                            ]}
                            clearable
                            style={{ width: 200 }}
                        />
                    </Group>
                </Card>

                {/* Tableau des logs */}
                <Card withBorder p="0" style={{ overflow: 'auto' }}>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th style={{ width: 50 }}>ID</Table.Th>
                                <Table.Th style={{ width: 180 }}>Date</Table.Th>
                                <Table.Th style={{ width: 180 }}>Admin</Table.Th>
                                <Table.Th >Action</Table.Th>
                                <Table.Th style={{ width: 150 }} >Cible</Table.Th>
                                <Table.Th>Détails</Table.Th>
                                <Table.Th style={{ width: 120 }}>IP</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {paginatedLogs.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                                        Aucun log trouvé
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                paginatedLogs.map((log) => (
                                    <Table.Tr key={log.id}>
                                        <Table.Td>#{log.id}</Table.Td>
                                        <Table.Td>{formatDate(log.timestamp)}</Table.Td>
                                        <Table.Td fw={500}>{log.adminName}</Table.Td>
                                        <Table.Td>{getActionBadge(log.action)}</Table.Td>
                                        <Table.Td>
                                            <Badge color="gray" variant="outline">
                                                {log.target}
                                                {log.targetId && ` #${log.targetId}`}
                                            </Badge>
                                        </Table.Td>
                                        <Table.Td>{log.details}</Table.Td>
                                        <Table.Td>
                                            <Text size="xs" c="dimmed">{log.ipAddress}</Text>
                                        </Table.Td>
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
                        />
                    </Group>
                )}
            </Box>
        </Container>
    );
}