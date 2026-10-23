// src/components/layout/EditorSidebar.tsx
import { NavLink } from 'react-router-dom';
import {
    Avatar,
    Badge,
    Box,
    Group,
    ScrollArea,
    Stack,
    Text,
    UnstyledButton,
} from '@mantine/core';
import {
    IconBrandGoogleAnalytics,
    IconFileText,
    IconLayoutDashboard,
    IconLogout,
    IconQrcode,
    IconReceipt,
    IconShoppingCart,
    IconUser,
} from '@tabler/icons-react';
import { useAuthStore } from '@/stores/auth.store';
import { TEAM_ROLE_LABELS, isTeamRole } from '@/models/user.model';

const menuItems = [
    { label: 'Dashboard', icon: IconLayoutDashboard, path: '/editor/dashboard', badge: null },
    { label: 'Contenus', icon: IconFileText, path: '/editor/contents', badge: null },
    { label: 'Triggers', icon: IconQrcode, path: '/editor/triggers', badge: null },
    { label: 'Ventes', icon: IconShoppingCart, path: '/editor/sales', badge: 'Nouveau' },
    { label: 'Reversements', icon: IconReceipt, path: '/editor/payouts', badge: null },
    { label: 'Analytics', icon: IconBrandGoogleAnalytics, path: '/editor/analytics', badge: null },
    { label: 'Profil', icon: IconUser, path: '/editor/profile', badge: null },
];

export const EditorSidebar = () => {
    const { user, logout } = useAuthStore();

    // Libellé du rôle : utilise TEAM_ROLE_LABELS si le rôle est connu, sinon "Éditeur"
    const roleLabel =
        user?.role && isTeamRole(user.role) ? TEAM_ROLE_LABELS[user.role] : 'Éditeur';

    const handleLogout = async () => {
        try {
            await logout(); // vide la session et redirige vers /login
        } catch (error) {
            console.error('Erreur de déconnexion:', error);
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
                borderRight: '1px solid var(--mantine-color-gray-3)',
            }}
        >
            {/* En-tête : utilisateur */}
            <Box
                p="md"
                style={{
                    borderBottom: '1px solid var(--mantine-color-gray-1)',
                    backgroundColor: 'var(--mantine-color-gray-0)',
                }}
            >
                <Group gap="sm" wrap="nowrap">
                    <Avatar
                        color="forest"
                        radius="xl"
                        size="md"
                        style={{ fontWeight: 600, fontSize: 18 }}
                    >
                        {user?.username?.[0]?.toUpperCase() || 'E'}
                    </Avatar>

                    <Box style={{ flex: 1, minWidth: 0 }}>
                        {user?.email && (
                            <Text size="xs" c="dimmed" lineClamp={1}>
                                {user.email}
                            </Text>
                        )}
                        <Badge
                            color="forest"
                            size="xs"
                            variant="light"
                            mt={4}
                            style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                            {roleLabel}
                        </Badge>
                    </Box>
                </Group>
            </Box>

            {/* Menu */}
            <ScrollArea style={{ flex: 1 }}>
                <Stack gap={4} p="md">
                    {menuItems.map((item) => (
                        <NavLink key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                            {({ isActive }) => (
                                <UnstyledButton
                                    component="div"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: '10px 14px',
                                        borderRadius: 8,
                                        color: isActive
                                            ? 'var(--mantine-color-forest-6)'
                                            : 'var(--mantine-color-gray-7)',
                                        backgroundColor: isActive
                                            ? 'var(--mantine-color-forest-0)'
                                            : 'transparent',
                                        fontWeight: isActive ? 600 : 400,
                                        width: '100%',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.backgroundColor =
                                                'var(--mantine-color-gray-0)';
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
                                        <Badge size="xs" color="forest" variant="filled">
                                            {item.badge}
                                        </Badge>
                                    )}
                                </UnstyledButton>
                            )}
                        </NavLink>
                    ))}
                </Stack>
            </ScrollArea>

            {/* Pied de page : déconnexion */}
            <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-1)' }}>
                <UnstyledButton
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 8,
                        color: 'var(--mantine-color-red-6)',
                        width: '100%',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--mantine-color-red-0)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <IconLogout size={18} stroke={1.8} />
                    <Text size="sm" fw={500}>
                        Déconnexion
                    </Text>
                </UnstyledButton>
            </Box>
        </Box>
    );
};