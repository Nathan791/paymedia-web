// src/theme/index.ts
//
// ============================================================================
// SOURCE UNIQUE DE VÉRITÉ POUR TOUTES LES COULEURS DE L'APPLICATION.
// ============================================================================
// Règle absolue : AUCUN fichier de page/composant ne doit contenir de code
// couleur en dur (#074530, #B8860B, style={{ color: '...' }}...). Toute
// couleur doit passer par l'un des deux mécanismes suivants :
//
//   1. Une prop native Mantine qui référence une clé de `colors` ci-dessous,
//      ex. <Badge color="forest">, <ThemeIcon color="gold">
//   2. Une variable CSS générée automatiquement par Mantine à partir de ce
//      thème, ex. var(--mantine-color-forest-6), var(--mantine-color-gold-3)
//      — à utiliser dans les rares cas où un `style={{}}` inline est
//      inévitable (SVG, dégradés, tiers composants qui n'acceptent pas la
//      prop `color`).
//
// Changer une couleur de marque ne se fait qu'ICI, et se répercute
// automatiquement partout dans l'app (sidebar, boutons, badges, graphiques,
// bordures de zones de dépôt, etc.) sans toucher à aucune page.
//
// ============================================================================
// IDENTITÉ VISUELLE — alignée sur le vrai logo PayMedia (src/assets/logo_*.png)
// ============================================================================
//   - "forest" (vert profond #074530) → couleur PRIMAIRE de la marque.
//     C'est le mot "Pay" du logo. Utilisée pour les actions principales
//     (boutons, liens actifs, statut "Publié" — le vert de la marque EST le
//     vert du succès, ce n'est pas une coïncidence, c'est un choix : publier
//     un contenu est l'aboutissement positif du travail éditorial).
//   - "gold" (or profond #B8860B) → couleur SECONDAIRE de la marque.
//     C'est le mot "Media" du logo. Utilisée pour tout ce qui touche à la
//     valeur/au premium : prix, monétisation, badges "Premium", accents sur
//     les éléments liés à l'argent.
//   - "ink" → une rampe NEUTRE (pas une couleur de marque) pour le texte et
//     les surfaces sombres (sidebar). Elle reste un gris-bleu profond
//     volontairement peu saturé : un texte ou un fond entièrement vert ou or
//     serait fatiguant et peu professionnel sur de grandes surfaces.
import { createTheme, MantineColorsTuple } from '@mantine/core';

// Rampe "forest" — calculée précisément à partir de #074530 (le vert exact
// du logo), 5 teintes claires + la couleur de marque + 4 teintes foncées.
const forest: MantineColorsTuple = [
    '#EEF2F1', '#C8D6D1', '#9CB5AC', '#6A8F83', '#346655',
    '#074530', '#073C2A', '#073425', '#072B1F', '#082219',
];

// Rampe "gold" — calculée précisément à partir de #B8860B (l'or exact du logo).
const gold: MantineColorsTuple = [
    '#FAF7EE', '#EFE4C9', '#E3CF9D', '#D4B66D', '#C59C37',
    '#B8860B', '#9F740B', '#87630A', '#6E510A', '#523D09',
];

// Rampe "ink" — neutre, pour le texte et les surfaces sombres (sidebar,
// en-têtes de section). Ne change jamais avec la marque.
const ink: MantineColorsTuple = [
    '#EEF0F5', '#D7DAE5', '#B4B9CC', '#8991AC', '#5C6480',
    '#3B4260', '#262C47', '#171B33', '#12172B', '#0B0E1C',
];

export const paymediaTheme = createTheme({
    primaryColor: 'forest',
    primaryShade: { light: 5, dark: 5 },
    colors: { forest, gold, ink },
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontFamilyMonospace: 'JetBrains Mono, monospace',
    headings: {
        fontFamily: 'Fraunces, Georgia, serif',
        fontWeight: '600',
    },
    defaultRadius: 'md',
    radius: { xs: '6px', sm: '10px', md: '14px', lg: '18px', xl: '24px' },
    shadows: {
        sm: '0 1px 3px rgba(7, 69, 48, 0.06), 0 1px 2px rgba(7, 69, 48, 0.04)',
        md: '0 4px 12px rgba(7, 69, 48, 0.08)',
        lg: '0 12px 32px rgba(7, 69, 48, 0.12)',
    },
    // Valeurs non-couleur mais tout aussi centralisées : surfaces de fond.
    // Comme pour les couleurs, ne jamais recopier ces valeurs en dur ailleurs
    // — utiliser var(--mantine-color-body) ou ces clés via theme.other.
    other: {
        paper: '#F7F8F6',       // fond général, légèrement teinté vert
        paperElevated: '#FFFFFF',
        border: '#E1E6E2',
    },
    components: {
        Paper: {
            defaultProps: { withBorder: true },
        },
        Card: {
            defaultProps: { withBorder: true, radius: 'lg' },
        },
        Button: {
            defaultProps: { radius: 'md' },
        },
        Badge: {
            defaultProps: { radius: 'sm' },
        },
    },
});
