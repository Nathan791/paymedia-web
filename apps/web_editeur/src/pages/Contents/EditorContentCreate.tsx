// src/pages/Contents/EditorContentCreate.tsx
import {useEffect,useMemo, useState, type ComponentType, type FormEvent,} from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ActionIcon,
    Alert,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    Group,
    Image,
    Loader,
    NumberInput,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    TagsInput,
    Text,
    Textarea,
    ThemeIcon,
    Title,
} from '@mantine/core';

import {
    IconAlertCircle,
    IconArrowLeft,
    IconBook2,
    IconCheck,
    IconCircleCheck,
    IconFile,
    IconHeadphones,
    IconInfoCircle,
    IconMovie,
    IconPhoto,
    IconPlayerPlay,
    IconTrash,
    IconUpload,
    IconX,
} from '@tabler/icons-react';

import { FileWithPath } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';

import { useContentStore } from '@/stores/content.store';
import { ContentMediaType } from '@/models';
import { FileDropzone } from '@/components/FileDropzone';

interface MediaTypeOption {
    value: ContentMediaType;
    label: string;
    shortLabel: string;
    description: string;
    icon: ComponentType<{ size?: number }>;
    accept: string[];
    maxSizeMb: number;
}

const MEDIA_TYPES: MediaTypeOption[] = [
    {
        value: 'epub',
        label: 'Livre numérique / Article',
        shortLabel: 'EPUB',
        description: 'Publication éditoriale au format EPUB',
        icon: IconBook2,
        accept: ['application/epub+zip'],
        maxSizeMb: 200,
    },
    {
        value: 'audio',
        label: 'Audio',
        shortLabel: 'Audio',
        description: 'Podcast, interview ou contenu audio',
        icon: IconHeadphones,
        accept: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
        maxSizeMb: 200,
    },
    {
        value: 'video',
        label: 'Vidéo',
        shortLabel: 'Vidéo',
        description: 'Reportage, émission ou contenu vidéo',
        icon: IconMovie,
        accept: ['video/mp4', 'video/quicktime'],
        maxSizeMb: 1024,
    },
];

const COVER_ACCEPT = [
    'image/png',
    'image/jpeg',
    'image/webp',
];

