import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymediaLogo from '../../assets/logo_paymedia_1.png';
import {
    Box,
    Button,
    Container,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
    Group,
} from '@mantine/core';
import { useAuthStore } from '../../stores/auth';

const LAST_EMAIL = 'paymedia_last_email';

function PayMediaLogo() {
    return (
        <Box
            style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 20,
            }}
        >
            <img
                src={paymediaLogo}
                alt="PayMedia"
                style={{
                    width: 150,
                    maxWidth: '90%',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 15px 25px rgba(37,99,235,.25))',

                }}
            />
        </Box>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const { login, isLoading, error } = useAuthStore();

    const savedEmail = localStorage.getItem(LAST_EMAIL) || '';

    const [email, setEmail] = useState(savedEmail);
    const [password, setPassword] = useState('');
    const [firstFocus, setFirstFocus] = useState(!!savedEmail);

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        const success = await login(email, password);

        if (success) {
            localStorage.setItem(LAST_EMAIL, email);
            navigate('/dashboard');
        }
    };


    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'rgb(235, 245, 255)',
                backdropFilter:'blur(15px)',
            }}
        >
            <Container size={420} w="100%">

                <Paper
                    radius="xl"
                    p="xl"
                    shadow="xl"
                    style={{
                        background:
                            'rgba(255,255,255,.96)',
                        backdropFilter:'blur(12px)',
                    }}
                >

                    <Stack gap="lg">

                        <Group justify="center">
                            <PayMediaLogo />
                        </Group>


                        <Box ta="center" >

                            <Title order={2}>
                                PayMedia Admin
                            </Title>

                            <Text
                                size="sm"
                                c="dimmed"
                                mt={5}


                            >
                                Administration Console
                            </Text>

                        </Box>


                        <form onSubmit={handleSubmit}>

                            <Stack>

                                <TextInput
                                    label="Email administrateur"
                                    placeholder="admin@paymedia.com"
                                    value={email}
                                    required

                                    onFocus={() => {

                                        if(firstFocus){
                                            setEmail('');
                                            setFirstFocus(false);
                                        }

                                    }}

                                    onChange={(e)=>
                                        setEmail(e.currentTarget.value)
                                    }

                                    styles={{

                                    }}

                                />


                                <PasswordInput
                                    label="Mot de passe"
                                    placeholder="••••••••"
                                    value={password}

                                    onChange={(e)=>
                                        setPassword(
                                            e.currentTarget.value
                                        )
                                    }

                                    required
                                />


                                {error && (

                                    <Text
                                        c="red"
                                        size="sm"
                                    >
                                        {error}
                                    </Text>

                                )}



                                <Button
                                    type="submit"
                                    loading={isLoading}
                                    size="md"
                                    radius="md"
                                    style={{
                                        background:
                                            'linear-gradient(135deg,#2563eb,#1d4ed8)',
                                    }}
                                >

                                    Se connecter

                                </Button>


                            </Stack>

                        </form>


                        {savedEmail && (

                            <Text
                                size="xs"
                                ta="center"
                                c="dimmed"
                            >


                            </Text>

                        )}


                        <Text
                            size="xs"
                            ta="center"
                            c="dimmed"
                        >
                            © 2026 PayMedia · Administration
                        </Text>


                    </Stack>

                </Paper>

            </Container>

        </Box>
    );
}