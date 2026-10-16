import { Container, Title, Text, Card, Avatar, Group, Badge, Box } from '@mantine/core';
import { useAuthStore } from '../../stores/auth';

export default function Profile() {
    const { user } = useAuthStore();

    return (
        <Container fluid>
            <Title order={2} mb="lg">👤 Mon profil</Title>

            <Card withBorder p="xl" style={{ maxWidth: 500 }}>
                <Group>
                    <Avatar size={80} radius="xl" color="blue" style={{ backgroundColor: '#3080ec' }}>
                        {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                    </Avatar>
                    <Box>
                        <Text fw={700} size="xl">{user?.username || 'Admin'}</Text>
                        <Text c="dimmed">{user?.email}</Text>
                        <Badge color="blue" mt="xs">{user?.role || 'admin'}</Badge>
                    </Box>
                </Group>

                <Box mt="lg">
                    <Text size="sm" c="dimmed">ID: {user?.id || 'N/A'}</Text>
                    <Text size="sm" c="dimmed">Rôle: {user?.role || 'admin'}</Text>
                </Box>
            </Card>
        </Container>
    );
}