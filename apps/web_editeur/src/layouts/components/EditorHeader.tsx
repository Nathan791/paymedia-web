// src/layouts/components/EditorHeader.tsx
//
// Toutes les couleurs viennent du thème centralisé (src/theme/index.ts).
// Aucun code hexadécimal en dur, aucun style de survol géré à la main en JS
// — Mantine gère nativement les états hover/focus à partir du thème.
import { useNavigate } from 'react-router-dom';
import { Avatar, Group, Menu, Text, UnstyledButton, Badge } from '@mantine/core';
import { IconChevronDown, IconLogout, IconUserCircle, IconSettings } from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth.store';

function initials(name: string) {
    return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export function EditorHeader({ title }: { title: string }) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    return (
        <Group h="100%" px="xl" justify="space-between" wrap="nowrap">
            <Text fw={600} size="xl" c="ink.8" style={{ fontFamily: 'Fraunces, serif' }}>
                {title}
            </Text>

            <Menu position="bottom-end" width={220} shadow="md">
                <Menu.Target>
                    <UnstyledButton
                        px={12}
                        py={4}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            borderRadius: 50,
                            border: '1px solid var(--mantine-color-default-border)',
                            backgroundColor: 'var(--mantine-color-body)',
                            transition: 'border-color 0.15s ease',
                        }}
                    >
                        <Group gap={8} wrap="nowrap">
                            {/* Identité de l'utilisateur : accent de marque (vert) */}
                            <Avatar variant="light" color="forest" radius="xl" size="sm" fw={600}>
                                {user ? initials(user.displayName) : '—'}
                            </Avatar>

                            <div style={{ lineHeight: 1.2 }}>
                                <Text size="sm" fw={600}>{user?.displayName}</Text>
                                <Badge mt={4} variant="light" color="forest" size="sm">Éditeur</Badge>
                            </div>

                            <IconChevronDown size={16} color="var(--mantine-color-ink-3)" />
                        </Group>
                    </UnstyledButton>
                </Menu.Target>

                <Menu.Dropdown>
                    <Menu.Label>
                        Solde du portefeuille
                        {/* L'argent est toujours accentué en or (couleur secondaire de marque) */}
                        <Badge ml={6} size="xs" variant="light" color="gold">
                            {user ? `${user.walletBalance.toLocaleString('fr-FR')} ${user.walletCurrency}` : '—'}
                        </Badge>
                    </Menu.Label>

                    <Menu.Item leftSection={<IconUserCircle size={16} />} onClick={() => navigate('/editor/profile')}>
                        Mon profil
                    </Menu.Item>

                    <Menu.Item leftSection={<IconSettings size={16} />} onClick={() => navigate('/editor/settings')}>
                        Paramètres
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item color="red" leftSection={<IconLogout size={16} />} onClick={handleLogout}>
                        Se déconnecter
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}
