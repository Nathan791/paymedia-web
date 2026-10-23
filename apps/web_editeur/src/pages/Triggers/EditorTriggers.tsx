// src/pages/Triggers/EditorTriggers.tsx
import { useEffect } from 'react';
import {
    Container, Title, Text, Group, Stack, Card, SimpleGrid, Badge, ActionIcon,
    Loader, Center, ThemeIcon, CopyButton, Tooltip, Button,
} from '@mantine/core';
import { IconQrcode, IconHash, IconWaveSine, IconCopy, IconCheck, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useTriggerStore } from '@/stores/trigger.store';
import { TRIGGER_STATUS_COLORS, TRIGGER_TYPE_LABELS, TriggerType } from '@/models/trigger.model.ts';

const TYPE_ICON: Record<TriggerType, any> = {
    qr_code: IconQrcode,
    short_code: IconHash,
    audio_watermark: IconWaveSine,
};

export function EditorTriggers() {
    const { triggers, isLoading, fetchTriggers, togglePause } = useTriggerStore();

    useEffect(() => {
        fetchTriggers();
    }, [fetchTriggers]);

    if (isLoading && triggers.length === 0) {
        return <Container size="xl" py="xl"><Center py="xl"><Loader color="signal" /></Center></Container>;
    }

    return (
        <Container size="xl" py="xl">
            <Group justify="space-between" mb="xl">
                <Text size="sm" c="dimmed">
                    {triggers.length} déclencheur{triggers.length > 1 ? 's' : ''} — QR codes, short-codes et empreintes audio
                </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {triggers.map((trigger) => {
                    const Icon = TYPE_ICON[trigger.type];
                    const conversionRate = trigger.stats.scans > 0
                        ? ((trigger.stats.conversions / trigger.stats.scans) * 100).toFixed(1)
                        : '0.0';

                    return (
                        <Card key={trigger.id} padding="lg">
                            <Group justify="space-between" mb="sm">
                                <ThemeIcon variant="light" color="signal" size={38} radius="md"><Icon size={20} /></ThemeIcon>
                                <Badge color={TRIGGER_STATUS_COLORS[trigger.status]} variant="light">
                                    {trigger.status === 'active' ? 'Actif' : trigger.status === 'paused' ? 'En pause' : 'Expiré'}
                                </Badge>
                            </Group>

                            <Text fw={600} size="sm" lineClamp={1} mb={2}>{trigger.label}</Text>
                            <Text size="xs" c="dimmed" mb="sm" lineClamp={1}>{trigger.contentTitle}</Text>

                            <Group gap={6} mb="md">
                                <Badge variant="outline" color="gray" size="sm">{TRIGGER_TYPE_LABELS[trigger.type]}</Badge>
                                <CopyButton value={trigger.code}>
                                    {({ copied, copy }) => (
                                        <Tooltip label={copied ? 'Copié !' : 'Copier le code'}>
                                            <Badge
                                                variant="light" color="gray" size="sm"
                                                style={{ cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace' }}
                                                onClick={copy}
                                                rightSection={copied ? <IconCheck size={10} /> : <IconCopy size={10} />}
                                            >
                                                {trigger.code}
                                            </Badge>
                                        </Tooltip>
                                    )}
                                </CopyButton>
                            </Group>

                            <SimpleGrid cols={2} spacing="xs" mb="md">
                                <div>
                                    <Text size="xs" c="dimmed">Scans</Text>
                                    <Text fw={700} size="sm">{trigger.stats.scans.toLocaleString('fr-FR')}</Text>
                                </div>
                                <div>
                                    <Text size="xs" c="dimmed">Conversion</Text>
                                    <Text fw={700} size="sm">{conversionRate}%</Text>
                                </div>
                            </SimpleGrid>

                            {trigger.status !== 'expired' && (
                                <Button
                                    fullWidth variant="light" size="xs"
                                    leftSection={trigger.status === 'active' ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
                                    onClick={() => togglePause(trigger)}
                                >
                                    {trigger.status === 'active' ? 'Mettre en pause' : 'Réactiver'}
                                </Button>
                            )}
                        </Card>
                    );
                })}
            </SimpleGrid>
        </Container>
    );
}
