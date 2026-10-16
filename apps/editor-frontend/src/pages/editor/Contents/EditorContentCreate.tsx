import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Title,
    Text,
    TextInput,
    Textarea,
    Select,
    NumberInput,
    FileInput,
    Button,
    Group,
    Stack,
    Divider,
    Alert,
    Loader,
    Box,
    Image,
    SimpleGrid,
} from '@mantine/core';
import { IconArrowLeft, IconUpload, IconPhoto, IconFile } from '@tabler/icons-react';
import { useContentStore } from '@/stores';

export const EditorContentCreate = () => {
    const navigate = useNavigate();
    const { createContent, fetchCategories, categories, isLoading, error, clearError } = useContentStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        media_type: '',
        price: 0,
        category_id: '',
    });

    const [file, setFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Charger les catégories au montage
    useEffect(() => {
        fetchCategories();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCoverChange = (file: File | null) => {
        setCoverImage(file);
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!formData.title.trim()) {
            alert('Le titre est obligatoire');
            return;
        }

        if (!formData.media_type) {
            alert('Veuillez sélectionner un type de média');
            return;
        }

        if (!file) {
            alert('Veuillez sélectionner un fichier');
            return;
        }

        // Vérifier la taille du fichier (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            alert('Le fichier est trop volumineux (max 100MB)');
            return;
        }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description || '');
            formDataToSend.append('mediaType', formData.media_type);
            formDataToSend.append('price', formData.price.toString());
            if (formData.category_id) {
                formDataToSend.append('category_id', formData.category_id);
            }
            formDataToSend.append('file', file);
            if (coverImage) {
                formDataToSend.append('cover_image', coverImage);
            }

            setUploadProgress(10);
            const content = await createContent(formDataToSend);
            setUploadProgress(100);

            alert('Contenu créé avec succès !');
            navigate('/editor/contents');
        } catch (error: any) {
            console.error('Erreur création:', error);
            alert(error.response?.data?.message || 'Erreur lors de la création du contenu');
        }
    };

    const mediaTypes = [
        { value: 'epub', label: '📖 EPUB (Livre numérique)' },
        { value: 'audio', label: '🎵 Audio (MP3, WAV)' },
        { value: 'video', label: '🎬 Vidéo (MP4, MOV)' },
    ];

    const categoryOptions = (Array.isArray(categories) ? categories : []).map((cat) => ({
        value: cat.id.toString(),
        label: cat.name,
    }));

    return (
        <Container size="lg" py="xl">
            <Paper shadow="sm" p="xl" radius="md">
                <Group mb="lg">
                    <Button
                        variant="subtle"
                        leftSection={<IconArrowLeft size={16} />}
                        onClick={() => navigate('/editor/contents')}
                    >
                        Retour
                    </Button>
                    <Title order={2}>Créer un nouveau contenu</Title>
                </Group>

                <Divider mb="xl" />

                {error && (
                    <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Stack gap="md">
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <TextInput
                                label="Titre"
                                placeholder="Entrez le titre du contenu"
                                required
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                size="md"
                            />

                            <Select
                                label="Type de média"
                                placeholder="Sélectionnez un type"
                                required
                                data={mediaTypes}
                                value={formData.media_type}
                                onChange={(value) => handleChange('media_type', value)}
                                size="md"
                            />
                        </SimpleGrid>

                        <Textarea
                            label="Description"
                            placeholder="Décrivez votre contenu"
                            minRows={4}
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            size="md"
                        />

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <NumberInput
                                label="Prix (FCFA)"
                                placeholder="0"
                                min={0}
                                step={100}
                                value={formData.price}
                                onChange={(value) => handleChange('price', value || 0)}
                                size="md"
                                leftSection="XAF"
                            />

                            <Select
                                label="Catégorie"
                                placeholder="Sélectionnez une catégorie"
                                data={categoryOptions}
                                value={formData.category_id}
                                onChange={(value) => handleChange('category_id', value)}
                                size="md"
                                disabled={categories.length === 0}
                            />
                        </SimpleGrid>

                        <FileInput
                            label="Fichier du contenu"
                            placeholder="Cliquez pour sélectionner un fichier"
                            required
                            accept=".epub,.pdf,.mp3,.wav,.mp4,.mov,.avi"
                            leftSection={<IconUpload size={16} />}
                            value={file}
                            onChange={setFile}
                            size="md"
                        />

                        <FileInput
                            label="Image de couverture (optionnel)"
                            placeholder="Sélectionnez une image de couverture"
                            accept="image/png,image/jpeg,image/webp"
                            leftSection={<IconPhoto size={16} />}
                            value={coverImage}
                            onChange={handleCoverChange}
                            size="md"
                        />

                        {previewUrl && (
                            <Box mt="sm">
                                <Image
                                    src={previewUrl}
                                    alt="Aperçu de la couverture"
                                    width={200}
                                    height={280}
                                    fit="cover"
                                    radius="md"
                                />
                            </Box>
                        )}

                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <Box>
                                <Text size="sm">Upload en cours... {uploadProgress}%</Text>
                                <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
                            </Box>
                        )}

                        <Group justify="flex-end" mt="xl">
                            <Button
                                variant="light"
                                onClick={() => navigate('/editor/contents')}
                                disabled={isLoading}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                color="blue"
                                leftSection={isLoading ? <Loader size="xs" /> : <IconFile size={16} />}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Création en cours...' : 'Créer le contenu'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
};