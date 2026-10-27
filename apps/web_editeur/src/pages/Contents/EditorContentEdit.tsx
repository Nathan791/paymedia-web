// src/pages/Contents/EditorContentEdit.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container, Paper, Title, Text, TextInput, Textarea, Select, NumberInput,
    Button, Group, Stack, Alert, Loader, Box, Image, SimpleGrid, Switch,
    Badge, Divider, Center, TagsInput,
} from '@mantine/core';
import {
    IconArrowLeft, IconPhoto, IconAlertCircle, IconCircleCheck, IconLock, IconFile,
    IconInfoCircle,
} from '@tabler/icons-react';
import { FileWithPath } from '@mantine/dropzone';
import { useContentStore } from '@/stores/content.store';
import { useAuthStore } from '@/stores/auth.store';
import { notifications } from '@mantine/notifications';
import { EDITABLE_STATUSES, ROLE_PERMISSIONS } from '@/models';
import { StatusBadge } from '@/components/StatusBadge';
import { FileDropzone } from '@/components/FileDropzone';
import { MediaPreview } from '@/components/MediaPreview';

export function EditorContentEdit() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const user = useAuthStore((s) => s.user);
    const permissions = ROLE_PERMISSIONS[user?.role ?? 'editor'];

    const {
        currentContent, fetchContent, updateContent, fetchCategories, categories,
        isLoading, isSaving, error, clearError,
    } = useContentStore();

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [isPremium, setIsPremium] = useState(true);
    const [price, setPrice] = useState<number | ''>(0);
    const [freePreviewUnits, setFreePreviewUnits] = useState<number | ''>(0);

    const [file, setFile] = useState<File | null>(null);
    const [cover, setCover] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        if (id) fetchContent(id);
        fetchCategories();
        return () => clearError();
    }, [id, fetchContent, fetchCategories, clearError]);

    useEffect(() => {
        if (currentContent && !hydrated) {
            setTitle(currentContent.title);
            setSummary(currentContent.summary);
            setDescription(currentContent.description);
            setCategoryId(currentContent.category?.id ?? null);
            setTags(currentContent.tags);
            setIsPremium(currentContent.isPremium);
            setPrice(currentContent.price);
            setFreePreviewUnits(currentContent.freePreviewUnits);
            setCoverPreview(currentContent.coverUrl);
            setHydrated(true);
        }
    }, [currentContent, hydrated]);

    const isOwn = currentContent?.authorId === user?.id;
    const canEditThis = (isOwn && permissions.canEditOwnContent) || permissions.canEditAnyContent;
    const editable = currentContent
        ? EDITABLE_STATUSES.includes(currentContent.status) && canEditThis
        : true;
    const isEditingPublished = currentContent?.status === 'published';

    const handleFileDrop = (files: FileWithPath[]) => setFile(files[0]);
    const handleCoverDrop = (files: FileWithPath[]) => {
        const f = files[0];
        setCover(f);
        setCoverPreview(URL.createObjectURL(f));
    };

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!title.trim()) errs.title = 'Le titre est obligatoire';
        if (!summary.trim()) errs.summary = 'Le chapô est obligatoire';
        if (isPremium && (price === '' || Number(price) <= 0)) errs.price = 'Indiquez un prix pour un contenu premium';
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !validate()) return;

        try {
            await updateContent(id, {
                title: title.trim(),
                description: description.trim() || summary.trim(),
                mediaType: currentContent?.mediaType ?? 'epub',
                categoryId: categoryId ?? '',
                tags,
                isPremium,
                price: isPremium ? Number(price) : 0,
                freePreviewUnits: freePreviewUnits === '' ? 0 : Number(freePreviewUnits),
            }, file, cover);
            notifications.show({
                title: 'Contenu mis à jour',
                message: 'Les modifications ont été enregistrées dans l’API.',
                color: 'forest', icon: <IconCircleCheck size={18} />,
            });
            navigate(`/editor/contents/${id}`);
        } catch (err: any) {
            notifications.show({ title: 'Erreur', message: err.message || 'La mise à jour a échoué.', color: 'red' });
        }
    };

    if (isLoading && !currentContent) {
        return <Container size="lg" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    const categoryOptions = categories
        .filter((cat) => Boolean(cat.id && cat.name))
        .map((cat) => ({ value: String(cat.id), label: String(cat.name) }));

    return (
        <Container size="lg" py="xl">
            <Group mb="lg" justify="space-between">
                <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/editor/contents')}>
                    Retour
                </Button>
                {currentContent && <StatusBadge status={currentContent.status} size="lg" />}
            </Group>

            <Stack gap={2} mb="xl">
                <Title order={2} style={{ fontFamily: 'Fraunces, serif' }} fw={600}>Modifier le contenu</Title>
                <Text size="sm" c="dimmed">{currentContent?.title}</Text>
            </Stack>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            {isEditingPublished && (
                <Alert color="blue" mb="md" icon={<IconInfoCircle size={16} />}>
                    Ce contenu est déjà publié : enregistrer une modification créera une nouvelle version qui
                    repartira en révision. La version actuellement publiée reste visible et vendable jusqu'à
                    l'approbation de la nouvelle version.
                </Alert>
            )}

            {!editable && currentContent && !isEditingPublished && (
                <Alert color="yellow" mb="md" icon={<IconLock size={16} />}>
                    {!canEditThis
                        ? "Vous n'avez pas les droits pour modifier ce contenu — il appartient à un autre membre de l'équipe."
                        : "Ce contenu est en révision ou archivé — seuls les brouillons, les contenus à corriger et les contenus publiés peuvent être modifiés."}
                </Alert>
            )}

            {currentContent?.status === 'correction_requested' && currentContent.correctionComment && (
                <Alert color="red" title="Correction demandée" mb="md">{currentContent.correctionComment}</Alert>
            )}

            <fieldset disabled={!editable} style={{ border: 'none', padding: 0, margin: 0 }}>
                <form onSubmit={handleSubmit}>
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
                        <Box style={{ gridColumn: 'span 2' }}>
                            <Paper radius="lg" p="xl">
                                <Stack gap="md">
                                    <Text fw={600} size="sm">Informations générales</Text>

                                    <TextInput label="Titre" required value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title} size="md" />
                                    <Textarea
                                        label="Chapô" required
                                        description="Ce que le lecteur verra avant d'acheter"
                                        minRows={2} value={summary} onChange={(e) => setSummary(e.target.value)}
                                        error={fieldErrors.summary} size="md"
                                    />
                                    <Textarea label="Description (usage interne)" minRows={3} value={description} onChange={(e) => setDescription(e.target.value)} size="md" />

                                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                                        <Select
                                            label="Catégorie"
                                            data={categoryOptions}
                                            value={categoryId ?? ''}
                                            onChange={(val) => setCategoryId(val ? String(val) : null)}
                                            size="md"
                                            searchable
                                            clearable
                                        />
                                        <TagsInput label="Tags" value={tags} onChange={setTags} size="md" />
                                    </SimpleGrid>

                                    <NumberInput label="Aperçu gratuit" min={0} value={freePreviewUnits} onChange={(v) => setFreePreviewUnits(v as number)} size="md" />

                                    <Divider my={4} />
                                    <Text fw={600} size="sm">Monétisation</Text>

                                    <Group justify="space-between" wrap="nowrap">
                                        <Box>
                                            <Text size="sm" fw={500}>Contenu premium</Text>
                                            <Text size="xs" c="dimmed">Désactivez pour un accès gratuit</Text>
                                        </Box>
                                        <Switch checked={isPremium} onChange={(e) => setIsPremium(e.currentTarget.checked)} size="md" />
                                    </Group>

                                    {isPremium && (
                                        <NumberInput
                                            label="Prix" min={0} step={100} value={price} onChange={(v) => setPrice(v as number)}
                                            error={fieldErrors.price} size="md"
                                            rightSection={<Text size="xs" c="dimmed" pr="xs">XAF</Text>} rightSectionWidth={50}
                                        />
                                    )}
                                </Stack>
                            </Paper>
                        </Box>

                        <Stack gap="xl">
                            <Paper radius="lg" p="xl">
                                <Text fw={600} size="sm" mb="xs">Fichier actuel</Text>
                                {currentContent && <MediaPreview mediaType={currentContent.mediaType} asset={file ? { fileName: file.name, fileUrl: URL.createObjectURL(file), fileSizeBytes: file.size, mimeType: file.type } : currentContent.asset} height={160} />}

                                <Text fw={600} size="sm" mt="md" mb="xs">Remplacer le fichier</Text>
                                <Text size="xs" c="dimmed" mb="sm">Laissez vide pour conserver le fichier actuel</Text>
                                <FileDropzone accept={['application/epub+zip', 'audio/mpeg', 'audio/wav', 'video/mp4', 'video/quicktime']} onDrop={handleFileDrop} label="Déposer un nouveau fichier" height={100} icon={<IconFile size={18} />} />
                                {file && (
                                    <Group gap={6} mt="xs">
                                        <Badge size="sm" variant="light">{file.name}</Badge>
                                        <Badge size="xs" variant="light" color="gray">{(file.size / (1024 * 1024)).toFixed(1)} Mo</Badge>
                                    </Group>
                                )}
                            </Paper>

                            <Paper radius="lg" p="xl">
                                <Text fw={600} size="sm" mb="xs">Image de couverture</Text>
                                {coverPreview ? (
                                    <Image src={coverPreview} radius="md" h={200} fit="cover" mb="sm" />
                                ) : (
                                    <Box h={140} mb="sm" style={{ border: '1px dashed var(--mantine-color-ink-1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <IconPhoto size={26} color="var(--mantine-color-gray-4)" />
                                    </Box>
                                )}
                                <FileDropzone accept={['image/png', 'image/jpeg', 'image/webp']} maxSizeMb={10} onDrop={handleCoverDrop} label="Changer la couverture" height={80} icon={<IconPhoto size={16} />} />
                            </Paper>
                        </Stack>
                    </SimpleGrid>

                    <Group justify="flex-end" mt="xl">
                        <Button variant="light" onClick={() => navigate(-1)} disabled={isSaving}>Annuler</Button>
                        <Button type="submit" disabled={isSaving || !editable} leftSection={isSaving ? <Loader size="xs" color="white" /> : undefined}>
                            {isSaving ? 'Enregistrement...' : isEditingPublished ? 'Soumettre la nouvelle version' : 'Enregistrer les modifications'}
                        </Button>
                    </Group>
                </form>
            </fieldset>
        </Container>
    );
}