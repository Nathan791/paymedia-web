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
    IconCategory,
    IconFileText,
    IconCoin,
    IconEye,
    IconDownload,
    IconShoppingCart,
} from '@tabler/icons-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { contentApi } from '../../api/content.api';
import type { ContentDetail } from '../../types';

export default function ContentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [content, setContent] = useState<ContentDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchContentDetail(parseInt(id));
        }
    }, [id]);

    const fetchContentDetail = async (contentId: number) => {
        try {
            setLoading(true);
            const response = await contentApi.getDetail(contentId);
            setContent(response.data.data);
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

    if (!content) {
        return (
            <Container fluid>
                <Text>Contenu non trouvé</Text>
            </Container>
        );
    }

    //  Badge de statut
    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; label: string }> = {
            draft: { color: 'gray', label: 'Brouillon' },
            pending: { color: 'yellow', label: 'En attente' },
            published: { color: 'green', label: 'Publié' },
            blocked: { color: 'red', label: 'Bloqué' },
            archived: { color: 'blue', label: 'Archivé' },
        };
        const { color, label } = config[status] || { color: 'gray', label: status };
        return <Badge size="lg" color={color}>{label}</Badge>;
    };

    //  Icône pour le type de média
    const getMediaIcon = (type: string) => {
        switch (type) {
            case 'video': return '🎬';
            case 'audio': return '🎵';
            case 'epub': return '📖';
            default: return '📄';
        }
    };

    return (
        <Container fluid>
            <Box pos="relative">
                <Group justify="space-between" mb="lg">
                    <Group>
                        <Button
                            variant="light"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate('/contents')}
                        >
                            Retour
                        </Button>
                        <Title order={2}> plus de Détail sur - {content.title}</Title>
                    </Group>
                    {getStatusBadge(content.status)}
                </Group>

                {/*  Métadonnées */}
                <Card withBorder p="xl" radius="md" mb="md">
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                                <IconUser size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Auteur</Text>
                                <Text fw={500}>{content.author?.username || 'Inconnu'}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="violet" variant="light">
                                <IconCategory size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Catégorie</Text>
                                <Text fw={500}>{content.category || 'Non catégorisé'}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="grape" variant="light">
                                <IconFileText size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Type</Text>
                                <Text fw={500}>{getMediaIcon(content.mediaType)} {content.mediaType}</Text>
                            </div>
                        </Group>
                        <Group>
                            <ThemeIcon size="lg" radius="xl" color="orange" variant="light">
                                <IconCoin size={20} />
                            </ThemeIcon>
                            <div>
                                <Text size="xs" c="dimmed">Prix</Text>
                                <Text fw={500}>{content.price.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </SimpleGrid>
                    <Divider my="md" />
                    <Group>
                        {content.isPremium && (
                            <Badge color="gold" variant="filled">⭐ Premium</Badge>
                        )}
                        <Text size="sm" c="dimmed">ID: #{content.id}</Text>
                        {content.publishedAt && (
                            <Text size="sm" c="dimmed">
                                Publié le : {new Date(content.publishedAt).toLocaleDateString()}
                            </Text>
                        )}
                    </Group>
                </Card>

                {/*  Statistiques */}
                <Title order={4} mb="md"> Statistiques</Title>

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="md">
                    <Card withBorder p="md">
                        <Group>
                            <IconEye size={24} color="#1976d2" />
                            <div>
                                <Text size="xs" c="dimmed">Vues</Text>
                                <Text fw={700}>{content.stats.views.toLocaleString()}</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconDownload size={24} color="#2e7d32" />
                            <div>
                                <Text size="xs" c="dimmed">Téléchargements</Text>
                                <Text fw={700}>{content.stats.downloads.toLocaleString()}</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconShoppingCart size={24} color="#ed6c02" />
                            <div>
                                <Text size="xs" c="dimmed">Achats</Text>
                                <Text fw={700}>{content.stats.purchases.toLocaleString()}</Text>
                            </div>
                        </Group>
                    </Card>
                    <Card withBorder p="md">
                        <Group>
                            <IconCoin size={24} color="#6a1b9a" />
                            <div>
                                <Text size="xs" c="dimmed">Revenus générés</Text>
                                <Text fw={700}>{content.stats.revenue.toLocaleString()} FCFA</Text>
                            </div>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/*  Graphique d'évolution */}
                {content.status === 'published' && (
                    <Card withBorder p="lg" radius="md" mb="md">
                        <Title order={5} mb="md">Évolution des ventes (30 jours)</Title>
                        <Box style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={content.chartData.labels.map((label, index) => ({
                                    day: label,
                                    ventes: content.chartData.sales[index] || 0,
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="ventes"
                                        stroke="#1976d2"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </Box>
                    </Card>
                )}

                {/*  Historique de modération */}
                {content.moderationHistory && content.moderationHistory.length > 0 && (
                    <Card withBorder p="lg" radius="md">
                        <Title order={5} mb="md"> Historique de modération</Title>
                        <ScrollArea>
                            {content.moderationHistory.map((item, index) => (
                                <Group
                                    key={item.id}
                                    justify="space-between"
                                    p="xs"
                                    style={{
                                        borderBottom: index < content.moderationHistory!.length - 1 ? '1px solid #eee' : 'none',
                                    }}
                                >
                                    <Group>
                                        <Badge size="sm" color={item.action === 'Approuvé' ? 'green' : 'blue'}>
                                            {item.action}
                                        </Badge>
                                        <Text size="sm">{item.comment}</Text>
                                    </Group>
                                    <Group>
                                        <Text size="xs" c="dimmed">{item.moderator}</Text>
                                        <Text size="xs" c="dimmed">
                                            {new Date(item.date).toLocaleString()}
                                        </Text>
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