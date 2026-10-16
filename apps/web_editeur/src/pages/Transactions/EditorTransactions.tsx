// src/pages/Transactions/EditorTransactions.tsx
import { useEffect, useState } from 'react';
import {
    Container, Text, Group, Stack, Table, Badge, Loader, Center, TextInput,
    SegmentedControl, Paper, Alert, ThemeIcon,
} from '@mantine/core';
import { IconSearch, IconAlertTriangle } from '@tabler/icons-react';
import { useTransactionStore } from '@/stores/transaction.store';
import { TRANSACTION_STATUS_COLORS, TRANSACTION_TYPE_LABELS } from '@/models';

const METHOD_LABELS: Record<string, string> = {
    orange_money: 'Orange Money',
    mtn_momo: 'MTN MoMo',
    carte_bancaire: 'Carte bancaire',
    wave: 'Wave',
};

export function EditorTransactions() {
    const { transactions, isLoading, fetchTransactions } = useTransactionStore();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const flaggedCount = transactions.filter((t) => t.status === 'flagged').length;

    const filtered = transactions.filter((t) => {
        const matchFilter = filter === 'all' || t.status === filter;
        const matchSearch = !search || (t.contentTitle ?? '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    if (isLoading && transactions.length === 0) {
        return <Container size="xl" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    return (
        <Container size="xl" py="xl">
            <Text size="sm" c="dimmed" mb="lg">
                {transactions.length} transaction{transactions.length > 1 ? 's' : ''} enregistrée{transactions.length > 1 ? 's' : ''}
            </Text>

            {flaggedCount > 0 && (
                <Alert color="red" mb="lg" icon={<IconAlertTriangle size={16} />}>
                    {flaggedCount} transaction{flaggedCount > 1 ? 's' : ''} signalée{flaggedCount > 1 ? 's' : ''} comme anomalie — vérifiez le détail ci-dessous.
                </Alert>
            )}

            <Paper radius="lg" p="md" mb="lg">
                <Group justify="space-between" wrap="wrap">
                    <SegmentedControl
                        value={filter}
                        onChange={setFilter}
                        data={[
                            { value: 'all', label: 'Toutes' },
                            { value: 'completed', label: 'Complétées' },
                            { value: 'pending', label: 'En attente' },
                            { value: 'flagged', label: 'Anomalies' },
                        ]}
                    />
                    <TextInput
                        placeholder="Rechercher par contenu..."
                        leftSection={<IconSearch size={16} />}
                        value={search} onChange={(e) => setSearch(e.currentTarget.value)} w={260}
                    />
                </Group>
            </Paper>

            <Paper radius="lg" p="0" style={{ overflow: 'auto' }}>
                <Table striped highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Contenu</Table.Th>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Moyen de paiement</Table.Th>
                            <Table.Th>Montant</Table.Th>
                            <Table.Th>Commission</Table.Th>
                            <Table.Th>Net</Table.Th>
                            <Table.Th>Statut</Table.Th>
                            <Table.Th>Date</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filtered.map((t) => (
                            <Table.Tr key={t.id}>
                                <Table.Td>
                                    <Text size="sm" fw={500} lineClamp={1} maw={260}>
                                        {t.contentTitle ?? TRANSACTION_TYPE_LABELS[t.type]}
                                    </Text>
                                    {t.anomalyReason && (
                                        <Group gap={4} mt={2}>
                                            <ThemeIcon size={14} color="red" variant="transparent"><IconAlertTriangle size={12} /></ThemeIcon>
                                            <Text size="xs" c="red" lineClamp={1}>{t.anomalyReason}</Text>
                                        </Group>
                                    )}
                                </Table.Td>
                                <Table.Td><Badge variant="outline" color="gray" size="sm">{TRANSACTION_TYPE_LABELS[t.type]}</Badge></Table.Td>
                                <Table.Td>{METHOD_LABELS[t.paymentMethod]}</Table.Td>
                                <Table.Td>{t.amount.toLocaleString('fr-FR')} {t.currency}</Table.Td>
                                <Table.Td c="dimmed">− {t.commission.toLocaleString('fr-FR')} {t.currency}</Table.Td>
                                <Table.Td fw={600}>{t.net.toLocaleString('fr-FR')} {t.currency}</Table.Td>
                                <Table.Td>
                                    <Badge color={TRANSACTION_STATUS_COLORS[t.status]} variant="light">
                                        {t.status === 'completed' ? 'Complétée' : t.status === 'pending' ? 'En attente' : t.status === 'flagged' ? 'Anomalie' : 'Échouée'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Container>
    );
}
