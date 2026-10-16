// src/pages/Analytics/EditorAnalytics.tsx
import { useEffect } from 'react';
import { Container, Paper, Text, Group, Loader, Center, SimpleGrid, Table, Badge } from '@mantine/core';
import { AreaChart, BarChart } from '@mantine/charts';
import { useAnalyticsStore } from '@/stores/analytics.store';

export function EditorAnalytics() {
    const { revenueSeries, topContents, kpi, isLoading, fetchDashboard } = useAnalyticsStore();

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    if (isLoading && revenueSeries.length === 0) {
        return <Container size="xl" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    return (
        <Container size="xl" py="xl">
            <Text size="sm" c="dimmed" mb="lg">
                Analyse détaillée de vos performances sur les 30 derniers jours
            </Text>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" mb="xl">
                <Paper radius="lg" p="xl">
                    <Text fw={600} size="sm" mb="md">Revenus quotidiens</Text>
                    <AreaChart
                        h={260} data={revenueSeries} dataKey="date"
                        series={[{ name: 'revenue', color: 'forest.5', label: 'Revenu' }]}
                        curveType="monotone" withGradient withDots={false} gridAxis="y"
                        xAxisProps={{ tickFormatter: (v: string) => v.slice(5) }}
                        valueFormatter={(v) => `${v.toLocaleString('fr-FR')} XAF`}
                    />
                </Paper>

                <Paper radius="lg" p="xl">
                    <Text fw={600} size="sm" mb="md">Ventes quotidiennes</Text>
                    <BarChart
                        h={260} data={revenueSeries} dataKey="date"
                        series={[{ name: 'sales', color: 'ink.5', label: 'Ventes' }]}
                        gridAxis="y"
                        xAxisProps={{ tickFormatter: (v: string) => v.slice(5) }}
                    />
                </Paper>
            </SimpleGrid>

            <Paper radius="lg" p="0" style={{ overflow: 'auto' }}>
                <Group p="lg" pb="sm" justify="space-between">
                    <Text fw={600} size="sm">Performance par contenu</Text>
                    {kpi && <Badge variant="light" color="gray">{kpi.publishedContents} contenus publiés</Badge>}
                </Group>
                <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Contenu</Table.Th>
                            <Table.Th>Vues</Table.Th>
                            <Table.Th>Achats</Table.Th>
                            <Table.Th>Conversion</Table.Th>
                            <Table.Th>Revenu</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {topContents.map((tc) => (
                            <Table.Tr key={tc.contentId}>
                                <Table.Td><Text size="sm" fw={500} lineClamp={1} maw={320}>{tc.title}</Text></Table.Td>
                                <Table.Td>{tc.views.toLocaleString('fr-FR')}</Table.Td>
                                <Table.Td>{tc.purchases.toLocaleString('fr-FR')}</Table.Td>
                                <Table.Td>{tc.conversionRate}%</Table.Td>
                                <Table.Td fw={600}>{tc.revenue.toLocaleString('fr-FR')} XAF</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Container>
    );
}
