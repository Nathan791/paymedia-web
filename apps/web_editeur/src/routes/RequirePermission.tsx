// src/routes/RequirePermission.tsx
//
// EditorRoute vérifie qu'on est CONNECTÉ. Ce composant vérifie qu'on a la
// PERMISSION d'accéder à la page — un journaliste qui tape /editor/team
// directement dans l'URL ne doit pas voir la page, même si le lien est déjà
// caché dans la sidebar (la sidebar n'est qu'une commodité d'UX, pas une
// protection — voir Master Prompt §31).
//
// ⚠️ Rappel important : ceci reste une protection FRONTEND uniquement,
// utile pour l'expérience utilisateur (éviter une page cassée/incohérente).
// La vraie protection doit toujours venir du backend le jour où l'API
// réelle remplace les repositories mock (voir Master Prompt §31).
import { ReactNode } from 'react';
import { Button, Center, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { ROLE_PERMISSIONS, RolePermissions } from '@/models';

export function RequirePermission({ permission, children }: { permission: keyof RolePermissions; children: ReactNode }) {
    const user = useAuthStore((s) => s.user);
    const permissions = ROLE_PERMISSIONS[user?.role ?? 'journalist'];

    if (!permissions[permission]) {
        return (
            <Center h="60vh">
                <Stack align="center" gap="xs">
                    <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                        <IconLock size={24} />
                    </ThemeIcon>
                    <Text fw={600}>Accès non autorisé</Text>
                    <Text size="sm" c="dimmed" ta="center" maw={360}>
                        Votre rôle ne vous donne pas accès à cette page. Contactez le propriétaire ou
                        l'administrateur de votre média si vous pensez que c'est une erreur.
                    </Text>
                    <Button component={Link} to="/editor/dashboard" variant="light" mt="sm">
                        Retour au tableau de bord
                    </Button>
                </Stack>
            </Center>
        );
    }

    return <>{children}</>;
}
