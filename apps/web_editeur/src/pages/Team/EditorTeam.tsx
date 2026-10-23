// src/pages/Team/EditorTeam.tsx
import { useEffect, useState } from 'react';
import {
    Container, Text, Group, Stack, Table, Badge, Button, Modal, TextInput,
    Select, Loader, Center, Avatar, ActionIcon, Menu, Alert,
} from '@mantine/core';
import { IconPlus, IconDots, IconUserOff, IconUserCheck, IconAlertCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTeamStore } from '@/stores/team.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_PERMISSIONS, TEAM_ROLE_LABELS, TeamRole } from '@/models';

const ROLE_OPTIONS: { value: TeamRole; label: string }[] = [
    { value: 'editor', label: TEAM_ROLE_LABELS.editor },
    { value: 'agency_editor', label: TEAM_ROLE_LABELS.agency_editor },
    { value: 'agency_admin', label: TEAM_ROLE_LABELS.agency_admin },
    { value: 'agency_validator', label: TEAM_ROLE_LABELS.agency_validator },
];

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: 'forest' },
    invited: { label: 'Invitation envoyée', color: 'gold' },
    suspended: { label: 'Suspendu', color: 'red' },
};

function initials(name: string) {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function EditorTeam() {
    const currentUser = useAuthStore((s) => s.user);
    const { members, isLoading, isSaving, error, fetchMembers, inviteMember, updateRole, suspendMember, reactivateMember, clearError } = useTeamStore();

    const [inviteOpen, setInviteOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamRole>('editor');

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleInvite = async () => {
        try {
            await inviteMember(email.trim(), role);
            notifications.show({ title: 'Invitation envoyée', message: email, color: 'forest' });
            setInviteOpen(false);
            setEmail('');
            setRole('editor');
        } catch (e: any) {
            notifications.show({ title: 'Invitation impossible', message: e.message, color: 'red' });
        }
    };

    const handleRoleChange = async (id: string, newRole: string | null) => {
        if (!newRole) return;
        try {
            await updateRole(id, newRole as TeamRole);
            notifications.show({ title: 'Rôle mis à jour', message: 'Les nouvelles permissions sont actives immédiatement.', color: 'forest' });
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        }
    };

    const handleToggleSuspend = async (id: string, currentlySuspended: boolean) => {
        try {
            if (currentlySuspended) {
                await reactivateMember(id);
                notifications.show({ title: 'Membre réactivé', message: "Le membre peut de nouveau accéder à l'espace éditeur.", color: 'forest' });
            } else {
                await suspendMember(id);
                notifications.show({ title: 'Membre suspendu', message: "Son accès à l'espace éditeur est bloqué.", color: 'gray' });
            }
        } catch (e: any) {
            notifications.show({ title: 'Action impossible', message: e.message, color: 'red' });
        }
    };

    if (isLoading && members.length === 0) {
        return <Container size="lg" py="xl"><Center py="xl"><Loader color="forest" /></Center></Container>;
    }

    return (
        <Container size="lg" py="xl">
            <Group justify="space-between" mb="xl">
                <Text size="sm" c="dimmed">{members.length} membre{members.length > 1 ? 's' : ''} dans votre rédaction</Text>
                <Button leftSection={<IconPlus size={16} />} onClick={() => setInviteOpen(true)}>
                    Inviter un membre
                </Button>
            </Group>

            {error && (
                <Alert color="red" title="Erreur" mb="md" onClose={clearError} withCloseButton icon={<IconAlertCircle size={16} />}>
                    {error}
                </Alert>
            )}

            <Table.ScrollContainer minWidth={640}>
                <Table verticalSpacing="sm" highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Membre</Table.Th>
                            <Table.Th>Rôle</Table.Th>
                            <Table.Th>Statut</Table.Th>
                            <Table.Th style={{ width: 60 }} />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {members.map((member) => {
                            const isSelf = member.id === currentUser?.id;
                            const badge = STATUS_BADGE[member.status];
                            return (
                                <Table.Tr key={member.id}>
                                    <Table.Td>
                                        <Group gap="sm" wrap="nowrap">
                                            <Avatar radius="xl" color="forest" variant="light" size="sm">{initials(member.name)}</Avatar>
                                            <div>
                                                <Text size="sm" fw={500}>{member.name}{isSelf && ' (vous)'}</Text>
                                                <Text size="xs" c="dimmed">{member.email}</Text>
                                            </div>
                                        </Group>
                                    </Table.Td>
                                    <Table.Td>
                                        {member.role === 'admin' ? (
                                            <Badge variant="light" color="gold">Propriétaire</Badge>
                                        ) : (
                                            <Select
                                                data={ROLE_OPTIONS} value={member.role} size="xs" w={180}
                                                disabled={isSelf}
                                                onChange={(v) => handleRoleChange(member.id, v)}
                                            />
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" color={badge.color}>{badge.label}</Badge>
                                    </Table.Td>
                                    <Table.Td>
                                        {!isSelf && member.role !== 'admin' && (
                                            <Menu position="bottom-end" withArrow>
                                                <Menu.Target>
                                                    <ActionIcon variant="subtle" color="gray"><IconDots size={16} /></ActionIcon>
                                                </Menu.Target>
                                                <Menu.Dropdown>
                                                    {member.status === 'suspended' ? (
                                                        <Menu.Item leftSection={<IconUserCheck size={14} />} onClick={() => handleToggleSuspend(member.id, true)}>
                                                            Réactiver
                                                        </Menu.Item>
                                                    ) : (
                                                        <Menu.Item color="red" leftSection={<IconUserOff size={14} />} onClick={() => handleToggleSuspend(member.id, false)}>
                                                            Suspendre
                                                        </Menu.Item>
                                                    )}
                                                </Menu.Dropdown>
                                            </Menu>
                                        )}
                                    </Table.Td>
                                </Table.Tr>
                            );
                        })}
                    </Table.Tbody>
                </Table>
            </Table.ScrollContainer>

            <Modal opened={inviteOpen} onClose={() => setInviteOpen(false)} title="Inviter un membre" centered>
                <Stack>
                    <Text size="sm" c="dimmed">
                        Un e-mail d'invitation sera envoyé. Si la personne possède déjà un compte PayMedia, elle
                        rejoindra directement votre rédaction — aucun compte en double n'est créé.
                    </Text>
                    <TextInput
                        label="Adresse e-mail" placeholder="prenom.nom@media.com" required
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <Select
                        label="Rôle" data={ROLE_OPTIONS} value={role}
                        onChange={(v) => setRole((v as TeamRole) ?? 'journalist')}
                        description={ROLE_PERMISSIONS[role] ? undefined : undefined}
                    />
                    <Group justify="flex-end">
                        <Button variant="light" onClick={() => setInviteOpen(false)}>Annuler</Button>
                        <Button disabled={!email.trim()} loading={isSaving} onClick={handleInvite}>
                            Envoyer l'invitation
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
