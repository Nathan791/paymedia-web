import { Container, Title, Text, Card,  Button, TextInput, PasswordInput, Stack } from '@mantine/core';

export default function Settings() {
    return (
        <Container fluid>
            <Title order={2} mb="lg">⚙️ Paramètres</Title>

            <Card withBorder p="xl" style={{ maxWidth: 500 }}>
                <Text fw={600} mb="md">Informations générales</Text>

                <Stack>
                    <TextInput label="Nom d'utilisateur" placeholder="SuperAdmin" />
                    <TextInput label="Email" placeholder="admin@paymedia.com" />
                    <PasswordInput label="Nouveau mot de passe" placeholder="••••••••" />
                    <PasswordInput label="Confirmer" placeholder="••••••••" />

                    <Button color="blue" fullWidth>Enregistrer</Button>
                </Stack>
            </Card>
        </Container>
    );
}