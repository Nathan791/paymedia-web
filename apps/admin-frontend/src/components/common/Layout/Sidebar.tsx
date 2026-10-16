import { NavLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Stack,
    Text,
    Group,
    Avatar,
    UnstyledButton,
    Badge,
    ScrollArea,
} from '@mantine/core';
import {
    IconLayoutDashboard,
    IconUsers,
    IconFileText,
    IconCoin,
    IconTransactionDollar,
    IconLogs,
    IconUser,
    IconLogout,
} from '@tabler/icons-react';
import { useAuthStore } from '../../../stores/auth';

const menuItems = [
    {
        label: 'Dashboard',
        icon: IconLayoutDashboard,
        path: '/dashboard',
        badge: null,
    },
    {
        label: 'Utilisateurs',
        icon: IconUsers,
        path: '/users',
        badge: null,
    },
    {
        label: 'Contenus',
        icon: IconFileText,
        path: '/contents',
        badge: null,
    },
    {
        label: 'Transactions',
        icon: IconTransactionDollar,
        path: '/transactions',
        badge: null,
    },
    {
        label: 'Commissions',
        icon: IconCoin,
        path: '/commissions',
        badge: null,
    },
    {
        label: 'Audit',
        icon: IconLogs,
        path: '/audit',
        badge: '3',
    },
    {
        label: 'Profil',
        icon: IconUser,
        path: '/profile',
        badge: null,
    },
];

export function Sidebar() {
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
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRight: '1px solid #e9ecef',
            }}
        >
            {/* Profil utilisateur */}
            <Box
                p="md"
                style={{
                    borderBottom: '1px solid #f1f3f5',
                    backgroundColor: '#fafbfc',
                }}
            >
                <Group gap="sm" wrap="nowrap">
                    <Avatar
                        color="#1976d2"
                        radius="xl"
                        size="md"
                        style={{
                            border: '2px solid #E3F0FF',
                            fontWeight: 600,
                            fontSize: 18,
                        }}
                    >
                        {user?.username?.[0]?.toUpperCase() || 'A'}
                    </Avatar>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                            {user?.email || 'admin@paymedia.com'}
                        </Text>
                        <Group gap="xs" wrap="nowrap" align="center">
                            <Badge
                                color="#1976d2"
                                size="xs"
                                variant="light"
                                style={{ textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}
                            >
                                Admin
                            </Badge>
                        </Group>
                    </Box>
                </Group>
            </Box>

            {/* Menu */}
            <ScrollArea style={{ flex: 1 }}>
                <Stack gap="4" p="md">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            style={{ textDecoration: 'none' }}
                        >
                            {({ isActive }) => (
                                <UnstyledButton
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '12px',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        color: isActive ? '#1976d2' : '#495057',
                                        backgroundColor: isActive
                                            ? '#E3F0FF'
                                            : 'transparent',
                                        fontWeight: isActive ? 600 : 400,
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Group gap="sm">
                                        <item.icon size={20} stroke={1.5} />
                                        <Text size="sm">{item.label}</Text>
                                    </Group>

                                    {item.badge && (
                                        <Badge
                                            size="xs"
                                            color="#1976d2"
                                            variant="filled"
                                        >
                                            {item.badge}
                                        </Badge>
                                    )}
                                </UnstyledButton>
                            )}
                        </NavLink>
                    ))}
                </Stack>
            </ScrollArea>

            {/* Pied de page avec déconnexion */}
            <Box p="md" style={{ borderTop: '1px solid #f1f3f5' }}>
                <UnstyledButton
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        color: '#fa5252',
                        width: '100%',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f5';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <IconLogout size={20} stroke={1.5} />
                    <Text size="sm" fw={500}>Déconnexion</Text>
                </UnstyledButton>
            </Box>
        </Box>
    );
}