import {useEffect, useState, type FormEvent,} from 'react';
import {useNavigate, useParams,
} from 'react-router-dom';

import {
    Alert,
    Box,
    Button,
    Container,
    Divider,
    FileInput,
    Group,
    Image,
    Loader,
    NumberInput,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    Textarea,
    Title,
} from '@mantine/core';

import {
    IconArrowLeft,
    IconDeviceFloppy,
    IconPhoto,
    IconUpload,
} from '@tabler/icons-react';

import { notifications } from '@mantine/notifications';

import { useContentStore } from '@/stores';

interface FormState {
    title: string;
    description: string;
    mediaType: string;
    price: number;
    categoryId: string;
    isPremium: boolean;
}

const INITIAL_FORM: FormState = {
    title: '',
    description: '',
    mediaType: '',
    price: 0,
    categoryId: '',
    isPremium: false,
};

const MEDIA_TYPES = [
    {
        value: 'epub',
        label: 'EPUB (Livre numérique)',
    },
    {
        value: 'audio',
        label: 'Audio (MP3, WAV)',
    },
    {
        value: 'video',
        label: 'Vidéo (MP4, MOV)',
    },
];

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const EditorContentEdit = () => {
    const navigate = useNavigate();

    const { id } = useParams<{
        id: string;
    }>();

    const {
        currentContent,
        categories,
        isLoading,
        error,
        fetchContent,
        fetchCategories,
        updateContent,
        clearError,
    } = useContentStore();

    const [formData, setFormData] =
        useState<FormState>(INITIAL_FORM);

    const [file, setFile] =
        useState<File | null>(null);

    const [coverImage, setCoverImage] =
        useState<File | null>(null);

    const [previewUrl, setPreviewUrl] =
        useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }
        fetchContent(id);
        fetchCategories();
    }, [id, fetchContent, fetchCategories]);

    useEffect(() => {
        if (!currentContent) {
            return;
        }

        setFormData({
            title: currentContent.title || '',
            description:
                currentContent.description || '',
            mediaType:
                currentContent.mediaType || '',
            price:
                typeof currentContent.price === 'string'
                    ? Number(currentContent.price)
                    : currentContent.price || 0,
            categoryId:
                currentContent.categoryId
                    ? String(currentContent.categoryId)
                    : '',
            isPremium:
                currentContent.isPremium || false,
        });

        const existingCover =
            currentContent.coverUrl ||
            currentContent.coverImage ||
            null;

        setPreviewUrl(existingCover);
    }, [currentContent]);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const updateField = <K extends keyof FormState>(
        field: K,
        value: FormState[K]
    ) => {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleCoverChange = (
        selectedFile: File | null
    ) => {
        setCoverImage(selectedFile);

        if (!selectedFile) {
            setPreviewUrl(
                currentContent?.coverUrl ||
                currentContent?.coverImage ||
                null
            );
            return;
        }

        const objectUrl =
            URL.createObjectURL(selectedFile);

        setPreviewUrl(objectUrl);
    };

    const validateForm = (): boolean => {
        if (!formData.title.trim()) {
            notifications.show({
                title: 'Validation',
                message: 'Le titre est obligatoire',
            });

            return false;
        }

        if (!formData.mediaType) {
            notifications.show({
                title: 'Validation',
                message:
                    'Veuillez sélectionner un type de média',
            });

            return false;
        }

        if (file && file.size > MAX_FILE_SIZE) {
            notifications.show({
                title: 'Validation',
                message:
                    'Le fichier ne doit pas dépasser 100 MB',
            });

            return false;
        }

        if (!id) {
            notifications.show({
                title: 'Validation',
                message:
                    'Identifiant du contenu manquant',
            });

            return false;
        }

        return true;
    };

    const buildFormData = (): FormData => {
        const data = new FormData();

        data.append(
            'title',
            formData.title.trim()
        );

        data.append(
            'description',
            formData.description
        );

        data.append(
            'mediaType',
            formData.mediaType
        );

        data.append(
            'price',
            String(formData.price)
        );

        data.append(
            'isPremium',
            String(formData.isPremium)
        );

        if (formData.categoryId) {
            data.append(
                'categoryId',
                formData.categoryId
            );
        }

        if (file) {
            data.append('file', file);
        }

        if (coverImage) {
            data.append(
                'cover',
                coverImage
            );
        }

        return data;
    };

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (!validateForm() || !id) {
            return;
        }

        setIsSubmitting(true);

        try {
            const data = buildFormData();

            await updateContent(id, data);

            notifications.show({
                title: 'Modification',
                message:
                    'Contenu modifié avec succès',
            });

            navigate('/editor/contents');
        } catch (error) {
            const message =
                error &&
                typeof error === 'object' &&
                'response' in error
                    ? (
                        error as {
                            response?: {
                                data?: {
                                    message?: string;
                                };
                            };
                        }
                    ).response?.data?.message
                    : undefined;

            notifications.show({
                title: 'Erreur',
                message:
                    message ||
                    'Erreur lors de la modification du contenu',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePriceChange = (
        value: string | number
    ) => {
        const price =
            typeof value === 'number'
                ? value
                : Number(value) || 0;

        updateField('price', price);
    };

    const categoryOptions = categories.map(
        (category) => ({
            value: String(category.id),
            label: category.name,
        })
    );

    if (isLoading && !currentContent) {
        return (
            <Container size="lg" py="xl">
                <Loader />
            </Container>
        );
    }

    if (!currentContent && !isLoading) {
        return (
            <Container size="lg" py="xl">
                <Alert title="Contenu introuvable">
                    Le contenu demandé n'existe pas ou
                    n'est plus disponible.
                </Alert>

                <Button
                    mt="md"
                    variant="light"
                    onClick={() =>
                        navigate('/editor/contents')
                    }
                >
                    Retour aux contenus
                </Button>
            </Container>
        );
    }

    return (
        <Container size="lg" py="xl">
            <Paper
                shadow="sm"
                p="xl"
                radius="md"
            >
                <Group mb="lg">
                    <Button
                        variant="subtle"
                        leftSection={
                            <IconArrowLeft size={16} />
                        }
                        onClick={() =>
                            navigate(
                                '/editor/contents'
                            )
                        }
                    >
                        Retour
                    </Button>

                    <Title order={2}>
                        Modifier le contenu
                    </Title>
                </Group>

                <Divider mb="xl" />

                {error && (
                    <Alert
                        title="Erreur"
                        mb="md"
                        withCloseButton
                        onClose={clearError}
                    >
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <SimpleGrid
                            cols={{
                                base: 1,
                                sm: 2,
                            }}
                        >
                            <TextInput
                                label="Titre"
                                placeholder="Titre du contenu"
                                required
                                value={
                                    formData.title
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        'title',
                                        event
                                            .currentTarget
                                            .value
                                    )
                                }
                            />

                            <Select
                                label="Type de média"
                                placeholder="Sélectionnez un type"
                                required
                                data={
                                    MEDIA_TYPES
                                }
                                value={
                                    formData.mediaType
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        'mediaType',
                                        value || ''
                                    )
                                }
                            />
                        </SimpleGrid>

                        <Textarea
                            label="Description"
                            placeholder="Description du contenu"
                            minRows={4}
                            value={
                                formData.description
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    'description',
                                    event
                                        .currentTarget
                                        .value
                                )
                            }
                        />

                        <SimpleGrid
                            cols={{
                                base: 1,
                                sm: 2,
                            }}
                        >
                            <NumberInput
                                label="Prix (FCFA)"
                                min={0}
                                step={100}
                                value={
                                    formData.price
                                }
                                onChange={
                                    handlePriceChange
                                }
                                leftSection="XAF"
                            />

                            <Select
                                label="Catégorie"
                                placeholder="Sélectionnez une catégorie"
                                data={
                                    categoryOptions
                                }
                                value={
                                    formData.categoryId
                                }
                                onChange={(
                                    value
                                ) =>
                                    updateField(
                                        'categoryId',
                                        value || ''
                                    )
                                }
                                disabled={
                                    categories.length ===
                                    0
                                }
                            />
                        </SimpleGrid>

                        <Switch
                            label="Contenu premium"
                            description="Mettre ce contenu en avant comme contenu premium"
                            checked={
                                formData.isPremium
                            }
                            onChange={(
                                event
                            ) =>
                                updateField(
                                    'isPremium',
                                    event
                                        .currentTarget
                                        .checked
                                )
                            }
                        />

                        <Divider
                            label="Fichiers"
                        />

                        <Text
                            size="sm"
                            c="dimmed"
                        >
                            Laissez les champs vides
                            pour conserver les fichiers
                            actuels.
                        </Text>

                        <FileInput
                            label="Nouveau fichier"
                            placeholder="Sélectionnez un fichier"
                            accept=".epub,.pdf,.mp3,.wav,.mp4,.mov,.avi"
                            leftSection={
                                <IconUpload
                                    size={16}
                                />
                            }
                            value={file}
                            onChange={setFile}
                        />

                        <FileInput
                            label="Nouvelle couverture"
                            placeholder="Sélectionnez une image"
                            accept="image/png,image/jpeg,image/webp"
                            leftSection={
                                <IconPhoto
                                    size={16}
                                />
                            }
                            value={
                                coverImage
                            }
                            onChange={
                                handleCoverChange
                            }
                        />

                        {previewUrl && (
                            <Box>
                                <Text
                                    size="sm"
                                    fw={500}
                                    mb="xs"
                                >
                                    Aperçu de la
                                    couverture
                                </Text>

                                <Image
                                    src={previewUrl}
                                    alt="Couverture"
                                    w={200}
                                    h={280}
                                    fit="cover"
                                    radius="md"
                                />
                            </Box>
                        )}

                        <Group
                            justify="flex-end"
                            mt="xl"
                        >
                            <Button
                                variant="light"
                                disabled={
                                    isSubmitting
                                }
                                onClick={() =>
                                    navigate(
                                        '/editor/contents'
                                    )
                                }
                            >
                                Annuler
                            </Button>

                            <Button
                                type="submit"
                                leftSection={
                                    isSubmitting ? (
                                        <Loader size="xs" />
                                    ) : (
                                        <IconDeviceFloppy
                                            size={16}
                                        />
                                    )
                                }
                                loading={
                                    isSubmitting
                                }
                            >
                                Enregistrer les
                                modifications
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};