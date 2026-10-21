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
    ThemeIcon,
} from '@mantine/core';
import {
    IconArrowLeft,
    IconUser,
    IconCoin,
    IconCalendar,
    IconShoppingCart,
    IconWallet,
    IconTrendingUp,
    IconClock,
    IconCheck,
    IconX,
} from '@tabler/icons-react';
import { transactionApi } from '../../api/transaction.api';
import type { TransactionDetail } from '../../types';

export default function TransactionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTransactionDetail(parseInt(id));
        }
    }, [id]);

    const fetchTransactionDetail = async (transactionId: number) => {
        try {
            setLoading(true);
            const response = await transactionApi.getDetail(transactionId);
            setTransaction(response.data.data);
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

    if (!transaction) {
        return (
            <Container fluid>
                <Text>Transaction non trouvée</Text>
            </Container>
        );
    }

    // Couleurs des statuts
    const statusColors: Record<string, string> = {
        completed: 'green',
        pending: 'yellow',
        failed: 'red',
    };

    // Icônes des types
    const typeIcons: Record<string, { icon: any; label: string; color: string }> = {
        recharge: { icon: IconWallet, label: 'Recharge', color: 'green' },
        achat: { icon: IconShoppingCart, label: 'Achat', color: 'blue' },
        reversement: { icon: IconTrendingUp, label: 'Reversement', color: 'orange' },
    };

    const typeInfo = typeIcons[transaction.type] || { icon: IconCoin, label: transaction.type, color: 'gray' };
    const TypeIcon = typeInfo.icon;

    // Icône de statut
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <IconCheck size={16} />;
            case 'pending': return <IconClock size={16} />;
            case 'failed': return <IconX size={16} />;
            default: return null;
        }
    };

    // Format de date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
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
                            onClick={() => navigate('/transactions')}
                        >
                            Retour
                        </Button>
                        <Title order={2}>Détail - Transaction #{transaction.id}</Title>
                    </Group>
                    <Badge size="lg" color={statusColors[transaction.status]} variant="light">
                        {getStatusIcon(transaction.status)} {transaction.status}
                    </Badge>
                </Group>

                {/* Informations principales */}
                <Card withBorder p="xl" radius="md" mb="md">
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color={typeInfo.color} variant="light">
                                <TypeIcon size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Type</Text>
                                <Text fw={500}>{typeInfo.label}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconCoin size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Montant</Text>
                                <Text fw={700} size="lg" c={transaction.type === 'recharge' ? 'green' : 'blue'}>
                                    {transaction.amount.toLocaleString()} FCFA
                                </Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="gray" variant="light">
                                <IconCalendar size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Date</Text>
                                <Text fw={500}>{formatDate(transaction.date)}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconUser size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Utilisateur</Text>
                                <Text fw={500}>{transaction.user}</Text>
                            </div>
                        </Group>
                    </SimpleGrid>
                </Card>

                {/* Statistiques de l'utilisateur */}
                <Title order={4} mb="md">Statistiques de l'utilisateur</Title>

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
                    <Card withBorder p="md">
                        <Group>
                            <IconWallet size={24} color="#1976d2" />
                            <div>
                                <Text size="xs" c="dimmed">Total transactions</Text>
                                <Text fw={700}>{transaction.userStats.totalTransactions}</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconCoin size={24} color="#2e7d32" />
                            <div>
                                <Text size="xs" c="dimmed">Dépenses totales</Text>
                                <Text fw={700}>{transaction.userStats.totalSpent.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconTrendingUp size={24} color="#ed6c02" />
                            <div>
                                <Text size="xs" c="dimmed">Panier moyen</Text>
                                <Text fw={700}>{transaction.userStats.averageAmount.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Historique de l'utilisateur */}
                {transaction.userHistory && transaction.userHistory.length > 0 && (
                    <Card withBorder p="lg" radius="md">
                        <Title order={5} mb="md">Historique des transactions</Title>
                        <ScrollArea>
                            {transaction.userHistory.map((item, index) => (
                                <Group
                                    key={item.id}
                                    justify="space-between"
                                    p="xs"
                                    style={{
                                        borderBottom: index < transaction.userHistory!.length - 1 ? '1px solid #eee' : 'none',
                                        backgroundColor: item.id === transaction.id ? '#f0f7ff' : 'transparent',
                                    }}
                                >
                                    <Group>
                                        <Badge size="sm" color={typeIcons[item.type]?.color || 'gray'}>
                                            {typeIcons[item.type]?.label || item.type}
                                        </Badge>
                                        <Text size="sm">{item.amount.toLocaleString()} FCFA</Text>
                                    </Group>
                                    <Group>
                                        <Badge size="sm" color={statusColors[item.status]} variant="light">
                                            {item.status}
                                        </Badge>
                                        <Text size="xs" c="dimmed">{formatDate(item.date)}</Text>
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