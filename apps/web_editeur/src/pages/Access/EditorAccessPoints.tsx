// src/pages/Access/EditorAccessPoints.tsx
//
// Anciennement "Triggers" — renommé "Points d'accès" pour rester
// compréhensible par un utilisateur non technique (voir demande produit).
// Le concept reste celui du cahier des charges (QR code, code court,
// empreinte audio), seul le nom visible change.
import { useEffect, useState } from 'react';
import {
    Container, Text, Group, Stack, Card, SimpleGrid, Badge, ActionIcon,
    Loader, Center, ThemeIcon, CopyButton, Tooltip, Button, Modal, TextInput,
    Select, Alert,
} from '@mantine/core';
import {
    IconQrcode, IconHash, IconWaveSine, IconCopy, IconCheck, IconPlayerPause,
    IconPlayerPlay, IconPlus, IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAccessStore } from '@/stores/access.store';
import { useContentStore } from '@/stores/content.store';
import { ACCESS_POINT_STATUS_COLORS, ACCESS_POINT_STATUS_LABELS, ACCESS_POINT_TYPE_LABELS, AccessPointType, conversionRate } from '@/models';

const TYPE_ICON: Record<AccessPointType, any> = {
    qr_code: IconQrcode,
    short_code: IconHash,
    audio_watermark: IconWaveSine,
};

