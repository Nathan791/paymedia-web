import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Title,
    Text,
    Card,
    Group,
    Badge,
    LoadingOverlay,
    Box,
    SimpleGrid,
    ScrollArea,
    Button,
    Divider,
    ThemeIcon,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconUser,
    IconMail,
    IconMapPin,
    IconCalendar,
    IconShoppingCart,
    IconCoin,
    IconFileText,
    IconEye,
    IconClock,
    IconCheck,
    IconUsers,
} from '@tabler/icons-react';
import { userApi } from '../../api/user.api';
import type { UserDetail } from '../../types';

export default function UserDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchUserDetail(parseInt(id));
        }
    }, [id]);

    const fetchUserDetail = async (userId: number) => {
        try {
            setLoading(true);
            const response = await userApi.getDetail(userId);
            setUser(response.data.data);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container fluid>
                <LoadingOverlay visible={true} />
            </Container>
        );
    }

    if (!user) {
        return (
            <Container fluid>
                <Text>Utilisateur non trouvé</Text>
            </Container>
        );
    }

    // Badge de rôle
    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'red',
            editor: 'blue',
            reader: 'green',
        };
        return <Badge size="lg" color={colors[role] || 'gray'}>{role}</Badge>;
    };

    // Badge de statut
    const getStatusBadge = (isActive: boolean) => {
        return (
            <Badge size="lg" color={isActive ? 'green' : 'red'} variant="light">
                {isActive ? 'Actif' : 'Bloqué'}
            </Badge>
        );
    };

    return (
        <Container fluid>
            <Box pos="relative">
                {/* En-tête avec bouton retour */}
                <Group justify="space-between" mb="lg">
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate('/users')}
                        >
                            Retour
                        </Button>
                        <Title order={2}> Détail sur - {user.username}</Title>
                    </Group>
                    {getRoleBadge(user.role)}
                </Group>

                {/* Profil */}
                <Card withBorder p="xl" radius="md" mb="md">
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconUser size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Nom</Text>
                                <Text fw={500}>{user.username}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconMail size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Email</Text>
                                <Text fw={500}>{user.email}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconMapPin size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Pays</Text>
                                <Text fw={500}>{user.countryCode || 'Non renseigné'}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconCalendar size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Inscrit le</Text>
                                <Text fw={500}>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </Text>
                            </div>
                        </Group>
                    </SimpleGrid>
                    <Divider my="md" />
                    <Group>
                        {getStatusBadge(user.isActive)}
                        <Text size="sm" c="dimmed">ID: #{user.id}</Text>
                    </Group>
                </Card>

                {/* Statistiques adaptées au rôle */}
                <Title order={4} mb="md"> Statistiques</Title>

                {user.role === 'reader' && user.stats && (
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
                        <Card withBorder p="md">
                            <Group>
                                <IconShoppingCart size={24} color="#1976d2" />
                                <div>
                                    <Text size="xs" c="dimmed">Total achats</Text>
                                    <Text fw={700}>{user.stats.totalPurchases || 0}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Card withBorder p="md">
                            <Group>
                                <IconCoin size={24} color="#ed6c02" />
                                <div>
                                    <Text size="xs" c="dimmed">Dépenses totales</Text>
                                    <Text fw={700}>{(user.stats.totalSpent || 0).toLocaleString()} FCFA</Text>
                                </div>
                            </Group>
                        </Card>
                        <Card withBorder p="md">
                            <Group>
                                <IconEye size={24} color="#2e7d32" />
                                <div>
                                    <Text size="xs" c="dimmed">Contenus consultés</Text>
                                    <Text fw={700}>{user.stats.recentlyViewed?.length || 0}</Text>
                                </div>
                            </Group>
                        </Card>
                    </SimpleGrid>
                )}

                {user.role === 'editor' && user.stats && (
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
                        <Card withBorder p="md">
                            <Group>
                                <IconFileText size={24} color="#2e7d32" />
                                <div>
                                    <Text size="xs" c="dimmed">Contenus publiés</Text>
                                    <Text fw={700}>{user.stats.totalContents || 0}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Card withBorder p="md">
                            <Group>
                                <IconCoin size={24} color="#ed6c02" />
                                <div>
                                    <Text size="xs" c="dimmed">Revenus générés</Text>
                                    <Text fw={700}>{(user.stats.totalRevenue || 0).toLocaleString()} FCFA</Text>
                                </div>
                            </Group>
                        </Card>
                        <Card withBorder p="md">
                            <Group>
                                <IconCoin size={24} color="#6a1b9a" />
                                <div>
                                    <Text size="xs" c="dimmed">Commissions</Text>
                                    <Text fw={700}>{(user.stats.totalCommission || 0).toLocaleString()} FCFA</Text>
                                </div>
                            </Group>
                        </Card>
                    </SimpleGrid>
                )}

                {user.role === 'admin' && user.stats && (
                    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
                        <Card withBorder p="md">
                            <Group>
                                <IconUsers size={24} color="#6a1b9a" />
                                <div>
                                    <Text size="xs" c="dimmed">Actions admin</Text>
                                    <Text fw={700}>{user.stats.totalActions || 0}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Card withBorder p="md">
                            <Group>
                                <IconCheck size={24} color="#2e7d32" />
                                <div>
                                    <Text size="xs" c="dimmed">Modérations effectuées</Text>
                                    <Text fw={700}>{user.stats.totalModerations || 0}</Text>
                                </div>
                            </Group>
                        </Card>
                        <Card withBorder p="md">
                            <Group>
                                <IconClock size={24} color="#1976d2" />
                                <div>
                                    <Text size="xs" c="dimmed">Dernière action</Text>
                                    <Text fw={700}>
                                        {user.stats.recentActions && user.stats.recentActions.length > 0
                                            ? new Date(user.stats.recentActions[0].date).toLocaleDateString()
                                            : 'N/A'}
                                    </Text>
                                </div>
                            </Group>
                        </Card>
                    </SimpleGrid>
                )}

                {/* Activité récente (spécifique au rôle) */}
                {user.role === 'reader' && user.stats?.recentlyViewed && user.stats.recentlyViewed.length > 0 && (
                    <Card withBorder p="lg" radius="md">
                        <Title order={5} mb="md"> Derniers contenus consultés</Title>
                        <ScrollArea>
                            {user.stats.recentlyViewed.map((item, index) => (
                                <Group key={index} justify="space-between" p="xs" style={{ borderBottom: index < (user.stats?.recentlyViewed?.length ?? 1) - 1 ? '1px solid #eee' : 'none' }}>
                                    <Text>{item.title}</Text>
                                    <Text size="xs" c="dimmed">{new Date(item.viewedAt).toLocaleString()}</Text>
                                </Group>
                            ))}
                        </ScrollArea>
                    </Card>
                )}

                {user.role === 'editor' && user.stats?.topContents && user.stats.topContents.length > 0 && (
                    <Card withBorder p="lg" radius="md">
                        <Title order={5} mb="md"> Top contenus</Title>
                        <ScrollArea>
                            {user.stats.topContents.map((content, index) => (
                                <Group key={index} justify="space-between" p="xs" style={{ borderBottom: index < (user.stats?.topContents?.length ?? 1) - 1 ? '1px solid #eee' : 'none' }}>
                                    <Text>{content.title}</Text>
                                    <Group>
                                        <Badge size="sm" color="blue">{content.sales} ventes</Badge>
                                        <Badge size="sm" color="green">{content.revenue.toLocaleString()} FCFA</Badge>
                                    </Group>
                                </Group>
                            ))}
                        </ScrollArea>
                    </Card>
                )}

                {user.role === 'admin' && user.stats?.recentActions && user.stats.recentActions.length > 0 && (
                    <Card withBorder p="lg" radius="md">
                        <Title order={5} mb="md"> Dernières actions</Title>
                        <ScrollArea>
                            {user.stats.recentActions.map((action, index) => (
                                <Group key={index} justify="space-between" p="xs" style={{ borderBottom: index < (user.stats?.recentActions?.length ?? 1) - 1 ? '1px solid #eee' : 'none' }}>
                                    <Text>{action.action}</Text>
                                    <Text size="xs" c="dimmed">{action.target}</Text>
                                    <Text size="xs" c="dimmed">{new Date(action.date).toLocaleString()}</Text>
                                </Group>
                            ))}
                        </ScrollArea>
                    </Card>
                )}
            </Box>
        </Container>
    );
}