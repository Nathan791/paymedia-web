// src/pages/Contents/EditorContentDetail.tsx
import { useEffect, ReactElement, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
    Container, Paper, Title, Text, Button, Group, Stack, Loader, Alert, Box,
    SimpleGrid, Divider, Center, ThemeIcon, Timeline, Badge, Image, Modal,
    Textarea, TextInput,
} from '@mantine/core';
import {
    IconArrowLeft, IconEdit, IconSend, IconArchive, IconAlertCircle,
    IconCircleCheck, IconClock, IconX, IconPencil, IconCheck,
    IconEye, IconShoppingCart, IconTrendingUp, IconCoin, IconRestore,
    IconCalendarEvent, IconLock, IconQrcode, IconArrowRight,
} from '@tabler/icons-react';
import { useContentStore } from '@/stores/content.store';
import { useAuthStore } from '@/stores/auth.store';
import { useAccessStore } from '@/stores/access.store';
import { notifications } from '@mantine/notifications';
import { ContentHistoryAction, ContentStatus, ROLE_PERMISSIONS } from '@/models';
import { StatusBadge } from '@/components/StatusBadge';
import { MediaPreview } from '@/components/MediaPreview';

const HISTORY_LABELS: Record<ContentHistoryAction, string> = {
    created: 'Contenu créé',
    edited: 'Contenu modifié',
    submitted: 'Soumis à la révision',
    correction_requested: 'Correction demandée',
    approved: 'Approuvé',
    scheduled: 'Publication programmée',
    published: 'Publié',
    archived: 'Archivé',
    restored: 'Restauré en brouillon',
};