export function EditorAccessPoints() {
    const { accessPoints, isLoading, isSaving, error, fetchAccessPoints, createAccessPoint, togglePause, clearError } = useAccessStore();
    const { contents, fetchContents } = useContentStore();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [label, setLabel] = useState('');
    const [type, setType] = useState<AccessPointType>('qr_code');
    const [contentId, setContentId] = useState<string | null>(null);
    const [campaign, setCampaign] = useState('');

    useEffect(() => {
        fetchAccessPoints();
        fetchContents();
    }, [fetchAccessPoints, fetchContents]);

    const publishedContents = contents.filter((c) => c.status === 'published');

    const handleCreate = async () => {
        const content = publishedContents.find((c) => c.id === contentId);
        if (!content) return;
        try {
            await createAccessPoint({
                type,
                label: label.trim(),
                contentId: content.id,
                contentTitle: content.title,
                campaign: campaign.trim() || null,
                expiresAt: null,
            });
            notifications.show({ title: 'Point d\'accès créé', message: `Lié à « ${content.title} »`, color: 'forest' });
            setCreateModalOpen(false);
            setLabel(''); setContentId(null); setCampaign(''); setType('qr_code');
        } catch (e: any) {
            notifications.show({ title: 'Création impossible', message: e.message, color: 'red' });
        }
    };

    if (isLoading && accessPoints.length === 0) {
        return <Container size="xl" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Text size="sm" c="dimmed">
                    {accessPoints.length} point{accessPoints.length > 1 ? 's' : ''} d'accès — QR codes, codes courts et empreintes audio qui mènent vos lecteurs à vos contenus
                </Text>
                <Button leftSection={<IconPlus size={16} />} onClick={() => setCreateModalOpen(true)} disabled={publishedContents.length === 0}>
                    Créer un point d'accès
                </Button>
            </Group>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            {publishedContents.length === 0 && (
                <Alert color="yellow" mb="lg" icon={<IconAlertCircle size={16} />}>
                    Vous devez avoir au moins un contenu publié avant de pouvoir créer un point d'accès.
                </Alert>
            )}

            {accessPoints.length === 0 ? (
                <Card padding="xl">
                    <Center>
                        <Stack align="center" gap="xs">
                            <IconQrcode size={40} color="var(--mantine-color-gray-4)" />
                            <Text c="dimmed">Aucun point d'accès pour l'instant</Text>
                        </Stack>
                    </Center>
                </Card>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                    {accessPoints.map((accessPoint) => {
                        const Icon = TYPE_ICON[accessPoint.type];
                        const rate = conversionRate(accessPoint.stats);

                        return (
                            <Card key={accessPoint.id} padding="lg">
                                <Group justify="space-between" mb="sm">
                                    <ThemeIcon variant="light" color="forest" size={38} radius="md"><Icon size={20} /></ThemeIcon>
                                    <Badge color={ACCESS_POINT_STATUS_COLORS[accessPoint.status]} variant="light">
                                        {ACCESS_POINT_STATUS_LABELS[accessPoint.status]}
                                    </Badge>
                                </Group>

                                <Text fw={600} size="sm" lineClamp={1} mb={2}>{accessPoint.label}</Text>
                                <Text size="xs" c="dimmed" mb="sm" lineClamp={1}>{accessPoint.contentTitle}</Text>

                                <Group gap={6} mb="md">
                                    <Badge variant="outline" color="gray" size="sm">{ACCESS_POINT_TYPE_LABELS[accessPoint.type]}</Badge>
                                    <CopyButton value={accessPoint.code}>
                                        {({ copied, copy }) => (
                                            <Tooltip label={copied ? 'Copié !' : 'Copier le code'}>
                                                <Badge
                                                    variant="light" color="gray" size="sm"
                                                    style={{ cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}
                                                    onClick={copy}
                                                    rightSection={copied ? <IconCheck size={10} /> : <IconCopy size={10} />}
                                                >
                                                    {accessPoint.code}
                                                </Badge>
                                            </Tooltip>
                                        )}
                                    </CopyButton>
                                </Group>

                                {/* Entonnoir scans → visites → achats (Master Prompt §18/§23) */}
                                <SimpleGrid cols={3} spacing="xs" mb="md">
                                    <div>
                                        <Text size="xs" c="dimmed">Scans</Text>
                                        <Text fw={700} size="sm">{accessPoint.stats.scans.toLocaleString('fr-FR')}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Visites</Text>
                                        <Text fw={700} size="sm">{accessPoint.stats.visits.toLocaleString('fr-FR')}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Conversion</Text>
                                        <Text fw={700} size="sm">{rate}%</Text>
                                    </div>
                                </SimpleGrid>

                                {accessPoint.status !== 'expired' && (
                                    <Button
                                        fullWidth variant="light" size="xs"
                                        leftSection={accessPoint.status === 'active' ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                                        onClick={() => togglePause(accessPoint)}
                                    >
                                        {accessPoint.status === 'active' ? 'Mettre en pause' : 'Réactiver'}
                                    </Button>
                                )}
                            </Card>
                        );
                    })}
                </SimpleGrid>
            )}

            <Modal opened={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Créer un point d'accès" centered>
                <Stack>
                    <Text size="sm" c="dimmed">
                        Comment voulez-vous rendre ce contenu accessible à vos lecteurs ?
                    </Text>

                    <Select
                        label="Contenu" placeholder="Choisir un contenu publié" required
                        data={publishedContents.map((c) => ({ value: c.id, label: c.title }))}
                        value={contentId} onChange={setContentId} searchable
                    />

                    <SimpleGrid cols={3} spacing="xs">
                        {(['qr_code', 'short_code', 'audio_watermark'] as AccessPointType[]).map((t) => {
                            const Icon = TYPE_ICON[t];
                            const active = type === t;
                            return (
                                <Card
                                    key={t} padding="sm" onClick={() => setType(t)}
                                    style={{
                                        cursor: 'pointer',
                                        borderColor: active ? 'var(--mantine-color-forest-6)' : undefined,
                                        backgroundColor: active ? 'var(--mantine-color-forest-0)' : undefined,
                                    }}
                                >
                                    <Stack align="center" gap={4}>
                                        <Icon size={20} color={active ? 'var(--mantine-color-forest-6)' : 'var(--mantine-color-gray-5)'} />
                                        <Text size="xs" ta="center" fw={active ? 600 : 400}>{ACCESS_POINT_TYPE_LABELS[t]}</Text>
                                    </Stack>
                                </Card>
                            );
                        })}
                    </SimpleGrid>

                    <TextInput
                        label="Nom" placeholder="Ex : Affiche Métro — Campagne Juillet" required
                        value={label} onChange={(e) => setLabel(e.target.value)}
                    />
                    <TextInput
                        label="Campagne (optionnel)" placeholder="Ex : Lancement édition spéciale"
                        value={campaign} onChange={(e) => setCampaign(e.target.value)}
                    />

                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setCreateModalOpen(false)}>Annuler</Button>
                        <Button disabled={!contentId || !label.trim()} loading={isSaving} onClick={handleCreate}>
                            Générer
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
