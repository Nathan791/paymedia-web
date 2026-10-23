// src/layouts/components/EditorSidebar.tsx
//
// Toutes les couleurs viennent du thème centralisé (src/theme/index.ts) via
// les props Mantine natives (color="forest") ou les variables CSS générées
// (var(--mantine-color-forest-0)...). Aucun code hexadécimal en dur.
//
// ⚠️ RBAC (Master Prompt §5) : "UNE application avec un système de rôles et
// permissions — l'interface s'adapte." C'est ICI que ça se joue pour la
// navigation : chaque item déclare la permission requise, et seuls les
// items autorisés pour le rôle connecté s'affichent. Rappel important :
// ceci n'est qu'une commodité d'UX (cacher ce qui n'est pas pertinent) —
// la vraie protection doit toujours venir du backend (voir Master Prompt
// §31, "ne jamais considérer if(user.role===...) comme une protection
// suffisante").
import { Link, useLocation } from 'react-router-dom';
import {Box, Button, NavLink, ScrollArea, Stack, Text, ThemeIcon} from '@mantine/core';
import {
    IconLayoutDashboard,
    IconFiles,
    IconStack3,
    IconQrcode,
    IconReceipt2,
    IconWallet,
    IconChartHistogram,
    IconSettings,
    IconUserCircle,
    IconUsers, IconPlus,
} from '@tabler/icons-react';
import paymediaLogo from '@/assets/logo_paymedia_1.png';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_PERMISSIONS, RolePermissions } from '@/models';
import { useNavigate } from 'react-router-dom';

type PermissionKey = keyof RolePermissions;

interface NavItem {
    to: string;
    label: string;
    icon: any;
    requires?: PermissionKey; // omis = toujours visible (ex. Dashboard, Profil)
}

// Module "Points d'accès" (QR/short-code/audio) — voir route ci-dessous.
const NAV_ITEMS: NavItem[] = [
    { to: '/editor/dashboard', label: 'Tableau de bord', icon: IconLayoutDashboard },
    { to: '/editor/contents', label: 'Contenus', icon: IconFiles, requires: 'canCreateContent' },
    { to: '/editor/editions', label: 'Éditions', icon: IconStack3, requires: 'canCreateContent' },
    { to: '/editor/access', label: "Points d'accès", icon: IconQrcode, requires: 'canCreateContent' },
    { to: '/editor/transactions', label: 'Transactions', icon: IconReceipt2, requires: 'canViewRevenue' },
    { to: '/editor/revenue', label: 'Revenus', icon: IconWallet, requires: 'canViewRevenue' },
    { to: '/editor/analytics', label: 'Analytics', icon: IconChartHistogram, requires: 'canCreateContent' },
    { to: '/editor/team', label: 'Équipe', icon: IconUsers, requires: 'canManageTeam' },
];

const FOOTER_ITEMS: NavItem[] = [
    { to: '/editor/settings', label: 'Paramètres', icon: IconSettings, requires: 'canManageSettings' },
    { to: '/editor/profile', label: 'Profil', icon: IconUserCircle },
];

function SidebarLink({ to, label, icon: Icon }: { to: string; label: string; icon: any }) {
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

    return (
        <NavLink
            component={Link}
            to={to}
            label={label}
            active={isActive}
            leftSection={
                <ThemeIcon variant="transparent" color="forest" size={22}>
                    <Icon size={18} stroke={1.7} />
                </ThemeIcon>
            }
            styles={{
                root: {
                    borderRadius: 8,
                    color: 'var(--mantine-color-ink-6)',
                    backgroundColor: isActive ? 'var(--mantine-color-forest-0)' : 'transparent',
                    transition: 'background-color 0.15s ease',
                },
                label: {
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                },
            }}
        />
    );
}

export function EditorSidebar() {
    const user = useAuthStore((s) => s.user);
    const permissions = ROLE_PERMISSIONS[user?.role ?? 'editor'];
    const navigate = useNavigate();
    const visibleNavItems = NAV_ITEMS.filter((item) => !item.requires || permissions[item.requires]);
    const visibleFooterItems = FOOTER_ITEMS.filter((item) => !item.requires || permissions[item.requires]);

    return (
        <Box
            h="100%"
            style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--mantine-color-body)',
                borderRight: '1px solid var(--mantine-color-default-border)',
            }}
        >
            <Box px="lg" pt="lg" pb="md">
                <img src={paymediaLogo} alt="PayMedia" style={{ width: 'auto', maxWidth: '90%', height: 30, objectFit: 'contain' }} />
                <Text size="xs" c="dimmed" mt={2}>Espace éditeur</Text>
            </Box>

            <Button size="xs" mx="auto"  w="60%" leftSection={<IconPlus size={12} />} onClick={() => navigate('/editor/contents/create')}>
                Nouveau contenu
            </Button>

            <ScrollArea style={{ flex: 1 }}>
                <Stack gap={3} px="sm">
                    {visibleNavItems.map((item) => (
                        <SidebarLink key={item.to} {...item} />
                    ))}
                </Stack>
            </ScrollArea>

            <Box px="sm" py="md" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                <Stack gap={3}>
                    {visibleFooterItems.map((item) => (
                        <SidebarLink key={item.to} {...item} />
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}
