// src/pages/Dashboard/EditorDashboard.tsx

import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Container,
    Divider,
    Grid,
    Group,
    Loader,
    Paper,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Timeline,
    Title,
    Tooltip,
} from '@mantine/core';

import { AreaChart } from '@mantine/charts';

import {
    IconAlertCircle,
    IconArrowDownRight,
    IconArrowUpRight,
    IconBook2,
    IconCategory,
    IconCheck,
    IconChartBar,
    IconClock,
    IconCoin,
    IconEye,
    IconFileText,
    IconHeart,
    IconMovie,
    IconPercentage,
    IconPlus,
    IconQrcode,
    IconShoppingCart,
    IconStar,
    IconTrendingUp,
    IconWallet,
    IconHeadphones,
} from '@tabler/icons-react';

import { useAnalyticsStore } from '@/stores/analytics.store';
import { useAuthStore } from '@/stores/auth.store';

import {
    ROLE_PERMISSIONS,
    TEAM_ROLE_LABELS,
} from '@/models';


// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

const MEDIA_ICONS = {
    epub: IconBook2,
    audio: IconHeadphones,
    video: IconMovie,
} as Record<string, typeof IconFileText>;

function formatNumber(value: number) {
    return value.toLocaleString('fr-FR');
}

function formatMoney(value: number) {
    return `${value.toLocaleString('fr-FR')} XAF`;
}

function timeAgo(value: string) {
    const diff =
        Date.now() - new Date(value).getTime();

    const minutes = Math.max(
        0,
        Math.round(diff / 60000)
    );

    if (minutes < 1) return 'À l’instant';

    if (minutes < 60)
        return `Il y a ${minutes} min`;

    const hours = Math.round(minutes / 60);

    if (hours < 24)
        return `Il y a ${hours} h`;

    return `Il y a ${Math.round(hours / 24)} j`;
}


// -----------------------------------------------------------------------------
// DASHBOARD
// -----------------------------------------------------------------------------

