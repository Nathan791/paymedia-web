// src/pages/Settings/EditorSettings.tsx
//
// Master Prompt §24 : Profil média (nom/logo/description) + Sécurité +
// Informations financières UNIQUEMENT pour les rôles autorisés
// (canManageSettings / canViewRevenue) — la page ne s'affiche même pas
// pour un rôle qui n'a pas canManageSettings (voir EditorRoute / sidebar).
import { useState } from 'react';
import { Container, Paper, Text, Stack, Switch, Divider, Button, Group, Select, TextInput, Textarea, Avatar, Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_PERMISSIONS } from '@/models';

export function EditorSettings() {
    const user = useAuthStore((s) => s.user);
    const permissions = ROLE_PERMISSIONS[user?.role ?? 'editor'];

    const [mediaName, setMediaName] = useState(user?.organization ?? '');
    const [mediaDescription, setMediaDescription] = useState('');

    const [emailNotifs, setEmailNotifs] = useState(true);
    const [smsNotifs, setSmsNotifs] = useState(false);
    const [autoResubmit, setAutoResubmit] = useState(false);
    const [language, setLanguage] = useState<string | null>('fr');

    const handleSave = () => {
        notifications.show({ title: 'Préférences enregistrées', message: 'Vos préférences ont bien été mises à jour.', color: 'forest' });
    };

    return (
        <Container size="sm" py="xl">
            <Stack gap="xl">
                {/* Profil média — visible uniquement si autorisé à gérer les
                    paramètres (Owner / Admin média) */}
                {permissions.canManageSettings ? (
                    <Paper radius="lg" p="xl">
                        <Text fw={600} size="sm" mb="md">Profil du média</Text>
                        <Group align="flex-start" mb="md">
                            <Avatar size={64} radius="md" color="forest" variant="light">
                                {mediaName.slice(0, 2).toUpperCase()}
                            </Avatar>
                            <Stack gap="xs" style={{ flex: 1 }}>
                                <TextInput label="Nom du média" value={mediaName} onChange={(e) => setMediaName(e.target.value)} />
                                <Textarea label="Description" minRows={2} value={mediaDescription} onChange={(e) => setMediaDescription(e.target.value)} placeholder="Quelques mots sur votre média..." />
                            </Stack>
                        </Group>
                        <Group justify="flex-end">
                            <Button variant="light" onClick={handleSave}>Enregistrer le profil</Button>
                        </Group>
                    </Paper>
                ) : (
                    <Alert color="blue" icon={<IconInfoCircle size={16} />}>
                        Le profil du média n'est modifiable que par le propriétaire ou l'administrateur média.
                    </Alert>
                )}

                <Paper radius="lg" p="xl">
                    <Stack gap="lg">
                        <div>
                            <Text fw={600} size="sm" mb="xs">Notifications</Text>
                            <Stack gap="sm">
                                <Group justify="space-between">
                                    <div>
                                        <Text size="sm">Notifications par e-mail</Text>
                                        <Text size="xs" c="dimmed">Ventes, révisions, reversements</Text>
                                    </div>
                                    <Switch checked={emailNotifs} onChange={(e) => setEmailNotifs(e.currentTarget.checked)} />
                                </Group>
                                <Group justify="space-between">
                                    <div>
                                        <Text size="sm">Notifications par SMS</Text>
                                        <Text size="xs" c="dimmed">Alertes critiques uniquement</Text>
                                    </div>
                                    <Switch checked={smsNotifs} onChange={(e) => setSmsNotifs(e.currentTarget.checked)} />
                                </Group>
                            </Stack>
                        </div>

                        <Divider />

                        <div>
                            <Text fw={600} size="sm" mb="xs">Publication</Text>
                            <Group justify="space-between">
                                <div>
                                    <Text size="sm">Resoumission automatique</Text>
                                    <Text size="xs" c="dimmed">Resoumettre automatiquement après correction d'un contenu refusé</Text>
                                </div>
                                <Switch checked={autoResubmit} onChange={(e) => setAutoResubmit(e.currentTarget.checked)} />
                            </Group>
                        </div>

                        <Divider />

                        <div>
                            <Text fw={600} size="sm" mb="xs">Langue de l'interface</Text>
                            <Select data={[{ value: 'fr', label: 'Français' }, { value: 'en', label: 'English' }]} value={language} onChange={setLanguage} />
                        </div>

                        <Group justify="flex-end">
                            <Button onClick={handleSave}>Enregistrer les préférences</Button>
                        </Group>
                    </Stack>
                </Paper>

                {/* Informations financières — réservées aux rôles autorisés
                    (Master Prompt §24 : "uniquement pour les rôles autorisés") */}
                {permissions.canViewRevenue && (
                    <Paper radius="lg" p="xl">
                        <Text fw={600} size="sm" mb="md">Informations financières</Text>
                        <Text size="sm" c="dimmed" mb="md">
                            Moyens de paiement enregistrés pour recevoir vos reversements. Modifiable
                            uniquement depuis le module Revenus.
                        </Text>
                        <Group gap="xs">
                            <Text size="sm" fw={500}>MTN MoMo •••• 4821</Text>
                        </Group>
                    </Paper>
                )}
            </Stack>
        </Container>
    );
}
