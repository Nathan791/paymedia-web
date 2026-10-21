// src/pages/Analytics/EditorContentAnalytics.tsx
//
// Analytics détaillée pour UN contenu (Master Prompt §19). Les chiffres du
// haut viennent directement de content.stats (déjà affichés sur la fiche
// contenu) ; la courbe et la ventilation par point d'accès sont propres à
// cette page — jamais de doublon de logique de calcul entre les deux écrans.
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Paper, Title, Text, Button, Group, Stack, Loader, Alert, Box,
    SimpleGrid, ThemeIcon, Badge, Table, Center,
} from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import {
    IconArrowLeft, IconAlertCircle, IconEye, IconShoppingCart, IconTrendingUp,
    IconCoin, IconQrcode, IconHash, IconWaveSine,
} from '@tabler/icons-react';
import { useContentStore } from '@/stores/content.store';
import { useAnalyticsStore } from '@/stores/analytics.store';
import { useAccessStore } from '@/stores/access.store';
import { AccessPointType, conversionRate } from '@/models';

const TYPE_ICON: Record<AccessPointType, any> = {
    qr_code: IconQrcode,
    short_code: IconHash,
    audio_watermark: IconWaveSine,
};

export function EditorContentAnalytics() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { currentContent, fetchContents, isLoading: isContentLoading, error: contentError } = useContentStore();
    const { contentSeries, isContentSeriesLoading, fetchContentSeries, error: seriesError } = useAnalyticsStore();
    const { accessPoints, fetchAccessPoints } = useAccessStore();

    useEffect(() => {
        if (id) {
            // Utilisation de fetchContents ou de la méthode de récupération globale
            fetchContents();
            fetchContentSeries(id);
            fetchAccessPoints(id);
        }
    }, [id, fetchContents, fetchContentSeries, fetchAccessPoints]);

    const series = id ? contentSeries[id] : undefined;

    if (isContentLoading && !currentContent) {
        return <Container size="lg" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }
    if (!currentContent) {
        return <Container size="lg" py="xl">{contentError && <Alert color="red" icon={<IconAlertCircle size={16} />}>{contentError}</Alert>}</Container>;
    }

    const c = currentContent;

    return (
        <Container size="lg" py="xl">
            <Group mb="lg">
                <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate(`/editor/contents/${id}`)}>
                    Retour au contenu
                </Button>
            </Group>

            <Stack gap={2} mb="xl">
                <Title order={2} style={{ fontFamily: 'Fraunces, serif' }} fw={600}>Statistiques détaillées</Title>
                <Text size="sm" c="dimmed">{c.title}</Text>
            </Stack>

            {(seriesError) && (
                <Alert color="red" title="Erreur" mb="md" icon={<IconAlertCircle size={16} />}>{seriesError}</Alert>
            )}

            {c.status !== 'published' ? (
                <Alert color="yellow" icon={<IconAlertCircle size={16} />}>
                    Ce contenu n'est pas encore publié — les statistiques ne sont disponibles qu'une fois le contenu en ligne.
                </Alert>
            ) : (
                <>
                    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
                        <StatBlock icon={IconEye} label="Vues" value={c.stats.views.toLocaleString('fr-FR')} />
                        <StatBlock icon={IconShoppingCart} label="Achats" value={c.stats.purchases.toLocaleString('fr-FR')} />
                        <StatBlock icon={IconTrendingUp} label="Conversion" value={`${c.stats.conversionRate}%`} />
                        <StatBlock icon={IconCoin} label="Revenu" value={`${c.stats.revenue.toLocaleString('fr-FR')} ${c.currency}`} color="gold" />
                    </SimpleGrid>

                    <Paper radius="lg" p="xl" mb="xl">
                        <Text fw={600} size="sm" mb="md">Évolution — 30 derniers jours</Text>
                        {isContentSeriesLoading && !series ? (
                            <Center h={280}><Loader color="forest" /></Center>
                        ) : series && series.length > 0 ? (
                            <AreaChart
                                h={280}
                                data={series}
                                dataKey="date"
                                series={[
                                    { name: 'views', color: 'ink.4', label: 'Vues' },
                                    { name: 'purchases', color: 'forest.5', label: 'Achats' },
                                ]}
                                curveType="monotone"
                                withGradient
                                withDots={false}
                                gridAxis="y"
                                xAxisProps={{ tickFormatter: (v: string) => v.slice(5) }}
                            />
                        ) : (
                            <Center h={120}><Text size="sm" c="dimmed">Pas assez de données pour tracer une courbe.</Text></Center>
                        )}
                    </Paper>

                    <Paper radius="lg" p="0" style={{ overflow: 'auto' }}>
                        <Group p="lg" pb="sm">
                            <Text fw={600} size="sm">D'où viennent les lecteurs — par point d'accès</Text>
                        </Group>
                        {accessPoints.length === 0 ? (
                            <Center py="lg"><Text size="sm" c="dimmed">Aucun point d'accès pour ce contenu.</Text></Center>
                        ) : (
                            <Table striped highlightOnHover verticalSpacing="sm">
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Point d'accès</Table.Th>
                                        <Table.Th>Scans</Table.Th>
                                        <Table.Th>Visites</Table.Th>
                                        <Table.Th>Achats</Table.Th>
                                        <Table.Th>Conversion</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {accessPoints.map((a) => {
                                        const Icon = TYPE_ICON[a.type];
                                        return (
                                            <Table.Tr key={a.id}>
                                                <Table.Td>
                                                    <Group gap={8} wrap="nowrap">
                                                        <Icon size={14} color="var(--mantine-color-forest-6)" />
                                                        <Text size="sm">{a.label}</Text>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>{a.stats.scans.toLocaleString('fr-FR')}</Table.Td>
                                                <Table.Td>{a.stats.visits.toLocaleString('fr-FR')}</Table.Td>
                                                <Table.Td>{a.stats.purchases.toLocaleString('fr-FR')}</Table.Td>
                                                <Table.Td><Badge variant="light" color="gray">{conversionRate(a.stats)}%</Badge></Table.Td>
                                            </Table.Tr>
                                        );
                                    })}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Paper>
                </>
            )}
        </Container>
    );
}

function StatBlock({ icon: Icon, label, value, color = 'forest' }: { icon: any; label: string; value: string; color?: string }) {
    return (
        <Box>
            <ThemeIcon variant="light" color={color} size={34} radius="md" mb={6}><Icon size={17} /></ThemeIcon>
            <Text size="xs" c="dimmed">{label}</Text>
            <Text fw={700} size="lg">{value}</Text>
        </Box>
    );
}