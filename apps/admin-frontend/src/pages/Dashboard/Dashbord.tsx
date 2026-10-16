import { useEffect, useState } from 'react';
import {
    SimpleGrid,
    Card,
    Text,
    Title,
    Container,
    Group,
    Badge,
    LoadingOverlay,
    Box,
    Select,
    ScrollArea,
    Table,
    ThemeIcon,
} from '@mantine/core';
import {
    IconUsers,
    IconFileText,
    IconCoin,
    IconAlertCircle,
    IconTrendingUp,
    IconTrendingDown,
    IconClock,

} from '@tabler/icons-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { dashboardApi } from '../../api/dashboard.api';
import type { DashboardStats, AlertItem, ActivityItem, TopContentItem } from '../../types';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('month');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await dashboardApi.getStats();
                setStats(response.data.data);
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <Container fluid>
                <LoadingOverlay visible={true} />
            </Container>
        );
    }

    if (!stats) {
        return (
            <Container fluid>
                <Text>Impossible de charger les données</Text>
            </Container>
        );
    }


    //  Fonction de santé avec les nouveaux seuils
    const getHealth = (value: number, type: 'users' | 'contents' | 'revenue' | 'moderation' | 'conversion' | 'failed') => {
        switch (type) {
            case 'users':
                if (value > 10) return { label: 'Bon', color: 'green' };
                if (value >= 5) return { label: 'Moyen', color: 'orange' };
                return { label: 'Critique', color: 'red' };

            case 'contents':
                if (value > 100) return { label: 'Bon', color: 'green' };
                if (value >= 30) return { label: 'Moyen', color: 'orange' };
                return { label: 'Critique', color: 'red' };

            case 'revenue':
                if (value > 50000) return { label: 'Bon', color: 'green' };
                if (value >= 10000) return { label: 'Moyen', color: 'orange' };
                return { label: 'Critique', color: 'red' };

            case 'moderation':
                if (value < 5) return { label: 'Bon', color: 'green' };
                if (value <= 15) return { label: 'Moyen', color: 'orange' };
                return { label: 'Critique', color: 'red' };

            case 'conversion':
                if (value > 5) return { label: 'Bon', color: 'green' };
                if (value >= 2) return { label: 'Moyen', color: 'orange' };
                return { label: 'Critique', color: 'red' };

            case 'failed':
                if (value < 2) return { label: 'Bon', color: 'green' };
                if (value <= 5) return { label: 'Moyen', color: 'orange' };
                return { label: 'Critique', color: 'red' };

            default:
                return { label: 'Bon', color: 'green' };
        }
    };


    // Cartes KPI
    const cards = [
        {
            label: 'Utilisateurs',
            value: stats.activeUsers,
            total: stats.totalUsers,
            icon: IconUsers,
            color: '#1976d2',
            trend: stats.growth?.users || 12,
            health: getHealth(stats.activeUsers, 'users'),
        },
        {
            label: 'Contenus',
            value: stats.publishedContents,
            total: stats.totalContents,
            icon: IconFileText,
            color: '#2e7d32',
            trend: stats.growth?.contents || 8,
            health: getHealth(stats.publishedContents, 'contents'),
        },
        {
            label: 'Revenus (mois)',
            value: `${(stats.monthlyRevenue || 845000).toLocaleString()} FCFA`,
            total: `${(stats.totalRevenue || 2450000).toLocaleString()} FCFA`,
            icon: IconCoin,
            color: '#ed6c02',
            trend: stats.growth?.revenue || 15,
            health: getHealth(stats.monthlyRevenue || 845000, 'revenue'),
        },
        {
            label: 'Modération',
            value: stats.pendingModeration,
            icon: IconClock,
            color: '#d32f2f',
            trend: -3,
            health: getHealth(stats.pendingModeration, 'moderation'),
            invertTrend: true,
        },
    ];

    //  Données pour le graphique
    const chartData = stats.chartData || {
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        sales: [12000, 8000, 15000, 22000, 18000, 9500, 5000],
        users: [5, 8, 12, 7, 15, 10, 6],
    };

    const combinedChartData = chartData.labels.map((label, index) => ({
        day: label,
        ventes: chartData.sales[index] || 0,
        utilisateurs: chartData.users[index] || 0,
    }));

    //  Couleurs des statuts
    const statusColors: Record<string, string> = {
        completed: 'green',
        pending: 'yellow',
        failed: 'red',
    };

    return (
        <Container fluid>
            {/*  En-tête avec filtre */}
            <Group justify="space-between" mb="lg">
                <div>
                    <Title order={2}> Tableau de bord</Title>
                    <Text c="dimmed">Vue d'ensemble de la plateforme PayMedia</Text>
                </div>
                <Group>
                    <Select
                        value={timeFilter}
                        onChange={(value) => setTimeFilter(value || 'month')}
                        data={[
                            { value: 'today', label: "Aujourd'hui" },
                            { value: 'week', label: 'Cette semaine' },
                            { value: 'month', label: 'Ce mois' },
                            { value: 'year', label: 'Cette année' },
                        ]}
                        style={{ width: 150 }}
                    />
                    <Badge size="lg" color="blue" variant="light">
                        Mise à jour : {new Date().toLocaleString()}
                    </Badge>
                </Group>
            </Group>

            {/*  KPI CARDS */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="lg">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const isPositive = card.trend >= 0;
                    const healthColor = card.health.color;

                    return (
                        <Card key={card.label} withBorder p="lg" radius="md" style={{ backgroundColor: '#fff' }}>
                            <Group justify="space-between" align="flex-start">
                                <Group>
                                    <div
                                        style={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 10,
                                            backgroundColor: `${card.color}15`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon size={22} color={card.color} />
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                            {card.label}
                                        </Text>
                                        <Group gap="xs" align="center">
                                            <Text fw={700} size="xl">
                                                {card.value}
                                            </Text>
                                            {card.total && (
                                                <Text size="xs" c="dimmed">/ {card.total}</Text>
                                            )}
                                        </Group>
                                    </div>
                                </Group>
                                <Group gap="xs" align="center">
                                    {card.trend !== 0 && (
                                        <Badge
                                            size="sm"
                                            color={isPositive ? 'green' : 'red'}
                                            variant="light"
                                            leftSection={
                                                isPositive ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />
                                            }
                                        >
                                            {isPositive ? '+' : ''}{card.trend}%
                                        </Badge>
                                    )}
                                    <Badge size="sm" color={healthColor} variant="filled">
                                        {card.health.label}
                                    </Badge>
                                </Group>
                            </Group>
                        </Card>
                    );
                })}
            </SimpleGrid>

            {/*  GRAPHIQUE + TOP CONTENUS */}
            <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md">
                {/* Graphique - occupe 2 colonnes */}
                <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#fff', gridColumn: 'span 2' }}>
                    <Group justify="space-between" mb="md">
                        <Title order={4}>Évolution des ventes (30 jours)</Title>
                        <Badge color="gray" variant="light">Derniers 7 jours</Badge>
                    </Group>
                    <Box style={{ height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={combinedChartData}>
                                <defs>
                                    <linearGradient id="colorVentes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Area
                                    type="monotone"
                                    dataKey="ventes"
                                    stroke="#1976d2"
                                    strokeWidth={2}
                                    fill="url(#colorVentes)"
                                    name="Ventes (FCFA)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                </Card>

                {/* Top contenus */}
                <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#fff' }}>
                    <Group justify="space-between" mb="md">
                        <Title order={4}>Top contenus</Title>
                        <Badge color="blue" variant="light">Meilleurs ventes</Badge>
                    </Group>
                    <ScrollArea style={{ height: 220 }}>
                        {stats.topContents && stats.topContents.length > 0 ? (
                            stats.topContents.map((content: TopContentItem, index: number) => (
                                <Group key={content.id} justify="space-between" mb="xs" p="xs" style={{ borderRadius: 6, backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'transparent' }}>
                                    <Group gap="xs">
                                        <Badge size="sm" color="blue" variant="filled" radius="xl" style={{ minWidth: 24 }}>
                                            {index + 1}
                                        </Badge>
                                        <div>
                                            <Text size="sm" fw={500}>{content.title}</Text>
                                            <Text size="xs" c="dimmed">{content.author}</Text>
                                        </div>
                                    </Group>
                                    <Badge color="green" variant="light">{content.sales} ventes</Badge>
                                </Group>
                            ))
                        ) : (
                            <Text c="dimmed" ta="center" mt="xl">Aucun contenu</Text>
                        )}
                    </ScrollArea>
                </Card>
            </SimpleGrid>

            {/*  ALERTES + ACTIVITÉ RÉCENTE */}
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mt="md">
                {/* Alertes */}
                <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#fff3e0' }}>
                    <Group justify="space-between" mb="md">
                        <Group>
                            <ThemeIcon color="red" radius="xl" size="lg">
                                <IconAlertCircle size={20} />
                            </ThemeIcon>
                            <Title order={4}> Alertes ({stats.alerts?.total || 0})</Title>
                        </Group>
                        <Badge color="red" variant="light">{stats.alerts?.total || 0} en attente</Badge>
                    </Group>
                    {stats.alerts?.items && stats.alerts.items.length > 0 ? (
                        stats.alerts.items.slice(0, 3).map((alert: AlertItem) => (
                            <Group key={alert.id} mb="xs" gap="sm">
                                <ThemeIcon color="orange" size="sm" radius="xl" variant="light">
                                    <IconAlertCircle size={14} />
                                </ThemeIcon>
                                <Text size="sm" style={{ flex: 1 }}>{alert.message}</Text>
                                <Badge size="xs" color="orange" variant="light">
                                    {alert.severity}
                                </Badge>
                            </Group>
                        ))
                    ) : (
                        <Text c="dimmed">Aucune alerte</Text>
                    )}
                </Card>

                {/* Activité récente */}
                <Card withBorder p="lg" radius="md" style={{ backgroundColor: '#fff' }}>
                    <Group justify="space-between" mb="md">
                        <Title order={4}> Activité récente</Title>
                        <Badge color="gray" variant="light">En direct</Badge>
                    </Group>
                    <ScrollArea style={{ height: 170 }}>
                        {stats.recentActivities && stats.recentActivities.length > 0 ? (
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Utilisateur</Table.Th>
                                        <Table.Th>Action</Table.Th>
                                        <Table.Th>Montant</Table.Th>
                                        <Table.Th>Statut</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {stats.recentActivities.slice(0, 4).map((activity: ActivityItem) => (
                                        <Table.Tr key={activity.id}>
                                            <Table.Td fw={500}>{activity.user}</Table.Td>
                                            <Table.Td>{activity.action}</Table.Td>
                                            <Table.Td>{activity.amount.toLocaleString()} FCFA</Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    size="sm"
                                                    color={statusColors[activity.status] || 'gray'}
                                                    variant="light"
                                                >
                                                    {activity.status}
                                                </Badge>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        ) : (
                            <Text c="dimmed" ta="center" mt="xl">Aucune activité</Text>
                        )}
                    </ScrollArea>
                </Card>
            </SimpleGrid>
        </Container>
    );
}