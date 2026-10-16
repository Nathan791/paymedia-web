// src/pages/editor/Dashboard/EditorDashboard.tsx
import { useEffect } from 'react';
import {
    Container,
    Paper,
    Title,
    Text,
    SimpleGrid,
    Card,
    Group,
    Badge,
    Stack,
    Loader,
    Alert,
    Box,
    Button,
} from '@mantine/core';
import {
    IconFileText,
    IconCoin,
    IconTrendingUp,
    IconEye,
    IconPlus,
} from '@tabler/icons-react';
import { useContentStore } from '@/stores';
import { useNavigate } from 'react-router-dom';

export const EditorDashboard = () => {
    const navigate = useNavigate();
    const { contents, isLoading, error, fetchContents, clearError } = useContentStore();

    useEffect(() => {
        fetchContents();
    }, []);

    // S'assurer que contents est un tableau
    const contentsArray = Array.isArray(contents) ? contents : [];

    return (
        <Container size="xl" py="xl">
            <Stack gap="lg">
                {/* En-tête */}
                <Group justify="space-between">
                    <Stack gap="0">
                        <Title order={2}>Dashboard</Title>
                        <Text size="sm" c="dimmed">
                            Bienvenue sur votre espace éditeur
                        </Text>
                    </Stack>
                    <Badge size="lg" color="#0CAF7A" variant="light" radius="sm">
                        Éditeur
                    </Badge>
                </Group>

                {error && (
                    <Alert color="red" onClose={clearError} withCloseButton>
                        {error}
                    </Alert>
                )}

                {/* Statistiques réelles */}
                {isLoading ? (
                    <Loader size="md" />
                ) : (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between">
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase">Total des contenus</Text>
                                    <Text size="xl" fw={700} c="#0CAF7A">{contentsArray.length}</Text>
                                </Box>
                                <Box
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        backgroundColor: '#E8F5F0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#0CAF7A',
                                    }}
                                >
                                    <IconFileText size={24} stroke={1.5} />
                                </Box>
                            </Group>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between">
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase">Publiés</Text>
                                    <Text size="xl" fw={700} c="#228be6">
                                        {contentsArray.filter(c => c.status === 'publie').length}
                                    </Text>
                                </Box>
                                <Box
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        backgroundColor: '#e7f5ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#228be6',
                                    }}
                                >
                                    <IconEye size={24} stroke={1.5} />
                                </Box>
                            </Group>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between">
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase">Vues totales</Text>
                                    <Text size="xl" fw={700} c="#fab005">0</Text>
                                </Box>
                                <Box
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        backgroundColor: '#fff3cd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fab005',
                                    }}
                                >
                                    <IconTrendingUp size={24} stroke={1.5} />
                                </Box>
                            </Group>
                        </Card>

                        <Card shadow="sm" padding="lg" radius="md" withBorder>
                            <Group justify="space-between">
                                <Box>
                                    <Text size="xs" c="dimmed" fw={500} tt="uppercase">Revenus</Text>
                                    <Text size="xl" fw={700} c="#0CAF7A">0 XAF</Text>
                                </Box>
                                <Box
                                    style={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: '12px',
                                        backgroundColor: '#E8F5F0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#0CAF7A',
                                    }}
                                >
                                    <IconCoin size={24} stroke={1.5} />
                                </Box>
                            </Group>
                        </Card>
                    </SimpleGrid>
                )}

                {/* Zone d'action rapide */}
                <Paper shadow="sm" p="xl" radius="md" withBorder>
                    <Stack align="center" gap="md">
                        <Title order={3} ta="center">Commencer à publier</Title>
                        <Text c="dimmed" ta="center">
                            Vous n'avez pas encore de contenu. Créez votre premier contenu dès maintenant.
                        </Text>
                        <Button
                            size="lg"
                            color="#0CAF7A"
                            leftSection={<IconPlus size={20} />}
                            onClick={() => navigate('/editor/contents/create')}
                        >
                            Créer mon premier contenu
                        </Button>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
};