export function EditorDashboard() {

    const navigate = useNavigate();

    const user = useAuthStore(
        (state) => state.user
    );

    const permissions =
        ROLE_PERMISSIONS[
        user?.role ?? 'editor'
            ];

    const {
        kpi,
        revenueSeries,
        categoryPerformance,
        topContents,
        activity,
        isLoading,
        fetchDashboard,
    } = useAnalyticsStore();

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);


    // -------------------------------------------------------------------------
    // INSIGHTS LOCAUX
    // -------------------------------------------------------------------------

    const bestCategory = useMemo(() => {

        if (!categoryPerformance.length)
            return null;

        return [...categoryPerformance].sort(
            (a, b) =>
                b.engagementRate -
                a.engagementRate
        )[0];

    }, [categoryPerformance]);


    const bestMediaType = useMemo(() => {

        const totals: Record<
            string,
            number
        > = {};

        categoryPerformance.forEach(
            (category) => {

                totals[category.mediaType] =
                    (totals[category.mediaType] ?? 0) +
                    category.purchases;
            }
        );

        return Object.entries(totals).sort(
            (a, b) => b[1] - a[1]
        )[0] ?? null;

    }, [categoryPerformance]);


    const attentionContents = useMemo(() => {

        return [...topContents]
            .filter(
                (content) =>
                    content.views > 0 &&
                    content.conversionRate < 2
            )
            .sort(
                (a, b) =>
                    b.views - a.views
            )
            .slice(0, 3);

    }, [topContents]);


    // -------------------------------------------------------------------------
    // LOADING
    // -------------------------------------------------------------------------

    if (isLoading && !kpi) {

        return (
            <Center py={100}>
                <Loader color="forest" />
            </Center>
        );
    }


    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <Container
            size="xl"
            py="xl"
        >

            {/* HEADER */}

            <Group
                justify="space-between"
                align="flex-end"
                mb="xl"
            >

                <Stack gap={4}>

                    <Group gap="sm">

                        <Title
                            order={2}
                            fw={600}
                            style={{
                                fontFamily:
                                    'Fraunces, serif',
                            }}
                        >
                            Bonjour,{' '}
                            {user?.displayName
                                    ?.split(' ')[0] ??
                                'Éditeur'}
                        </Title>

                        <Badge
                            color="forest"
                            variant="light"
                        >
                            {
                                TEAM_ROLE_LABELS[
                                user?.role ??
                                'editor'
                                    ]
                            }
                        </Badge>

                    </Group>

                    <Text
                        size="sm"
                        c="dimmed"
                    >
                        Suivez votre activité éditoriale,
                        votre audience et vos performances.
                    </Text>

                </Stack>

                {permissions.canCreateContent && (
                    <Button
                        color="forest"
                        leftSection={
                            <IconPlus size={16} />
                        }
                        onClick={() =>
                            navigate(
                                '/editor/contents/create'
                            )
                        }
                    >
                        Créer un contenu
                    </Button>
                )}

            </Group>


            {/* KPI */}

            {kpi && (
                <SimpleGrid
                    cols={{
                        base: 1,
                        sm: 2,
                        lg: 4,
                    }}
                    mb="xl"
                >

                    {[
                        {
                            icon: IconEye,
                            label: 'Vues',
                            value: formatNumber(
                                kpi.totalViews
                            ),
                            trend: kpi.viewsTrend,
                        },
                        {
                            icon: IconHeart,
                            label: 'Likes',
                            value: formatNumber(
                                kpi.totalLikes
                            ),
                            trend: kpi.likesTrend,
                        },
                        {
                            icon: IconShoppingCart,
                            label: 'Ventes',
                            value: formatNumber(
                                kpi.totalSales
                            ),
                            trend: kpi.salesTrend,
                        },
                        permissions.canViewRevenue
                            ? {
                                icon: IconCoin,
                                label: 'Revenus',
                                value: formatMoney(
                                    kpi.totalRevenue
                                ),
                                trend:
                                kpi.revenueTrend,
                            }
                            : {
                                icon: IconPercentage,
                                label: 'Conversion',
                                value:
                                    `${kpi.conversionRate}%`,
                                trend:
                                kpi.conversionTrend,
                            },
                    ].map((item) => {

                        const positive =
                            item.trend >= 0;

                        const Icon = item.icon;

                        return (
                            <Card
                                key={item.label}
                                withBorder
                                radius="lg"
                                padding="lg"
                            >

                                <Group
                                    justify="space-between"
                                >

                                    <ThemeIcon
                                        variant="light"
                                        color="forest"
                                        size={42}
                                    >
                                        <Icon size={21} />
                                    </ThemeIcon>

                                    <Tooltip label="Évolution par rapport à la période précédente">

                                        <Badge
                                            color={
                                                positive
                                                    ? 'green'
                                                    : 'red'
                                            }
                                            variant="light"
                                            leftSection={
                                                positive
                                                    ? <IconArrowUpRight size={12} />
                                                    : <IconArrowDownRight size={12} />
                                            }
                                        >
                                            {positive
                                                ? '+'
                                                : ''}
                                            {item.trend}%
                                        </Badge>

                                    </Tooltip>

                                </Group>

                                <Text
                                    size="xs"
                                    c="dimmed"
                                    mt="md"
                                >
                                    {item.label}
                                </Text>

                                <Text
                                    fw={700}
                                    fz={26}
                                >
                                    {item.value}
                                </Text>

                            </Card>
                        );
                    })}

                </SimpleGrid>
            )}


            {/* PRODUCTION + PERFORMANCE */}

            <Grid mb="xl">

                <Grid.Col
                    span={{
                        base: 12,
                        md: 5,
                    }}
                >

                    {kpi && (
                        <Paper
                            withBorder
                            radius="lg"
                            p="xl"
                        >

                            <Group
                                justify="space-between"
                                mb="lg"
                            >

                                <Group gap="sm">

                                    <ThemeIcon
                                        color="forest"
                                        variant="light"
                                    >
                                        <IconFileText
                                            size={18}
                                        />
                                    </ThemeIcon>

                                    <Text fw={600}>
                                        Production éditoriale
                                    </Text>

                                </Group>

                                <Badge
                                    color="forest"
                                    variant="light"
                                >
                                    {
                                        kpi.publishedContents +
                                        kpi.draftContents +
                                        kpi.pendingReviewContents
                                    } contenus
                                </Badge>

                            </Group>

                            {([
                                [
                                    'Publiés',
                                    kpi.publishedContents,
                                    'forest',
                                ],
                                [
                                    'En révision',
                                    kpi.pendingReviewContents,
                                    'yellow',
                                ],
                                [
                                    'Brouillons',
                                    kpi.draftContents,
                                    'gray',
                                ],
                            ] as [string, number, string][]).map(
                                ([label, value, color]) => {

                                    const total =
                                        kpi.publishedContents +
                                        kpi.pendingReviewContents +
                                        kpi.draftContents;

                                    return (
                                        <Box
                                            key={label}
                                            mb="md"
                                        >

                                            <Group
                                                justify="space-between"
                                                mb={5}
                                            >
                                                <Text size="sm">
                                                    {label}
                                                </Text>

                                                <Text fw={700}>
                                                    {value}
                                                </Text>
                                            </Group>

                                            <Progress
                                                value={
                                                    total
                                                        ? Number(value) /
                                                        total *
                                                        100
                                                        : 0
                                                }
                                                color={color}
                                            />

                                        </Box>
                                    );
                                }
                            )}

                            <Divider my="md" />

                            <Group
                                justify="space-between"
                            >
                                <Group gap="xs">
                                    <IconStar size={16} />
                                    <Text size="sm">
                                        Premium
                                    </Text>
                                </Group>

                                <Text fw={700}>
                                    {kpi.premiumContents}
                                </Text>
                            </Group>

                        </Paper>
                    )}

                </Grid.Col>


                <Grid.Col
                    span={{
                        base: 12,
                        md: 7,
                    }}
                >

                    <Paper
                        withBorder
                        radius="lg"
                        p="xl"
                    >

                        <Group
                            gap="sm"
                            mb="lg"
                        >

                            <ThemeIcon
                                color="forest"
                                variant="light"
                            >
                                <IconTrendingUp
                                    size={18}
                                />
                            </ThemeIcon>

                            <Stack gap={1}>
                                <Text fw={600}>
                                    Lecture de vos performances
                                </Text>

                                <Text
                                    size="xs"
                                    c="dimmed"
                                >
                                    Les tendances importantes
                                    de votre activité.
                                </Text>
                            </Stack>

                        </Group>

                        <SimpleGrid cols={2}>

                            <Card
                                withBorder
                                padding="md"
                            >

                                <Text
                                    size="xs"
                                    c="dimmed"
                                >
                                    Catégorie la plus engageante
                                </Text>

                                <Text
                                    fw={700}
                                    mt={4}
                                >
                                    {
                                        bestCategory
                                            ?.categoryName ??
                                        '—'
                                    }
                                </Text>

                                {bestCategory && (
                                    <Text
                                        size="xs"
                                        c="forest"
                                    >
                                        {
                                            bestCategory
                                                .engagementRate
                                        }% d'engagement
                                    </Text>
                                )}

                            </Card>

                            <Card
                                withBorder
                                padding="md"
                            >

                                <Text
                                    size="xs"
                                    c="dimmed"
                                >
                                    Format qui vend le plus
                                </Text>

                                <Text
                                    fw={700}
                                    mt={4}
                                >
                                    {
                                        bestMediaType?.[0] ??
                                        '—'
                                    }
                                </Text>

                                {bestMediaType && (
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                    >
                                        {bestMediaType[1]} ventes
                                    </Text>
                                )}

                            </Card>

                        </SimpleGrid>

                        {kpi && (
                            <Box mt="md">

                                <Group
                                    justify="space-between"
                                    mb={5}
                                >
                                    <Text size="sm">
                                        Engagement global
                                    </Text>

                                    <Text
                                        fw={700}
                                        c="forest"
                                    >
                                        {kpi.engagementRate}%
                                    </Text>
                                </Group>

                                <Progress
                                    value={Math.min(
                                        kpi.engagementRate,
                                        100
                                    )}
                                    color="forest"
                                />

                            </Box>
                        )}

                    </Paper>

                </Grid.Col>

            </Grid>


            {/* REVENUS */}

            {permissions.canViewRevenue && (
                <Paper
                    withBorder
                    radius="lg"
                    p="xl"
                    mb="xl"
                >

                    <Group
                        justify="space-between"
                        mb="md"
                    >

                        <Stack gap={2}>
                            <Text fw={600}>
                                Évolution commerciale
                            </Text>

                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Revenus générés au cours
                                des 30 derniers jours.
                            </Text>
                        </Stack>

                        <Badge
                            color="forest"
                            variant="light"
                        >
                            {kpi?.totalSales ?? 0} ventes
                        </Badge>

                    </Group>

                    <AreaChart
                        h={280}
                        data={revenueSeries}
                        dataKey="date"
                        series={[
                            {
                                name: 'revenue',
                                color: 'forest.5',
                                label: 'Revenus',
                            },
                        ]}
                        curveType="monotone"
                        withGradient
                        withDots={false}
                        gridAxis="y"
                        tickLine="y"
                        valueFormatter={(value) =>
                            `${value.toLocaleString(
                                'fr-FR'
                            )} XAF`
                        }
                    />

                </Paper>
            )}


            {/* CATEGORIES */}

            <Paper
                withBorder
                radius="lg"
                p="xl"
                mb="xl"
            >

                <Group gap="sm" mb="lg">

                    <ThemeIcon
                        color="forest"
                        variant="light"
                    >
                        <IconCategory size={17} />
                    </ThemeIcon>

                    <Stack gap={1}>
                        <Text fw={600}>
                            Performance par catégorie
                        </Text>

                        <Text
                            size="xs"
                            c="dimmed"
                        >
                            Les sujets qui intéressent
                            le plus votre audience.
                        </Text>
                    </Stack>

                </Group>

                <SimpleGrid
                    cols={{
                        base: 1,
                        sm: 2,
                        lg: 4,
                    }}
                >

                    {categoryPerformance.map(
                        (category) => {

                            const Icon =
                                MEDIA_ICONS[
                                    category.mediaType
                                    ] ?? IconFileText;

                            return (
                                <Card
                                    key={`${category.categoryName}-${category.mediaType}`}
                                    withBorder
                                    radius="md"
                                >

                                    <Group mb="md">

                                        <ThemeIcon
                                            color="forest"
                                            variant="light"
                                        >
                                            <Icon size={17} />
                                        </ThemeIcon>

                                        <Box>
                                            <Text
                                                size="sm"
                                                fw={600}
                                            >
                                                {
                                                    category.categoryName
                                                }
                                            </Text>

                                            <Text
                                                size="xs"
                                                c="dimmed"
                                            >
                                                {
                                                    category.mediaType
                                                }
                                            </Text>
                                        </Box>

                                    </Group>

                                    <SimpleGrid cols={2}>

                                        <Box>
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                            >
                                                Vues
                                            </Text>
                                            <Text fw={700}>
                                                {
                                                    formatNumber(
                                                        category.views
                                                    )
                                                }
                                            </Text>
                                        </Box>

                                        <Box>
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                            >
                                                Ventes
                                            </Text>
                                            <Text fw={700}>
                                                {
                                                    category.purchases
                                                }
                                            </Text>
                                        </Box>

                                        <Box>
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                            >
                                                Revenus
                                            </Text>
                                            <Text fw={700}>
                                                {
                                                    formatMoney(
                                                        category.revenue
                                                    )
                                                }
                                            </Text>
                                        </Box>

                                        <Box>
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                            >
                                                Engagement
                                            </Text>
                                            <Text
                                                fw={700}
                                                c="forest"
                                            >
                                                {
                                                    category.engagementRate
                                                }%
                                            </Text>
                                        </Box>

                                    </SimpleGrid>

                                </Card>
                            );
                        }
                    )}

                </SimpleGrid>

            </Paper>


            {/* TOP + OPTIMISATION */}

            <Grid mb="xl">

                <Grid.Col
                    span={{
                        base: 12,
                        lg: 7,
                    }}
                >

                    <Paper
                        withBorder
                        radius="lg"
                        p="xl"
                    >

                        <Group
                            justify="space-between"
                            mb="md"
                        >

                            <Text fw={600}>
                                Contenus les plus performants
                            </Text>

                            <Badge
                                color="forest"
                                variant="light"
                            >
                                Top {topContents.length}
                            </Badge>

                        </Group>

                        <Stack gap="sm">

                            {topContents.map(
                                (content, index) => (

                                    <Card
                                        key={content.contentId}
                                        withBorder
                                        padding="sm"
                                        onClick={() =>
                                            navigate(
                                                `/editor/contents/${content.contentId}`
                                            )
                                        }
                                        style={{
                                            cursor:
                                                'pointer',
                                        }}
                                    >

                                        <Group
                                            justify="space-between"
                                        >

                                            <Group gap="sm">


                                                <Box>
                                                    <Text
                                                        size="sm"
                                                        fw={600}
                                                        lineClamp={1}
                                                    >
                                                        {
                                                            content.title
                                                        }
                                                    </Text>

                                                    <Text
                                                        size="xs"
                                                        c="dimmed"
                                                    >
                                                        {
                                                            formatNumber(
                                                                content.views
                                                            )
                                                        } vues · {
                                                        content.purchases
                                                    } ventes
                                                    </Text>
                                                </Box>

                                            </Group>

                                            {permissions.canViewRevenue && (
                                                <Text
                                                    fw={700}
                                                    size="sm"
                                                >
                                                    {
                                                        formatMoney(
                                                            content.revenue
                                                        )
                                                    }
                                                </Text>
                                            )}

                                        </Group>

                                    </Card>
                                )
                            )}

                        </Stack>

                    </Paper>

                </Grid.Col>


                <Grid.Col
                    span={{
                        base: 12,
                        lg: 5,
                    }}
                >

                    <Paper
                        withBorder
                        radius="lg"
                        p="xl"
                    >

                        <Group gap="sm" mb="md">

                            <ThemeIcon
                                color="orange"
                                variant="light"
                            >
                                <IconAlertCircle size={17} />
                            </ThemeIcon>

                            <Stack gap={1}>
                                <Text fw={600}>
                                    À optimiser
                                </Text>

                                <Text
                                    size="xs"
                                    c="dimmed"
                                >
                                    Beaucoup de vues,
                                    mais faible conversion.
                                </Text>
                            </Stack>

                        </Group>

                        {attentionContents.length ? (

                            <Stack gap="sm">

                                {attentionContents.map(
                                    (content) => (

                                        <Card
                                            key={
                                                content.contentId
                                            }
                                            withBorder
                                            padding="sm"
                                            onClick={() =>
                                                navigate(
                                                    `/editor/contents/${content.contentId}`
                                                )
                                            }
                                            style={{
                                                cursor:
                                                    'pointer',
                                            }}
                                        >

                                            <Text
                                                size="sm"
                                                fw={600}
                                                lineClamp={2}
                                            >
                                                {
                                                    content.title
                                                }
                                            </Text>

                                            <Group
                                                justify="space-between"
                                                mt="xs"
                                            >

                                                <Text
                                                    size="xs"
                                                    c="dimmed"
                                                >
                                                    {
                                                        formatNumber(
                                                            content.views
                                                        )
                                                    } vues
                                                </Text>

                                                <Badge
                                                    color="orange"
                                                    variant="light"
                                                >
                                                    {
                                                        content.conversionRate
                                                    }%
                                                </Badge>

                                            </Group>

                                        </Card>
                                    )
                                )}

                            </Stack>

                        ) : (

                            <Center py="xl">

                                <Stack
                                    align="center"
                                    gap={4}
                                >

                                    <IconCheck size={28} />

                                    <Text
                                        fw={500}
                                        size="sm"
                                    >
                                        Tout semble correct
                                    </Text>

                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        ta="center"
                                    >
                                        Aucun contenu prioritaire
                                        à optimiser.
                                    </Text>

                                </Stack>

                            </Center>

                        )}

                    </Paper>

                </Grid.Col>

            </Grid>


            {/* ACTIVITÉ */}

            <Paper
                withBorder
                radius="lg"
                p="xl"
            >

                <Group
                    justify="space-between"
                    mb="lg"
                >

                    <Stack gap={2}>
                        <Text fw={600}>
                            Activité récente
                        </Text>

                        <Text
                            size="xs"
                            c="dimmed"
                        >
                            Les dernières interactions
                            avec vos contenus.
                        </Text>
                    </Stack>

                    <Badge
                        variant="light"
                        color="gray"
                    >
                        {activity.length} événements
                    </Badge>

                </Group>

                {activity.length ? (

                    <Timeline
                        bulletSize={26}
                        lineWidth={2}
                    >

                        {activity.map((event) => (

                            <Timeline.Item
                                key={event.id}
                                title={
                                    <Text size="sm">
                                        {event.label}
                                    </Text>
                                }
                            >

                                <Text
                                    size="xs"
                                    c="dimmed"
                                >
                                    {timeAgo(
                                        event.timestamp
                                    )}
                                </Text>

                            </Timeline.Item>

                        ))}

                    </Timeline>

                ) : (

                    <Center py="xl">
                        <Text
                            size="sm"
                            c="dimmed"
                        >
                            Aucune activité récente.
                        </Text>
                    </Center>

                )}

            </Paper>

        </Container>
    );
}