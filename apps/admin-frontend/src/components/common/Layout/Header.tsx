import { Group, Text, Avatar, Box, UnstyledButton, Menu, Divider, Badge } from '@mantine/core';
import { IconUser, IconLogout, IconSettings, IconBell, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth';
import paymediaLogo from '../../../assets/logo_paymedia_1.png';

export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
        }
    };

    return (
        <Box
            style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                width: '100%',
            }}
        >
            {/* Logo + Titre */}
            <Group gap="sm">
                <img
                    src={paymediaLogo}
                    alt="PayMedia"
                    style={{
                        height: 32,
                        width: 'auto',
                        objectFit: 'contain',
                    }}
                />
                <Text size="xs" c="dimmed" fw={500} style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Administrateur
                </Text>
            </Group>

            <Box style={{ flex: 1 }} />

            <Group gap="xs">
                {/* Notifications */}
                <UnstyledButton
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        position: 'relative',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f3f5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <IconBell size={20} stroke={1.5} />
                    <Badge
                        size="xs"
                        color="red"
                        circle
                        style={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            padding: 0,
                            minWidth: 16,
                            height: 16,
                            fontSize: 9,
                            border: '2px solid white',
                        }}
                    >
                        3
                    </Badge>
                </UnstyledButton>

                {/* Menu Profil */}
                <Menu position="bottom-end" withArrow shadow="md" width={220}>
                    <Menu.Target>
                        <UnstyledButton
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '4px 12px 4px 4px',
                                borderRadius: '50px',
                                border: '1px solid #e9ecef',
                                transition: 'all 0.2s ease',
                                backgroundColor: '#ffffff',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#1976d2';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e9ecef';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Avatar
                                color="#1976d2"
                                radius="xl"
                                size="sm"
                                style={{
                                    border: '2px solid #E3F0FF',
                                    fontWeight: 600,
                                }}
                            >
                                {user?.username?.[0]?.toUpperCase() || 'A'}
                            </Avatar>
                            <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
                                <Text size="md" fw={700} lineClamp={1} c="#1a1a2e">
                                    {user?.username || 'Admin'}
                                </Text>
                            </Box>
                            <IconChevronDown size={14} stroke={1.5} style={{ color: '#adb5bd' }} />
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>
                            <Group gap="xs">
                                <Text size="xs" c="dimmed">{user?.email}</Text>
                            </Group>
                        </Menu.Label>
                        <Divider />
                        <Menu.Item
                            leftSection={<IconUser size={16} />}
                            onClick={() => navigate('/profile')}
                        >
                            Mon profil
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconSettings size={16} />}
                            onClick={() => navigate('/settings')}
                        >
                            Paramètres
                        </Menu.Item>
                        <Divider />
                        <Menu.Item
                            color="red"
                            leftSection={<IconLogout size={16} />}
                            onClick={handleLogout}
                        >
                            Déconnexion
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Box>
    );
}