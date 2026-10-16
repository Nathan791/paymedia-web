// src/pages/Revenue/EditorRevenue.tsx
//
// "Ne jamais laisser l'utilisateur deviner pourquoi les montants diffèrent"
// (Master Prompt §21/§25) : le brut, la commission et le net sont toujours
// affichés ensemble, jamais un chiffre seul sans son contexte. Les montants
// financiers sont calculés à partir des transactions (source de vérité) —
// jamais recalculés "à la main" avec une formule locale qui pourrait
// diverger du backend plus tard.
import { useEffect, useMemo, useState } from 'react';
import {
    Container, Paper, Text, Group, Stack, Button, NumberInput, Select, Badge,
    Table, Loader, Center, ThemeIcon, SimpleGrid, Alert, Divider,
} from '@mantine/core';
import { IconWallet, IconArrowUpRight, IconCheck, IconClock, IconX, IconAlertCircle, IconReceipt2 } from '@tabler/icons-react';
import { useTransactionStore } from '@/stores/transaction.store';
import { useAuthStore } from '@/stores/auth.store';
import { notifications } from '@mantine/notifications';

const PAYOUT_STATUS: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'En attente', color: 'gold', icon: IconClock },
    processing: { label: 'En cours', color: 'gold', icon: IconClock },
    paid: { label: 'Payé', color: 'forest', icon: IconCheck },
    rejected: { label: 'Rejeté', color: 'red', icon: IconX },
};