export function EditorContentCreate() {
    const navigate = useNavigate();

    const {
        createContent,
        fetchCategories,
        categories,
        isSaving,
        error,
        clearError,
    } = useContentStore();

    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [description, setDescription] = useState('');

    const [mediaType, setMediaType] =
        useState<ContentMediaType>('epub');

    const [categoryId, setCategoryId] =
        useState<string | null>(null);

    const [tags, setTags] = useState<string[]>([]);

    const [isPremium, setIsPremium] = useState(true);
    const [price, setPrice] = useState<number | ''>(500);
    const [freePreviewUnits, setFreePreviewUnits] =
        useState<number | ''>(0);

    const [file, setFile] = useState<File | null>(null);

    const [cover, setCover] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] =
        useState<string | null>(null);

    const [fieldErrors, setFieldErrors] =
        useState<Record<string, string>>({});

    const [activeSection, setActiveSection] =
        useState('content');

    useEffect(() => {
        fetchCategories();

        return () => {
            clearError();

            if (coverPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(coverPreview);
            }
        };
    }, []);

    const selectedType = useMemo(
        () =>
            MEDIA_TYPES.find(
                (item) => item.value === mediaType,
            ) ?? MEDIA_TYPES[0],
        [mediaType],
    );

    const categoryOptions = useMemo(
        () =>
            categories.map((category) => ({
                value: category.id,
                label: category.name,
            })),
        [categories],
    );

    const completion = useMemo(() => {
        let completed = 0;

        if (title.trim()) completed++;
        if (summary.trim()) completed++;
        if (file) completed++;
        if (cover) completed++;
        if (categoryId) completed++;
        if (!isPremium || Number(price) > 0) completed++;

        return Math.round((completed / 6) * 100);
    }, [title, summary, file, cover, categoryId, isPremium, price,]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024 * 1024) {
            return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
    };

    const handleFileDrop = (files: FileWithPath[]) => {
        const candidate = files[0];

        if (!candidate) return;

        setFile(candidate);

        setFieldErrors((previous) => ({
            ...previous,
            file: '',
        }));
    };

    const handleFileReject = () => {
        setFieldErrors((previous) => ({
            ...previous,
            file: `Fichier refusé. Utilisez le format ${selectedType.shortLabel} et respectez la limite de ${selectedType.maxSizeMb} Mo.`,
        }));
    };

    const handleCoverDrop = (files: FileWithPath[]) => {
        const candidate = files[0];

        if (!candidate) return;

        if (coverPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(coverPreview);
        }

        const preview = URL.createObjectURL(candidate);

        setCover(candidate);
        setCoverPreview(preview);

        setFieldErrors((previous) => ({
            ...previous,
            cover: '',
        }));
    };

    const handleCoverReject = () => {
        setFieldErrors((previous) => ({
            ...previous,
            cover:
                'Couverture refusée. Utilisez un fichier JPG, PNG ou WebP, 10 Mo maximum.',
        }));
    };

    const removeFile = () => {
        setFile(null);

        setFieldErrors((previous) => ({
            ...previous,
            file: '',
        }));
    };

    const removeCover = () => {
        if (coverPreview?.startsWith('blob:')) {
            URL.revokeObjectURL(coverPreview);
        }

        setCover(null);
        setCoverPreview(null);

        setFieldErrors((previous) => ({
            ...previous,
            cover: '',
        }));
    };

    const changeMediaType = (value: ContentMediaType) => {
        if (value === mediaType) return;

        setMediaType(value);
        setFile(null);

        setFieldErrors((previous) => ({
            ...previous,
            file: '',
        }));
    };

    const validate = () => {
        const errors: Record<string, string> = {};

        if (!title.trim()) {
            errors.title = 'Le titre est obligatoire.';
        }

        if (!summary.trim()) {
            errors.summary =
                'Le chapô est obligatoire.';
        }

        if (!file) {errors.file = 'Le fichier du contenu est obligatoire.';
        }

        if (
            isPremium && (price === '' || Number(price) <= 0)
        ) {
            errors.price = 'Indiquez un prix supérieur à 0 XAF.';
        }

        if (!categoryId) {errors.category = 'Sélectionnez une catégorie.';
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (!validate() || !file) {
            setActiveSection('content');
            return;
        }

        try {
            await createContent(
                {
                    title: title.trim(),
                    summary: summary.trim(),
                    description: description.trim(),
                    mediaType,
                    categoryId,
                    tags,
                    isPremium,
                    price: isPremium
                        ? Number(price)
                        : 0,
                    freePreviewUnits:
                        freePreviewUnits === ''
                            ? 0
                            : Number(freePreviewUnits),
                },
                file,
                cover,
            );

            notifications.show({
                title: 'Brouillon enregistré',
                message: 'Votre contenu a été créé. Vous pouvez maintenant le soumettre à la révision.',
                color: 'green',
                icon: (<IconCircleCheck size={18} />
                ),
            });

            navigate('/editor/contents');
        } catch (err: any) {
            notifications.show({
                title: 'Impossible de créer le contenu',
                message: err?.message ?? 'Une erreur est survenue.',
                color: 'red',
            });
        }
    };

    return (
        <Box
            style={{
                minHeight: '100%',
                background: 'var(--mantine-color-gray-0)',
            }}
        >
            <Container
                size="xl"
                py={{ base: 'md', md: 'xl' }}
            >
                {/* =========================================================
                    HEADER
                ========================================================= */}

                <Group justify="space-between" align="flex-start" mb="xl">
                    <Stack gap={4}>
                        <Button variant="subtle" color="gray" size="sm" px={0} leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/editor/contents',)}>
                            Tous les contenus
                        </Button>

                        <Title order={1} fw={650} style={{letterSpacing: '-0.025em',}}>
                            Créer un contenu
                        </Title>

                        <Text size="sm" c="dimmed" maw={650}>
                            Préparez votre publication et soumettez la!
                        </Text>
                    </Stack>

                    <Paper withBorder radius="xl" px="md" py="xs" bg="white"
                    >
                        <Group gap="sm">
                            <ThemeIcon size={32} radius="xl" variant="light" color="forest">
                                <IconFile size={17} />
                            </ThemeIcon>

                            <Stack gap={0}>
                                <Text size="xs" c="dimmed" fw={500}>
                                    État
                                </Text>

                                <Text size="sm" fw={600}>
                                    Brouillon
                                </Text>
                            </Stack>
                        </Group>
                    </Paper>
                </Group>


                {error && (
                    <Alert color="red" title="Une erreur est survenue" mb="xl" withCloseButton onClose={clearError}
                        icon={
                            <IconAlertCircle size={17} />
                        }
                    >
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid gutter="xl">
                        <Grid.Col span={{base: 12, lg: 8,}}>
                            <Stack gap="xl">
                                <Paper withBorder radius="xl" p={{
                                        base: 'lg',
                                        md: 'xl',
                                    }}
                                    bg="white"
                                >
                                    <Stack gap="xl">
                                        <Group justify="space-between" align="flex-start"
                                        >
                                            <Group gap="sm">
                                                <ThemeIcon size={40} radius="md" color="forest" variant="light">
                                                    <IconBook2
                                                        size={21}
                                                    />
                                                </ThemeIcon>

                                                <Stack gap={1}>
                                                    <Text fw={700}>
                                                        Identité éditoriale
                                                    </Text>

                                                    <Text size="xs" c="dimmed">
                                                        Les informations visibles par votre audience
                                                    </Text>
                                                </Stack>
                                            </Group>

                                            <Badge variant="light" color="gray">
                                                Étape 1
                                            </Badge>
                                        </Group>

                                        <Textarea
                                            label="Titre de la publication"
                                            description="Le titre principal affiché dans le catalogue et sur la fiche de contenu."
                                            placeholder="Veillez entrer le titre de votre contenu"
                                            value={title}
                                            onChange={(event) =>
                                                setTitle(
                                                    event
                                                        .currentTarget
                                                        .value,
                                                )
                                            }
                                            error={
                                                fieldErrors.title
                                            }
                                            required
                                            size="md"
                                            radius="md"
                                        />

                                        <Textarea
                                            label="Chapô/Introduction"
                                            description="Le lecteur le verra avant l'achat. Il doit expliquer rapidement la valeur de votre publication."
                                            placeholder="Présentez en quelques lignes ce que le lecteur va découvrir..."
                                            value={summary}
                                            onChange={(event) =>
                                                setSummary(
                                                    event
                                                        .currentTarget
                                                        .value,
                                                )
                                            }
                                            error={
                                                fieldErrors.summary
                                            } required minRows={5} autosize maxRows={8} size="md" radius="md"
                                        />

                                        <Group justify="flex-end" mt={-10}>
                                            <Text size="xs" c="dimmed">
                                                {summary.length}{' '}caractères
                                            </Text>
                                        </Group>

                                        <Divider />

                                        <Grid>
                                            <Grid.Col
                                                span={{
                                                    base: 12,
                                                    sm: 6,
                                                }}
                                            >
                                                <Select
                                                    label="Catégorie"
                                                    description="Classez votre contenu pour faciliter sa découverte."
                                                    placeholder="Choisir une catégorie"
                                                    data={
                                                        categoryOptions
                                                    }
                                                    value={
                                                        categoryId
                                                    }
                                                    onChange={
                                                        setCategoryId
                                                    }
                                                    searchable
                                                    clearable
                                                    error={
                                                        fieldErrors.category
                                                    }
                                                    size="md"
                                                    radius="md"
                                                />
                                            </Grid.Col>

                                            <Grid.Col
                                                span={{
                                                    base: 12,
                                                    sm: 6,
                                                }}
                                            >
                                                <TagsInput
                                                    label="Mots-clés"
                                                    description="Ajoutez les termes permettant de retrouver la publication."
                                                    placeholder="Ajouter un mot-clé"
                                                    value={tags}
                                                    onChange={setTags}
                                                    size="md"
                                                    radius="md"
                                                    clearable
                                                />
                                            </Grid.Col>
                                        </Grid>

                                        <Textarea
                                            label="Notes éditoriales"
                                            description="Informations internes destinées à la rédaction et à la relecture. Elles ne sont pas destinées au lecteur."
                                            placeholder="Contexte, sources, consignes de relecture..."
                                            value={description}
                                            onChange={(event) =>
                                                setDescription(
                                                    event
                                                        .currentTarget
                                                        .value,
                                                )
                                            }
                                            minRows={4}
                                            autosize
                                            maxRows={7}
                                            size="md"
                                            radius="md"
                                        />
                                    </Stack>
                                </Paper>
                                <Paper withBorder radius="xl" p={{base: 'lg', md: 'xl',}} bg="white">
                                    <Stack gap="xl">
                                        <Group justify="space-between" align="flex-start">
                                            <Group gap="sm">
                                                <ThemeIcon size={40} radius="md" color="forest" variant="light">
                                                    <IconUpload size={21}/>
                                                </ThemeIcon>
                                                <Stack gap={1}>
                                                    <Text fw={700}>
                                                        Fichier de publication
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                         fichier  distribué
                                                    </Text>
                                                </Stack>
                                            </Group>
                                            <Badge variant="light" color="gray">
                                                Étape 2
                                            </Badge>
                                        </Group>

                                        <Stack gap="sm">
                                            <Text size="sm" fw={600}>
                                                Format du contenu
                                            </Text>
                                            <SimpleGrid cols={{base: 1, sm: 3,}} spacing="sm">
                                                {MEDIA_TYPES.map(
                                                    (type) => {const Icon = type.icon;
                                                        const active = mediaType === type.value;
                                                        return (
                                                            <Paper key={type.value} withBorder p="md" radius="lg" onClick={() => changeMediaType(type.value,
                                                            )
                                                                }
                                                                style={{
                                                                    cursor: 'pointer',
                                                                    borderColor: active ? 'var(--mantine-color-forest-6)' : undefined,
                                                                    background: active ? 'var(--mantine-color-forest-0)' : undefined,
                                                                    transition: 'all 150ms ease',
                                                                }}
                                                            >
                                                                <Stack gap={'sm'}>
                                                                    <Group justify="space-between">
                                                                        <ThemeIcon size={36} radius="md" variant={active ? 'filled' : 'light'} color="forest">
                                                                            <Icon size={19}/>
                                                                        </ThemeIcon>

                                                                        {active && (
                                                                            <ThemeIcon size={22} radius="xl" color="forest">
                                                                                <IconCheck size={13}/>
                                                                            </ThemeIcon>
                                                                        )}
                                                                    </Group>

                                                                    <Stack gap={2}>
                                                                        <Text size="sm" fw={650}>
                                                                            {type.shortLabel}
                                                                        </Text>
                                                                        <Text size="xs" c="dimmed" lh={1.35}>
                                                                            {type.description}
                                                                        </Text>
                                                                    </Stack>
                                                                </Stack>
                                                            </Paper>
                                                        );
                                                    },
                                                )}
                                            </SimpleGrid>
                                        </Stack>

                                        <Box>
                                            <Text size="sm" fw={600} mb={6}>
                                                Fichier
                                            </Text>
                                            <Text size="xs" c="dimmed" mb="sm">
                                                Format accepté :{' '}
                                                {selectedType.shortLabel}
                                                {' · '}
                                                maximum{' '}
                                                {
                                                    selectedType.maxSizeMb
                                                }{' '}
                                                Mo
                                            </Text>

                                            {!file ? (
                                                <FileDropzone
                                                    accept={
                                                        selectedType.accept
                                                    }
                                                    maxSizeMb={
                                                        selectedType.maxSizeMb
                                                    }
                                                    onDrop={handleFileDrop} onReject={handleFileReject}
                                                    label="Déposer votre fichier ici" height={190}
                                                    icon={<IconUpload size={28}/>}
                                                />
                                            ) : (
                                                <Paper withBorder radius="lg" p="md">
                                                    <Group justify="space-between" wrap="nowrap">
                                                        <Group wrap="nowrap" gap="md">
                                                            <ThemeIcon size={46} radius="md" color="forest" variant="light">
                                                                <IconFile size={23}/>
                                                            </ThemeIcon>

                                                            <Stack gap={2} style={{minWidth: 0,}}>
                                                                <Text size="sm" fw={600} truncate>
                                                                    {file.name}
                                                                </Text>
                                                                <Group gap="xs">
                                                                    <Badge size="xs" variant="light" color="forest">
                                                                        {selectedType.shortLabel}
                                                                    </Badge>

                                                                    <Text size="xs" c="dimmed">
                                                                        {formatFileSize(file.size,)}
                                                                    </Text>
                                                                </Group>
                                                            </Stack>
                                                        </Group>

                                                        <ActionIcon variant="subtle" color="red" onClick={removeFile} aria-label="Supprimer le fichier">
                                                            <IconTrash size={17}/>
                                                        </ActionIcon>
                                                    </Group>
                                                    {mediaType === 'audio' && (
                                                            <Box mt="md">
                                                                <audio controls style={{width: '100%',}} src={URL.createObjectURL(
                                                                        file,
                                                                    )}
                                                                />
                                                            </Box>
                                                        )}
                                                    {mediaType === 'video' && (
                                                            <Box mt="md" style={{
                                                                    overflow: 'hidden',
                                                                    borderRadius: 12,
                                                                    background: '#111',
                                                                }}
                                                            >
                                                                <video controls style={{
                                                                        width: '100%',
                                                                        maxHeight: 360,
                                                                        display: 'block',
                                                                    }} src={URL.createObjectURL(
                                                                        file,
                                                                    )}
                                                                />
                                                            </Box>
                                                        )}

                                                    {mediaType ===
                                                        'epub' && (
                                                            <Alert mt="md" color="gray" variant="light"
                                                                icon={<IconInfoCircle size={17}/>}>
                                                                Le fichier EPUB sera distribué au lecteur après validation et publication.
                                                            </Alert>
                                                        )}
                                                </Paper>
                                            )}
                                            {fieldErrors.file && (
                                                <Text size="xs" c="red" mt="xs">
                                                    {
                                                        fieldErrors.file
                                                    }
                                                </Text>
                                            )}
                                        </Box>
                                    </Stack>
                                </Paper>

                                {/* -----------------------------------------
                                    COVER
                                ----------------------------------------- */}

                                <Paper withBorder radius="xl"
                                    p={{
                                        base: 'lg',
                                        md: 'xl',
                                    }}
                                    bg="white"
                                >
                                    <Stack gap="xl">
                                        <Group justify="space-between" align="flex-start">
                                            <Group gap="sm">
                                                <ThemeIcon size={40} radius="md" color="gold" variant="light">
                                                    <IconPhoto size={21}/>
                                                </ThemeIcon>
                                                <Stack gap={1}>
                                                    <Text fw={700}>
                                                        Couverture
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        L'image en avant de votre publication
                                                    </Text>
                                                </Stack>
                                            </Group>

                                            <Badge variant="light" color="gray">
                                                Étape 3
                                            </Badge>
                                        </Group>

                                        <Grid align="center">
                                            <Grid.Col span={{
                                                    base: 12,
                                                    sm: 5,
                                                }}
                                            >
                                                <Box style={{
                                                        aspectRatio:
                                                            '3 / 4',
                                                        maxWidth: 260,
                                                        margin: '0 auto',
                                                        position: 'relative',
                                                        overflow: 'hidden',
                                                        borderRadius: 16,
                                                        background: 'var(--mantine-color-gray-1)',
                                                        border: '1px solid var(--mantine-color-gray-2)',
                                                    }}
                                                >
                                                    {coverPreview ? (
                                                        <>
                                                            <Image src={coverPreview}
                                                                h="100%"
                                                                w="100%"
                                                                fit="cover"
                                                            />
                                                            <ActionIcon size="sm" radius="xl" color="red" variant="filled" style={{
                                                                    position: 'absolute',
                                                                    top: 10,
                                                                    right: 10,
                                                                }}
                                                                onClick={removeCover} aria-label="Supprimer la couverture"
                                                            >
                                                                <IconX size={14}/>
                                                            </ActionIcon>
                                                        </>
                                                    ) : (
                                                        <Stack align="center" justify="center" h="100%" gap="xs">
                                                            <ThemeIcon size={54}
                                                                radius="xl"
                                                                variant="light"
                                                                color="gray"
                                                            >
                                                                <IconPhoto size={26}/>
                                                            </ThemeIcon>

                                                            <Text size="xs" c="dimmed" ta="center" px="md">
                                                                Aperçu de couverture
                                                            </Text>
                                                        </Stack>
                                                    )}
                                                </Box>
                                            </Grid.Col>

                                            <Grid.Col span={{base: 12, sm: 7,}}>
                                                <Stack gap="md">
                                                    <Text size="sm" fw={600}>
                                                        Importer une couverture
                                                    </Text>

                                                    <Text size="xs" c="dimmed" lh={1.5}>
                                                        Utilisez une image nette et lisible.
                                                    </Text>

                                                    <FileDropzone
                                                        accept={
                                                            COVER_ACCEPT
                                                        }
                                                        maxSizeMb={10}
                                                        onDrop={
                                                            handleCoverDrop
                                                        } onReject={handleCoverReject}
                                                        label={cover ? 'Changer la couverture' : 'Déposer une couverture'}
                                                        height={125}
                                                        icon={<IconPhoto size={22}/>}
                                                    />

                                                    <Text size="xs" c="dimmed">
                                                        JPG, PNG ou WebP
                                                        {' · '}
                                                        10 Mo maximum
                                                    </Text>

                                                    {fieldErrors.cover && (
                                                        <Text size="xs" c="red">
                                                            {
                                                                fieldErrors.cover
                                                            }
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </Grid.Col>
                                        </Grid>
                                    </Stack>
                                </Paper>

                                {/* -----------------------------------------
                                    MONETIZATION
                                ----------------------------------------- */}

                                <Paper withBorder
                                    radius="xl"
                                    p={{
                                        base: 'lg',
                                        md: 'xl',
                                    }}
                                    bg="white"
                                >
                                    <Stack gap="xl">
                                        <Group
                                            justify="space-between"
                                            align="flex-start"
                                        >
                                            <Group gap="sm">
                                                <ThemeIcon
                                                    size={40}
                                                    radius="md"
                                                    color="gold"
                                                    variant="light"
                                                >
                                                    <Text
                                                        fw={800}
                                                        size="sm"
                                                    >
                                                        XAF
                                                    </Text>
                                                </ThemeIcon>

                                                <Stack gap={1}>
                                                    <Text
                                                        fw={700}
                                                    >
                                                        Monétisation
                                                    </Text>

                                                    <Text size="xs" c="dimmed">
                                                        Définissez les conditions d'accès à la publication
                                                    </Text>
                                                </Stack>
                                            </Group>

                                            <Badge variant="light" color="gray">
                                                Étape 4
                                            </Badge>
                                        </Group>

                                        <Paper withBorder radius="lg" p="md" bg="gray.0">
                                            <Group justify="space-between" wrap="nowrap">
                                                <Group wrap="nowrap" gap="sm">
                                                    <ThemeIcon size={38} radius="md"
                                                        color={isPremium ? 'gold' : 'gray'}
                                                        variant="light"
                                                    >{isPremium ? (<IconCheck size={19}/>) : (<IconInfoCircle size={19}/>)}
                                                    </ThemeIcon>

                                                    <Stack gap={1}>
                                                        <Text size="sm" fw={650}>
                                                            Contenu premium
                                                        </Text>

                                                        <Text size="xs" c="dimmed">
                                                            {isPremium ? 'Le lecteur devra acheter un accès pour consulter le contenu complet.' : 'Le contenu sera accessible gratuitement.'}
                                                        </Text>
                                                    </Stack>
                                                </Group>

                                                <Switch checked={isPremium} onChange={(event,) =>
                                                        setIsPremium(
                                                            event
                                                                .currentTarget
                                                                .checked,
                                                        )
                                                    }
                                                    size="md"
                                                    color="gold"
                                                />
                                            </Group>
                                        </Paper>

                                        {isPremium && (
                                            <Grid>
                                                <Grid.Col span={{base: 12, sm: 6,}}>
                                                    <NumberInput
                                                        label="Prix de vente"
                                                        description="Montant payé par le lecteur pour accéder au contenu."
                                                        min={100}
                                                        step={100}
                                                        value={price}
                                                        onChange={(value,) => setPrice(
                                                                typeof value === 'number' ? value : value === '' ? '' : Number(value,),
                                                            )
                                                        }
                                                        error={fieldErrors.price}
                                                        suffix=" XAF"
                                                        thousandSeparator=","
                                                        size="md"
                                                        radius="md"
                                                    />
                                                </Grid.Col>

                                                <Grid.Col span={{base: 12, sm: 6,}}>
                                                    <NumberInput
                                                        label="Aperçu gratuit"
                                                        description={mediaType === 'epub' ? 'Nombre de pages accessibles gratuitement.'
                                                                : mediaType === 'audio' ? 'Nombre de minutes accessibles gratuitement.' : 'Durée accessible gratuitement.'
                                                        }
                                                        min={0}
                                                        value={freePreviewUnits}
                                                        onChange={(value,) => setFreePreviewUnits(typeof value ===
                                                                'number' ? value : value === '' ? ''
                                                                        : Number(
                                                                            value,
                                                                        ),
                                                            )
                                                        }
                                                        size="md"
                                                        radius="md"
                                                    />
                                                </Grid.Col>
                                            </Grid>
                                        )}
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Grid.Col>

                        {/* =================================================
                            PREVIEW / SIDEBAR
                        ================================================= */}

                        <Grid.Col span={{base: 12, lg: 4}}>
                            <Box
                                style={{position: 'sticky', top: 24,}}>
                                <Stack gap="lg">
                                    <Paper withBorder radius="xl" bg="white" style={{overflow: 'hidden',}}>
                                        <Box px="lg" pt="lg">
                                            <Group justify="space-between">
                                                <Stack gap={1}>
                                                    <Text fw={700}>
                                                        Aperçu lecteur
                                                    </Text>

                                                    <Text size="xs" c="dimmed">
                                                        Ce que votre publication commencera à ressembler dans le catalogue
                                                    </Text>
                                                </Stack>

                                                <ThemeIcon size={32} radius="xl" color="forest" variant="light">
                                                    <IconPlayerPlay size={16}/>
                                                </ThemeIcon>
                                            </Group>
                                        </Box>
                                        <Box p="lg">
                                            <Paper withBorder radius="lg"
                                                style={{overflow: 'hidden',}}
                                            >
                                                <Box
                                                    style={{
                                                        aspectRatio:
                                                            '16 / 9',
                                                        background:
                                                            'var(--mantine-color-gray-1)',
                                                        position:
                                                            'relative',
                                                        overflow:
                                                            'hidden',
                                                    }}
                                                >
                                                    {coverPreview ? (<Image src={coverPreview}
                                                            h="100%"
                                                            w="100%"
                                                            fit="cover"
                                                        />
                                                    ) : (
                                                        <Stack
                                                            align="center"
                                                            justify="center"
                                                            h="100%"
                                                        >
                                                            <IconPhoto size={32}
                                                                color="var(--mantine-color-gray-4)"
                                                            />

                                                            <Text size="xs" c="dimmed">
                                                                Votre couverture
                                                            </Text>
                                                        </Stack>
                                                    )}

                                                    <Badge
                                                        variant="filled"
                                                        color={isPremium ? 'gold' : 'gray'}
                                                        style={{position: 'absolute', top: 12, left: 12,}}
                                                    >
                                                        {isPremium ? 'Premium' : 'Gratuit'}
                                                    </Badge>
                                                </Box>

                                                <Stack p="md" gap="sm">
                                                    <Group justify="space-between">
                                                        <Badge size="sm" variant="light" color="forest">
                                                            {
                                                                selectedType.shortLabel
                                                            }
                                                        </Badge>

                                                        {isPremium && (
                                                            <Text size="sm" fw={700}>
                                                                {Number(
                                                                    price ||
                                                                    0,
                                                                ).toLocaleString(
                                                                    'fr-FR',
                                                                )}{' '}
                                                                XAF
                                                            </Text>
                                                        )}
                                                    </Group>

                                                    <Text fw={700} size="lg" lh={1.2} lineClamp={3}>
                                                        {title.trim() || 'Titre de votre publication'}
                                                    </Text>
                                                    <Text size="sm"
                                                        c={
                                                            summary.trim()
                                                                ? 'dark'
                                                                : 'dimmed'
                                                        }
                                                        lh={1.5}
                                                        lineClamp={5}
                                                    >
                                                        {summary.trim() ||
                                                            'Votre chapô apparaîtra ici. Il permet au lecteur de comprendre rapidement pourquoi votre publication mérite son attention.'}
                                                    </Text>

                                                    {categoryId && (
                                                        <Group gap={6}>
                                                            <Badge size="xs" variant="dot" color="forest">
                                                                {
                                                                    categoryOptions.find(
                                                                        (category,) => category.value === categoryId,
                                                                    )?.label
                                                                }
                                                            </Badge>
                                                        </Group>
                                                    )}

                                                    {tags.length > 0 && (
                                                            <Group gap={5}>
                                                                {tags.slice(0, 4,).map(
                                                                        (tag,) => (
                                                                            <Badge
                                                                                key={tag}
                                                                                size="xs"
                                                                                variant="light"
                                                                                color="gray"
                                                                            >
                                                                                {tag}
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                            </Group>
                                                        )}

                                                    <Divider />

                                                    <Group justify="space-between">
                                                        <Text size="xs" c="dimmed">
                                                            PayMedia
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            Brouillon
                                                        </Text>
                                                    </Group>
                                                </Stack>
                                            </Paper>
                                        </Box>
                                    </Paper>


                                </Stack>
                            </Box>
                        </Grid.Col>
                    </Grid>

                    {/* =====================================================
                        FOOTER ACTIONS
                    ===================================================== */}
                    <Paper withBorder radius="xl" p="md" mt="xl" bg="white">
                        <Group justify="space-between" align="center">
                            <Group gap="sm">
                                <ThemeIcon size={34} radius="md" color={completion === 100 ? 'forest' : 'gray'} variant="light">
                                    {completion === 100 ? (<IconCircleCheck size={18}/>
                                    ) : (<IconInfoCircle size={18}/>)}
                                </ThemeIcon>
                                <Stack gap={1}>
                                    <Text size="sm" fw={600}>
                                        {completion === 100 ? 'Votre contenu est prêt.' : 'Votre contenu sera enregistré en brouillon.'}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                        Vous pourrez continuer à le modifier après l'enregistrement.
                                    </Text>
                                </Stack>
                            </Group>
                            <Group>
                                <Button variant="subtle" color="red" onClick={() => navigate('/editor/contents',)} disabled={isSaving}>
                                    Annuler
                                </Button>

                                <Button type="submit" size="md" radius="md" color="forest" leftSection={isSaving ? (
                                            <Loader size={17} color="white"/>
                                ) : (<IconCircleCheck size={17}/>)
                                    } disabled={isSaving}
                                >
                                    {isSaving ? 'Enregistrement...' : 'Enregistrer le brouillon'}
                                </Button>
                            </Group>
                        </Group>
                    </Paper>
                </form>
            </Container>
        </Box>
    );
}

interface ChecklistItemProps {
    checked: boolean;
    label: string;
    optional?: boolean;
}

function ChecklistItem({checked, label, optional = false,}: ChecklistItemProps) {
    return (
        <Group gap="xs" wrap="nowrap">
            <ThemeIcon size={22} radius="xl" color={checked ? 'forest' : optional ? 'gray' : 'gold'} variant={checked ? 'filled' : 'light'}>
                {checked ? (<IconCheck size={12} />) : (<IconInfoCircle size={12} />)}
            </ThemeIcon>
            <Text size="xs" c={checked ? 'dark' : 'dimmed'} fw={checked ? 500 : 400}>
                {label}
                {optional && !checked && (
                    <Text component="span" size="xs" c="dimmed">{' '}(optionnel)</Text>
                )}
            </Text>
        </Group>
    );
}