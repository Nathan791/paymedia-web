// src/pages/Profile/EditorProfile.tsx
import { Container, Paper, Text, Group, Stack, Avatar, TextInput, Button, SimpleGrid, Badge, Divider } from '@mantine/core';
import { useAuthStore } from '@/stores/auth.store';
import { notifications } from '@mantine/notifications';

function initials(name: string) {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function EditorProfile() {
    const user = useAuthStore((s) => s.user);
    if (!user) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        notifications.show({ title: 'Profil mis à jour', message: 'Vos informations ont bien été enregistrées.', color: 'forest' });
    };

    return (
        <Container size="sm" py="xl">
            <Paper radius="lg" p="xl" mb="lg">
                <Group>
                    <Avatar size={64} radius="xl" color="forest" variant="light">{initials(user.displayName)}</Avatar>
                    <div>
                        <Text fw={700} size="lg" style={{ fontFamily: 'Fraunces, serif' }}>{user.displayName}</Text>
                        <Text size="sm" c="dimmed">{user.organization}</Text>
                        <Badge mt={4} variant="light" color="forest" size="sm">Éditeur</Badge>
                    </div>
                </Group>

                <Divider my="lg" />

                <SimpleGrid cols={2} spacing="md">
                    <div>
                        <Text size="xs" c="dimmed">Membre depuis</Text>
                        <Text size="sm" fw={500}>{new Date(user.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</Text>
                    </div>
                    <div>
                        <Text size="xs" c="dimmed">Solde du portefeuille</Text>
                        <Text size="sm" fw={500}>{user.walletBalance.toLocaleString('fr-FR')} {user.walletCurrency}</Text>
                    </div>
                </SimpleGrid>
            </Paper>

            <Paper radius="lg" p="xl">
                <Text fw={600} size="sm" mb="md">Informations personnelles</Text>
                <form onSubmit={handleSave}>
                    <Stack gap="md">
                        <TextInput label="Nom affiché" defaultValue={user.displayName} />
                        <TextInput label="Adresse e-mail" defaultValue={user.email} type="email" />
                        <TextInput label="Organisation" defaultValue={user.organization} />
                        <Group justify="flex-end">
                            <Button type="submit">Enregistrer</Button>
                        </Group>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}
