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
    IconFileText,
    IconQrcode,
    IconShoppingCart,
    IconReceipt,
    IconUser,
    IconLogout,
    IconBrandGoogleAnalytics,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores';

const menuItems = [
    {
        label: 'Dashboard',
        icon: IconLayoutDashboard,
        path: '/editor/dashboard',
        badge: null,
    },
    {
        label: 'Contenus',
        icon: IconFileText,
        path: '/editor/contents',
        badge: null,
    },
    {
        label: 'Triggers',
        icon: IconQrcode,
        path: '/editor/triggers',
        badge: null,
    },
    {
        label: 'Ventes',
        icon: IconShoppingCart,
        path: '/editor/sales',
        badge: 'Nouveau',
    },
    {
        label: 'Reversements',
        icon: IconReceipt,
        path: '/editor/payouts',
        badge: null,
    },
    {
        label: 'Analytics',
        icon: IconBrandGoogleAnalytics,
        path: '/editor/analytics',
        badge: null,
    },
    {
        label: 'Profil',
        icon: IconUser,
        path: '/editor/profile',
        badge: null,
    },
];

export const EditorSidebar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        console.log('🔵 Sidebar - Clic sur déconnexion');
        try {
            await logout();

        } catch (error) {
            console.error('🔴 Sidebar - Erreur de déconnexion:', error);

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
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRight: '1px solid #e9ecef',
            }}
        >
            <Box
                p="md"
                style={{
                    borderBottom: '1px solid #f1f3f5',
                    backgroundColor: '#fafbfc',
                }}
            >
                <Group gap="sm" wrap="nowrap">
                    <Avatar
                        color="#0CAF7A"
                        radius="xl"
                        size="md"
                        style={{
                            border: '2px solid #E8F5F0',
                            fontWeight: 600,
                            fontSize: 18,
                        }}
                    >
                        {user?.username?.[0]?.toUpperCase() || 'E'}
                    </Avatar>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group >
                            <Text size="xs" c="dimmed" lineClamp={1}>
                                {user?.email || 'editeur@paymedia.com'}
                            </Text>
                        </Group>
                         <Group gap="xs" wrap="nowrap" align="center">
                            <Badge
                                color="#0CAF7A"
                                size="xs"
                                variant="light"
                                style={{ textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}
                            >
                                Éditeur
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
                                        color: isActive ? '#0CAF7A' : '#495057',
                                        backgroundColor: isActive
                                            ? '#E8F5F0'
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
                                            color="#0CAF7A"
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
                    <IconLogout size={18} stroke={1.8} />
                    <Text size="sm" fw={500}>Déconnexion</Text>
                </UnstyledButton>


            </Box>
        </Box>
    );
};
