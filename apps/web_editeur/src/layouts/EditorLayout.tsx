// src/layouts/EditorLayout.tsx
//
// Couleurs de fond issues du thème centralisé (src/theme/index.ts, clé
// `other.paper`) — jamais de code hexadécimal en dur ici.
import { Outlet, useLocation } from 'react-router-dom';
import { AppShell, Box, useMantineTheme } from '@mantine/core';
import { EditorSidebar } from './components/EditorSidebar';
import { EditorHeader } from './components/EditorHeader';

const TITLES: { match: RegExp; title: string }[] = [
    { match: /^\/editor\/dashboard/, title: 'Tableau de bord' },
    { match: /^\/editor\/contents\/create/, title: 'Nouveau contenu' },
    { match: /^\/editor\/contents\/[^/]+\/edit/, title: 'Modifier le contenu' },
    { match: /^\/editor\/contents\/[^/]+$/, title: 'Détail du contenu' },
    { match: /^\/editor\/contents/, title: 'Mes contenus' },
    { match: /^\/editor\/editions\/[^/]+$/, title: "Détail de l'édition" },
    { match: /^\/editor\/editions/, title: 'Éditions' },
    // "Accès" (ex-"Déclencheurs") : nom retenu pour rester compréhensible par
    // un utilisateur non technique — voir Phase C du plan de refonte.
    { match: /^\/editor\/access/, title: "Points d'accès" },
    { match: /^\/editor\/transactions/, title: 'Transactions' },
    { match: /^\/editor\/revenue/, title: 'Revenus' },
    { match: /^\/editor\/analytics/, title: 'Analytics' },
    { match: /^\/editor\/team/, title: 'Équipe' },
    { match: /^\/editor\/settings/, title: 'Paramètres' },
    { match: /^\/editor\/profile/, title: 'Mon profil' },
];

function pageTitleFor(pathname: string) {
    return TITLES.find((item) => item.match.test(pathname))?.title ?? 'PayMedia';
}

export function EditorLayout() {
    const location = useLocation();
    const title = pageTitleFor(location.pathname);
    const theme = useMantineTheme();

    return (
        <AppShell
            navbar={{ width: 264, breakpoint: 'sm' }}
            header={{ height: 72 }}
            padding={0}
            styles={{
                navbar: { backgroundColor: 'var(--mantine-color-body)' },
                header: {
                    backgroundColor: 'var(--mantine-color-body)',
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                },
                main: { backgroundColor: theme.other.paper },
            }}
        >
            <AppShell.Navbar>
                <EditorSidebar />
            </AppShell.Navbar>

            <AppShell.Header>
                <EditorHeader title={title} />
            </AppShell.Header>

            <AppShell.Main>
                <Box mih="calc(100vh - 72px)">
                    <Outlet />
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}