export function EditorContentDetail() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const user = useAuthStore((s) => s.user);
    const permissions = ROLE_PERMISSIONS[user?.role ?? 'journalist'];

    const {
        currentContent, fetchContent, isLoading, isSaving, error, clearError,
        submitForReview, requestCorrection, approve, resubmitAfterCorrection,
        publishNow, schedule, archiveContent, restoreContent,
    } = useContentStore();

    const { accessPoints, fetchAccessPoints } = useAccessStore();

    const [correctionModalOpen, setCorrectionModalOpen] = useState(false);
    const [correctionComment, setCorrectionComment] = useState('');
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [scheduleDate, setScheduleDate] = useState('');

    useEffect(() => {
        if (id) {
            fetchContent(id);
            fetchAccessPoints(id);
        }
        return () => clearError();
    }, [id]);

    const run = async (action: () => Promise<void>, successTitle: string) => {
        try {
            await action();
            notifications.show({ title: successTitle, message: 'Action effectuée avec succès.', color: 'forest' });
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        }
    };

    const handleRequestCorrection = async () => {
        if (!currentContent || !correctionComment.trim()) return;
        try {
            await requestCorrection(currentContent.id, correctionComment.trim());
            notifications.show({ title: 'Correction demandée', message: "L'auteur a été notifié.", color: 'red' });
            setCorrectionModalOpen(false);
            setCorrectionComment('');
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        }
    };

    const handleSchedule = async () => {
        if (!currentContent || !scheduleDate) return;
        try {
            await schedule(currentContent.id, new Date(scheduleDate).toISOString());
            notifications.show({ title: 'Publication programmée', message: 'Le contenu sera publié automatiquement à la date choisie.', color: 'forest' });
            setScheduleModalOpen(false);
            setScheduleDate('');
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        }
    };

    if (isLoading && !currentContent) {
        return <Container size="lg" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    if (!currentContent) {
        return (
            <Container size="lg" py="xl">
                {error && <Alert color="red" icon={<IconAlertCircle size={16} />}>{error}</Alert>}
            </Container>
        );
    }

    const c = currentContent;
    const isOwn = c.authorId === user?.id;
    const canEditThis = (isOwn && permissions.canEditOwnContent) || permissions.canEditAnyContent;

    const canSubmit = c.status === 'draft' && canEditThis;
    const canResubmit = c.status === 'correction_requested' && canEditThis;
    const canReview = c.status === 'pending_review' && permissions.canReview;
    const canPublishOrSchedule = c.status === 'approved' && permissions.canPublish;
    const canArchive = (c.status === 'published' || c.status === 'scheduled') && canEditThis;
    const canRestore = c.status === 'archived' && canEditThis;
    const canEdit = ['draft', 'correction_requested', 'published'].includes(c.status) && canEditThis;

    // Étapes du cycle de vie éditorial affichées dans la timeline. La
    // correction est une BRANCHE, pas une étape linéaire — elle est signalée
    // séparément via l'alerte ci-dessous plutôt que dans la timeline
    // principale, pour ne pas casser la lecture du chemin "normal".
    const timelineSteps: { status: ContentStatus; label: string; icon: ReactElement }[] = [
        { status: 'draft', label: 'Brouillon créé', icon: <IconPencil size={12} /> },
        { status: 'pending_review', label: 'Soumis à la révision', icon: <IconClock size={12} /> },
        { status: 'approved', label: 'Approuvé', icon: <IconCheck size={12} /> },
        { status: 'published', label: 'Publié', icon: <IconCircleCheck size={12} /> },
    ];
    const activeIndex = c.status === 'correction_requested'
        ? 1
        : c.status === 'scheduled'
            ? 2
            : c.status === 'archived'
                ? 3
                : Math.max(timelineSteps.findIndex((s) => s.status === c.status), 0);

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="lg" wrap="wrap">
                <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/editor/contents')}>
                    Retour
                </Button>
                <Group>
                    {canSubmit && (
                        <Button leftSection={<IconSend size={16} />} loading={isSaving} onClick={() => run(() => submitForReview(c.id), 'Envoyé en révision')}>
                            Soumettre à la révision
                        </Button>
                    )}
                    {canResubmit && (
                        <Button leftSection={<IconSend size={16} />} loading={isSaving} onClick={() => run(() => resubmitAfterCorrection(c.id), 'Resoumis à la révision')}>
                            Resoumettre
                        </Button>
                    )}
                    {canReview && (
                        <>
                            <Button color="forest" leftSection={<IconCheck size={16} />} loading={isSaving}
                                onClick={() => run(() => approve(c.id), 'Approuvé')}>
                                Approuver
                            </Button>
                            <Button color="red" variant="light" leftSection={<IconX size={16} />}
                                onClick={() => setCorrectionModalOpen(true)}>
                                Demander une correction
                            </Button>
                        </>
                    )}
                    {canPublishOrSchedule && (
                        <>
                            <Button variant="default" leftSection={<IconCalendarEvent size={16} />}
                                onClick={() => setScheduleModalOpen(true)}>
                                Programmer
                            </Button>
                            <Button color="forest" leftSection={<IconSend size={16} />} loading={isSaving}
                                onClick={() => run(() => publishNow(c.id), 'Publié')}>
                                Publier maintenant
                            </Button>
                        </>
                    )}
                    <Button variant="default" leftSection={<IconEdit size={16} />} disabled={!canEdit} onClick={() => navigate(`/editor/contents/${id}/edit`)}>
                        Modifier
                    </Button>
                    {canArchive && (
                        <Button variant="subtle" color="dark" leftSection={<IconArchive size={16} />} loading={isSaving} onClick={() => run(() => archiveContent(c.id), 'Archivé')}>
                            Archiver
                        </Button>
                    )}
                    {canRestore && (
                        <Button variant="subtle" leftSection={<IconRestore size={16} />} loading={isSaving} onClick={() => run(() => restoreContent(c.id), 'Restauré en brouillon')}>
                            Restaurer
                        </Button>
                    )}
                </Group>
            </Group>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            {c.status === 'correction_requested' && c.correctionComment && (
                <Alert color="red" title="Correction demandée" mb="lg" icon={<IconX size={16} />}>
                    {c.correctionComment}
                    {c.reviewerName && <Text size="xs" c="dimmed" mt={4}>— {c.reviewerName}</Text>}
                </Alert>
            )}
            {c.status === 'scheduled' && c.scheduledAt && (
                <Alert color="blue" title="Publication programmée" mb="lg" icon={<IconCalendarEvent size={16} />}>
                    Ce contenu sera publié automatiquement le {new Date(c.scheduledAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}.
                </Alert>
            )}
            {!canEditThis && c.status !== 'published' && (
                <Alert color="yellow" mb="lg" icon={<IconLock size={16} />}>
                    Vous consultez ce contenu en lecture seule — il appartient à un autre membre de l'équipe.
                </Alert>
            )}

            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                <Box style={{ gridColumn: 'span 2' }}>
                    <Paper radius="lg" p="xl" mb="lg">
                        <Group justify="space-between" mb="md" align="flex-start">
                            <Box>
                                <Title order={3} style={{ fontFamily: 'Fraunces, serif' }} fw={600}>{c.title}</Title>
                                <Text size="sm" c="dimmed">{c.category?.name || 'Non catégorisé'} · {c.authorName}</Text>
                            </Box>
                            <StatusBadge status={c.status} size="lg" />
                        </Group>

                        <Divider my="md" />

                        <Text fw={600} size="sm" mb="xs">Aperçu du fichier</Text>
                        <MediaPreview mediaType={c.mediaType} asset={c.asset} />

                        <Divider my="md" />

                        <Text fw={600} size="sm" mb="xs">Chapô</Text>
                        <Text size="sm" c={c.summary ? undefined : 'dimmed'} mb="lg">
                            {c.summary || 'Aucun chapô renseigné.'}
                        </Text>

                        {c.description && (
                            <>
                                <Text fw={600} size="sm" mb="xs">Notes internes</Text>
                                <Text size="sm" c="dimmed" mb="lg">{c.description}</Text>
                            </>
                        )}

                        {c.tags.length > 0 && (
                            <Group gap={6} mb="lg">
                                {c.tags.map((tag) => <Badge key={tag} variant="light" color="gray" size="sm">{tag}</Badge>)}
                            </Group>
                        )}

                        <SimpleGrid cols={3} spacing="md">
                            <Stack gap={0}>
                                <Text size="xs" c="dimmed">Prix</Text>
                                <Text fw={700}>{!c.isPremium ? 'Gratuit' : `${c.price.toLocaleString('fr-FR')} ${c.currency}`}</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" c="dimmed">Aperçu gratuit</Text>
                                <Text fw={700}>{c.freePreviewUnits}</Text>
                            </Stack>
                            <Stack gap={0}>
                                <Text size="xs" c="dimmed">Créé le</Text>
                                <Text fw={700}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</Text>
                            </Stack>
                        </SimpleGrid>
                    </Paper>

                    {/* Prévisualisation lecteur — rapproche l'éditeur de ce que verra
                        vraiment l'acheteur avant de publier (voir Master Prompt §16). */}
                    <Paper radius="lg" p="xl" mb="lg">
                        <Text fw={600} size="sm" mb="md">Aperçu lecteur</Text>
                        <Paper withBorder radius="md" p="md" bg="var(--mantine-color-gray-0)">
                            <Group align="flex-start" wrap="nowrap">
                                {c.coverUrl && <Image src={c.coverUrl} w={72} h={96} radius="sm" fit="cover" />}
                                <Box style={{ flex: 1 }}>
                                    <Text fw={700} size="sm">{c.title}</Text>
                                    <Text size="xs" c="dimmed" mb={4}>{c.authorName}</Text>
                                    <Text size="xs" lineClamp={2} mb={8}>{c.summary || c.description}</Text>
                                    {c.isPremium ? (
                                        <Badge color="gold" variant="light" leftSection={<IconLock size={10} />}>
                                            {c.price.toLocaleString('fr-FR')} {c.currency}
                                        </Badge>
                                    ) : (
                                        <Badge color="forest" variant="light">Gratuit</Badge>
                                    )}
                                </Box>
                            </Group>
                        </Paper>
                    </Paper>

                    {c.status === 'published' && (
                        <Paper radius="lg" p="xl" mb="lg">
                            <Group justify="space-between" mb="md">
                                <Text fw={600} size="sm">Performance</Text>
                                <Button
                                    component={Link} to={`/editor/analytics/content/${id}`} variant="subtle" size="xs"
                                    rightSection={<IconArrowRight size={14} />}
                                >
                                    Voir les statistiques détaillées
                                </Button>
                            </Group>
                            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                                <StatBlock icon={IconEye} label="Vues" value={c.stats.views.toLocaleString('fr-FR')} />
                                <StatBlock icon={IconShoppingCart} label="Achats" value={c.stats.purchases.toLocaleString('fr-FR')} />
                                <StatBlock icon={IconTrendingUp} label="Conversion" value={`${c.stats.conversionRate}%`} />
                                <StatBlock icon={IconCoin} label="Revenu" value={`${c.stats.revenue.toLocaleString('fr-FR')} ${c.currency}`} />
                            </SimpleGrid>
                        </Paper>
                    )}

                    {c.status === 'published' && (
                        <Paper radius="lg" p="xl" mb="lg">
                            <Group justify="space-between" mb="md">
                                <Text fw={600} size="sm">Points d'accès</Text>
                                <Button
                                    component={Link} to="/editor/access" variant="subtle" size="xs"
                                    rightSection={<IconArrowRight size={14} />}
                                >
                                    Gérer les points d'accès
                                </Button>
                            </Group>
                            {accessPoints.length === 0 ? (
                                <Group gap="sm" wrap="nowrap">
                                    <ThemeIcon variant="light" color="gray" size={36} radius="md"><IconQrcode size={18} /></ThemeIcon>
                                    <Box>
                                        <Text size="sm">Aucun point d'accès pour ce contenu.</Text>
                                        <Text size="xs" c="dimmed">Créez un QR code, un code court ou une empreinte audio pour que vos lecteurs le découvrent.</Text>
                                    </Box>
                                </Group>
                            ) : (
                                <Stack gap="xs">
                                    {accessPoints.map((a) => (
                                        <Group key={a.id} justify="space-between" wrap="nowrap">
                                            <Group gap={8} wrap="nowrap">
                                                <IconQrcode size={16} color="var(--mantine-color-forest-6)" />
                                                <Text size="sm">{a.label}</Text>
                                            </Group>
                                            <Text size="xs" c="dimmed">{a.stats.scans.toLocaleString('fr-FR')} scans · {a.stats.purchases.toLocaleString('fr-FR')} achats</Text>
                                        </Group>
                                    ))}
                                </Stack>
                            )}
                        </Paper>
                    )}

                    <Paper radius="lg" p="xl">
                        <Text fw={600} size="sm" mb="md">Statut de publication</Text>
                        <Timeline active={activeIndex} bulletSize={22} lineWidth={2} color="forest">
                            {timelineSteps.map((step) => <Timeline.Item key={step.status} bullet={step.icon} title={step.label} />)}
                        </Timeline>
                    </Paper>
                </Box>

                <Stack gap="xl">
                    <Paper radius="lg" p="xl">
                        <Text fw={600} size="sm" mb="sm">Couverture</Text>
                        {c.coverUrl ? (
                            <Image src={c.coverUrl} radius="md" h={280} fit="cover" />
                        ) : (
                            <Box h={220} style={{ border: '1px dashed var(--mantine-color-ink-1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text size="xs" c="dimmed">Aucune couverture</Text>
                            </Box>
                        )}
                    </Paper>

                    {c.asset && (
                        <Paper radius="lg" p="xl">
                            <Text fw={600} size="sm" mb="sm">Fichier</Text>
                            <Stack gap={6}>
                                <Text size="sm" truncate>{c.asset.fileName}</Text>
                                <Badge variant="light" color="gray" size="sm" w="fit-content">
                                    {(c.asset.fileSizeBytes / (1024 * 1024)).toFixed(1)} Mo
                                </Badge>
                            </Stack>
                        </Paper>
                    )}

                    <Paper radius="lg" p="xl">
                        <Text fw={600} size="sm" mb="md">Historique</Text>
                        <Stack gap="sm">
                            {[...c.history].reverse().map((entry) => (
                                <Box key={entry.id}>
                                    <Text size="xs" fw={600}>{HISTORY_LABELS[entry.action]}</Text>
                                    <Text size="xs" c="dimmed">
                                        {entry.actorName} · {new Date(entry.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                                    </Text>
                                    {entry.comment && <Text size="xs" c="red" mt={2}>{entry.comment}</Text>}
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Stack>
            </SimpleGrid>

            <Modal opened={correctionModalOpen} onClose={() => setCorrectionModalOpen(false)} title="Demander une correction" centered>
                <Stack>
                    <Textarea
                        label="Commentaire" placeholder="Expliquez précisément ce qui doit être corrigé..."
                        minRows={3} required value={correctionComment}
                        onChange={(e) => setCorrectionComment(e.target.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setCorrectionModalOpen(false)}>Annuler</Button>
                        <Button color="red" disabled={!correctionComment.trim()} loading={isSaving} onClick={handleRequestCorrection}>
                            Envoyer la demande
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title="Programmer la publication" centered>
                <Stack>
                    <TextInput
                        type="datetime-local" label="Date et heure de publication" required
                        value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setScheduleModalOpen(false)}>Annuler</Button>
                        <Button disabled={!scheduleDate} loading={isSaving} onClick={handleSchedule}>
                            Programmer
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}

function StatBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <Stack gap={4}>
            <ThemeIcon variant="light" color="forest" size={30} radius="md"><Icon size={16} /></ThemeIcon>
            <Text size="xs" c="dimmed">{label}</Text>
            <Text fw={700} size="sm">{value}</Text>
        </Stack>
    );
}