export function EditorRevenue() {
    const user = useAuthStore((s) => s.user);
    const { transactions, payouts, isSaving, error, fetchTransactions, fetchPayouts, requestPayout, clearError } = useTransactionStore();

    const [amount, setAmount] = useState<number | ''>('');
    const [destination, setDestination] = useState<string | null>('MTN MoMo •••• 4821');

    useEffect(() => {
        fetchTransactions();
        fetchPayouts();
    }, [fetchTransactions, fetchPayouts]);

    // Ventilation brut → commission → net, calculée uniquement à partir des
    // ventes effectivement complétées (pas les remboursements, pas les
    // paiements échoués/en attente).
    const breakdown = useMemo(() => {
        const completedSales = transactions.filter((t) => t.type === 'purchase' && t.status === 'completed');
        const gross = completedSales.reduce((sum, t) => sum + t.amount, 0);
        const commission = completedSales.reduce((sum, t) => sum + t.commission, 0);
        const net = completedSales.reduce((sum, t) => sum + t.net, 0);
        return { gross, commission, net, count: completedSales.length };
    }, [transactions]);

    const handleRequest = async () => {
        if (!amount || !destination || !user) return;
        try {
            await requestPayout(Number(amount), user.walletBalance, destination);
            notifications.show({ title: 'Demande envoyée', message: 'Votre reversement est en cours de traitement.', color: 'forest' });
            setAmount('');
        } catch {
            // l'erreur est déjà affichée via le store
        }
    };

    return (
        <Container size="lg" py="xl">
            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            {/* Ventilation brut / commission / net — jamais un chiffre isolé */}
            <Paper radius="lg" p="xl" mb="xl">
                <Group gap="sm" mb="lg">
                    <ThemeIcon variant="light" color="gold" size={36} radius="md"><IconReceipt2 size={18} /></ThemeIcon>
                    <Text fw={600} size="sm">D'où viennent vos revenus — {breakdown.count} vente{breakdown.count > 1 ? 's' : ''}</Text>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                    <Stack gap={2}>
                        <Text size="xs" c="dimmed">Ventes brutes</Text>
                        <Text size="lg" fw={700}>{breakdown.gross.toLocaleString('fr-FR')} XAF</Text>
                    </Stack>
                    <Stack gap={2}>
                        <Text size="xs" c="dimmed">− Commission PayMedia</Text>
                        <Text size="lg" fw={700} c="red.7">− {breakdown.commission.toLocaleString('fr-FR')} XAF</Text>
                    </Stack>
                    <Stack gap={2}>
                        <Text size="xs" c="dimmed">= Revenus éditeur</Text>
                        <Text size="lg" fw={700} c="forest.7">{breakdown.net.toLocaleString('fr-FR')} XAF</Text>
                    </Stack>
                </SimpleGrid>
            </Paper>

            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" mb="xl">
                <Paper radius="lg" p="xl">
                    <Group gap="sm" mb="md">
                        <ThemeIcon variant="light" color="gold" size={40} radius="md"><IconWallet size={20} /></ThemeIcon>
                        <div>
                            <Text size="xs" c="dimmed">Solde disponible</Text>
                            <Text size="xl" fw={700} style={{ fontFamily: 'Fraunces, serif' }}>
                                {user?.walletBalance.toLocaleString('fr-FR')} {user?.walletCurrency}
                            </Text>
                        </div>
                    </Group>
                    <Text size="xs" c="dimmed">
                        Les reversements sont traités sous 24 à 48h ouvrées vers votre moyen de paiement enregistré.
                    </Text>
                </Paper>

                <Paper radius="lg" p="xl">
                    <Text fw={600} size="sm" mb="md">Demander un reversement</Text>
                    <Stack gap="sm">
                        <NumberInput
                            label="Montant" placeholder="0" min={0} step={1000}
                            value={amount} onChange={(v) => setAmount(v as number)}
                            rightSection={<Text size="xs" c="dimmed" pr="xs">XAF</Text>} rightSectionWidth={50}
                        />
                        <Select
                            label="Destination" data={['MTN MoMo •••• 4821', 'Orange Money •••• 2201']}
                            value={destination} onChange={setDestination}
                        />
                        <Button
                            leftSection={<IconArrowUpRight size={16} />} loading={isSaving}
                            disabled={!amount || Number(amount) <= 0}
                            onClick={handleRequest}
                        >
                            Envoyer la demande
                        </Button>
                    </Stack>
                </Paper>
            </SimpleGrid>

            <Paper radius="lg" p="0" style={{ overflow: 'auto' }} mb="xl">
                <Group p="lg" pb="sm">
                    <Text fw={600} size="sm">Historique des reversements</Text>
                </Group>
                {payouts.length === 0 ? (
                    <Center py="xl"><Text size="sm" c="dimmed">Aucun reversement pour l'instant</Text></Center>
                ) : (
                    <Table striped highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Montant</Table.Th>
                                <Table.Th>Destination</Table.Th>
                                <Table.Th>Demandé le</Table.Th>
                                <Table.Th>Payé le</Table.Th>
                                <Table.Th>Statut</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {payouts.map((p) => {
                                const status = PAYOUT_STATUS[p.status];
                                return (
                                    <Table.Tr key={p.id}>
                                        <Table.Td fw={600}>{p.amount.toLocaleString('fr-FR')} {p.currency}</Table.Td>
                                        <Table.Td>{p.destination}</Table.Td>
                                        <Table.Td>{new Date(p.requestedAt).toLocaleDateString('fr-FR')}</Table.Td>
                                        <Table.Td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString('fr-FR') : '—'}</Table.Td>
                                        <Table.Td>
                                            <Badge color={status.color} variant="light" leftSection={<status.icon size={12} />}>
                                                {status.label}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>

            <Paper radius="lg" p="0" style={{ overflow: 'auto' }}>
                <Group p="lg" pb="sm">
                    <Text fw={600} size="sm">Détail des transactions</Text>
                </Group>
                {transactions.length === 0 ? (
                    <Center py="xl"><Text size="sm" c="dimmed">Aucune transaction pour l'instant</Text></Center>
                ) : (
                    <Table striped highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Contenu</Table.Th>
                                <Table.Th>Brut</Table.Th>
                                <Table.Th>Commission</Table.Th>
                                <Table.Th>Net</Table.Th>
                                <Table.Th>Date</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {transactions.filter((t) => t.type === 'purchase').slice(0, 10).map((t) => (
                                <Table.Tr key={t.id}>
                                    <Table.Td><Text size="sm" lineClamp={1} maw={260}>{t.contentTitle ?? '—'}</Text></Table.Td>
                                    <Table.Td>{t.amount.toLocaleString('fr-FR')} {t.currency}</Table.Td>
                                    <Table.Td c="dimmed">− {t.commission.toLocaleString('fr-FR')} {t.currency}</Table.Td>
                                    <Table.Td fw={600}>{t.net.toLocaleString('fr-FR')} {t.currency}</Table.Td>
                                    <Table.Td>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}
            </Paper>
        </Container>
    );
}
