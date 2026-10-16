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
    IconCoin,
    IconCalendar,
    IconTrendingUp,
    IconTrendingDown,
    IconCheck,
    IconClock,
    IconX,
    IconChartBar,
} from '@tabler/icons-react';
import { commissionApi } from '../../api/commission.api';
import type { CommissionDetail } from '../../types';

export default function CommissionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [commission, setCommission] = useState<CommissionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchCommissionDetail(parseInt(id));
        }
    }, [id]);

    const fetchCommissionDetail = async (commissionId: number) => {
        try {
            setLoading(true);
            const response = await commissionApi.getDetail(commissionId);
            setCommission(response.data.data);
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

    if (!commission) {
        return (
            <Container fluid>
                <Text>Commission non trouvée</Text>
            </Container>
        );
    }

    //  Couleurs des statuts
    const statusColors: Record<string, string> = {
        paid: 'green',
        pending: 'yellow',
        published: 'blue',
    };

    // Icônes des statuts
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <IconCheck size={16} />;
            case 'pending': return <IconClock size={16} />;
            case 'published': return <IconChartBar size={16} />;
            default: return null;
        }
    };

    //  Libellés des statuts
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Payée';
            case 'pending': return 'En attente';
            case 'published': return 'Publiée';
            default: return status;
        }
    };

    //  Icône de tendance
    const getTrendIcon = (value: number) => {
        if (value > 0) return <IconTrendingUp size={16} color="green" />;
        if (value < 0) return <IconTrendingDown size={16} color="red" />;
        return null;
    };

    return (
        <Container fluid>
            <Box pos="relative">
                {/*  En-tête avec bouton retour */}
                <Group justify="space-between" mb="lg">
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate('/commissions')}
                        >
                            Retour
                        </Button>
                        <Title order={2}> Détail - Commission #{commission.id}</Title>
                    </Group>
                    <Badge size="lg" color={statusColors[commission.status]} variant="light">
                        {getStatusIcon(commission.status)} {getStatusLabel(commission.status)}
                    </Badge>
                </Group>

                {/*  Informations principales */}
                <Card withBorder p="xl" radius="md" mb="md">
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconUser size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Éditeur</Text>
                                <Text fw={500} size="lg">{commission.editor}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="green" variant="light">
                                <IconCoin size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Montant</Text>
                                <Text fw={700} size="xl" color="green">
                                    {commission.amount.toLocaleString()} FCFA
                                </Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="gray" variant="light">
                                <IconCalendar size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Mois</Text>
                                <Text fw={500}>{commission.month}</Text>
                            </div>
                        </Group>
                    </SimpleGrid>
                </Card>

                {/*  Statistiques de l'éditeur */}
                <Title order={4} mb="md"> Statistiques de l'éditeur</Title>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
                    <Card withBorder p="md">
                        <Group>
                            <IconCoin size={24} color="#1976d2" />
                            <div>
                                <Text size="xs" c="dimmed">Total commissions</Text>
                                <Text fw={700}>{commission.stats.totalCommissions.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconChartBar size={24} color="#2e7d32" />
                            <div>
                                <Text size="xs" c="dimmed">Commission moyenne</Text>
                                <Text fw={700}>{commission.stats.averageCommission.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconCheck size={24} color="#2e7d32" />
                            <div>
                                <Text size="xs" c="dimmed">Déjà payé</Text>
                                <Text fw={700}>{commission.stats.totalPaid.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconClock size={24} color="#ed6c02" />
                            <div>
                                <Text size="xs" c="dimmed">En attente</Text>
                                <Text fw={700}>{commission.stats.totalPending.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/*  Historique des commissions */}
                {commission.history && commission.history.length > 0 && (
                    <Card withBorder p="lg" radius="md">
                        <Title order={5} mb="md"> Historique des commissions</Title>
                        <ScrollArea>
                            {commission.history.map((item, index) => (
                                <Group
                                    key={item.id}
                                    justify="space-between"
                                    p="xs"
                                    style={{
                                        borderBottom: index < commission.history!.length - 1 ? '1px solid #eee' : 'none',
                                        backgroundColor: item.id === commission.id ? '#f0f7ff' : 'transparent',
                                    }}
                                >
                                    <Group>
                                        <Badge size="sm" color={statusColors[item.status] || 'gray'}>
                                            {getStatusLabel(item.status)}
                                        </Badge>
                                        <Text size="sm">{item.amount.toLocaleString()} FCFA</Text>
                                    </Group>
                                    <Group>
                                        <Text size="xs" c="dimmed">{item.month}</Text>
                                        {item.id === commission.id && (
                                            <Badge size="xs" color="blue">En cours</Badge>
                                        )}
                                    </Group>
                                </Group>
                            ))}
                        </ScrollArea>
                    </Card>
                )}
            </Box>
        </Container>
    );
}