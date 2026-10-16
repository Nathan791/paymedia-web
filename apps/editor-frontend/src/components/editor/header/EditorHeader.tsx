import { Group, Text, Avatar, Box, UnstyledButton, Menu, Divider, Badge } from '@mantine/core';
import {IconUser,IconLogout, IconSettings, IconBell, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import paymediaLogo from '@/assets/logo_paymedia_1.png';

interface EditorHeaderProps {
    onMenuToggle: () => void;
    opened: boolean;
}

export const EditorHeader = ({ onMenuToggle,}: EditorHeaderProps) => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        console.log('🔵 Header - Clic sur déconnexion');
        try {
            await logout();
        } catch (error) {
            console.error('🔴 Header - Erreur de déconnexion:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('auth-storage');
            window.location.href = '/login';
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
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e9ecef',
            }}
        >

            <Group gap="sm">
                {/* Burger Menu */}
                <UnstyledButton
                    onClick={onMenuToggle}
                    style={{
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f3f5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                </UnstyledButton>

                {/* Logo */}
                <UnstyledButton
                    onClick={() => navigate('/editor/dashboard')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '4px 8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <img
                        src={paymediaLogo}
                        alt="PayMedia"
                        style={{
                            height: 20,
                            width: 'auto',
                            objectFit: 'contain',
                        }}
                    />
                    <Box style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                        <Text size="xs" c="dimmed" fw={500} style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Éditeur
                        </Text>
                    </Box>
                </UnstyledButton>
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
                                e.currentTarget.style.borderColor = '#0CAF7A';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(12, 175, 122, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e9ecef';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Avatar
                                color="#0CAF7A"
                                radius="xl"
                                size="sm"
                                style={{
                                    border: '2px solid #E8F5F0',
                                    fontWeight: 600,
                                }}
                            >
                                {user?.username?.[0]?.toUpperCase() || 'E'}
                            </Avatar>
                            <Box style={{ textAlign: 'left', lineHeight: 1.2 }}>
                                <Text size="md" fw={700} lineClamp={1} c="#1a1a2e">
                                    {user?.username || 'Éditeur'}
                                </Text>
                            </Box>
                            <IconChevronDown size={14} stroke={1.5} style={{ color: '#adb5bd' }} />
                        </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Label>
                            <Group gap="xs">

                            </Group>
                        </Menu.Label>
                        <Divider />
                        <Menu.Item
                            leftSection={<IconUser size={16} />}
                            onClick={() => navigate('/editor/profile')}
                        >
                            Mon profil
                        </Menu.Item>
                        <Menu.Item
                            leftSection={<IconSettings size={16} />}
                            onClick={() => navigate('/editor/settings')}
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
};