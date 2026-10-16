import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
    logger: true,
});

// ============================================================
// 1. CORS
// ============================================================

fastify.register(cors, { origin: '*' });

// ============================================================
// 2. DONNÉES FICTIVES
// ============================================================

const users = [
    { id: 1, username: 'Luigii', email: 'admin@paymedia.com', role: 'admin', isActive: true },
    { id: 2, username: 'FarrellNey', email: 'ney@email.com', role: 'editor', isActive: true },
    { id: 3, username: 'JeanLecteur', email: 'jean@email.com', role: 'reader', isActive: true },
    { id: 4, username: 'philFonden', email: 'phil@email.com', role: 'reader', isActive: true },
    { id: 5, username: 'melinguiYamal', email: 'yamal@email.com', role: 'editor', isActive: true },
    { id: 6, username: 'AtanganaMesii', email: 'messi@email.com', role: 'reader', isActive: true },
    { id: 7, username: 'BrautHaaland', email: 'haaland@email.com', role: 'editor', isActive: true },
];

//  Ajout de userId: 1 pour chaque contenu
const contents = [
    { id: 1, userId: 1, title: 'Interview du PDG', status: 'published', price: 5000, author: 'MediaPlus' },
    { id: 2, userId: 1, title: 'Guide du développeur', status: 'pending', price: 7000, author: 'TechMag' },
    { id: 3, userId: 1, title: 'Recette traditionnelle', status: 'published', price: 1000, author: 'WorlFood' },
    { id: 4, userId: 1, title: 'Entretien IA', status: 'published', price: 10000, author: 'IAInnovation' },
    { id: 5, userId: 1, title: 'Le secret de la réussite', status: 'pending', price: 8000, author: 'Claudel' },
    { id: 6, userId: 1, title: "C'est difficile mais c'est possible", status: 'published', price: 9000, author: 'Tchokos' },
    { id: 7, userId: 1, title: "C'est en marchant qu'on trouve les marchés", status: 'pending', price: 12000, author: 'Artur' },
];

const transactions = [
    { id: 1, user: 'JeanLecteur', type: 'recharge', amount: 10000, status: 'completed', date: '2026-07-20' },
    { id: 2, user: 'PierreLecteur', type: 'achat', amount: 1500, status: 'pending', date: '2026-07-21' },
    { id: 3, user: 'RaynCherki', type: 'achat', amount: 20000, status: 'pending', date: '2026-01-11' },
    { id: 4, user: 'RaphaelleLecteur', type: 'recharge', amount: 5000, status: 'completed', date: '2024-03-22' },
    { id: 5, user: 'Daniel', type: 'achat', amount: 20000, status: 'completed', date: '2025-12-10' },
];

const commissions = [
    { id: 1, editor: 'MediaPlus', amount: 2500, rate: 10, status: 'paid', month: 'Juillet 2026' },
    { id: 2, editor: 'TechMag', amount: 1800, rate: 8, status: 'pending', month: 'Juillet 2026' },
    { id: 3, editor: 'WorlFood', amount: 1000, rate: 12, status: 'pending', month: 'Juillet 2026' },
    { id: 4, editor: 'IAInnovation', amount: 10000, rate: 10, status: 'paid', month: 'Juillet 2026' },
    { id: 5, editor: 'Tchokos', amount: 9000, rate: 10, status: 'paid', month: 'Juillet 2026' },
];

// ============================================================
// 3. JOURNAUX D'AUDIT (DONNÉES + FONCTION)
// ============================================================

const auditLogs: any[] = [];

/**
 * Enregistre une action dans le journal d'audit
 */
function addAuditLog(
    adminId: number,
    adminName: string,
    action: string,
    target: string,
    targetId: number | undefined,
    details: string,
    ipAddress: string = '127.0.0.1'
) {
    auditLogs.unshift({
        id: auditLogs.length + 1,
        adminId,
        adminName,
        action,
        target,
        targetId,
        details,
        ipAddress,
        timestamp: new Date().toISOString(),
    });
}

// ============================================================
// 4. MIDDLEWARE AUTH (SANS VÉRIFICATION POUR LE DÉVELOPPEMENT)
// ============================================================

//function authMiddleware( _reply: any, done: any) {
    //  Token récupéré mais pas utilisé (pour le développement, on accepte tout)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
   // const _token = req.headers.authorization?.replace('Bearer ', '');
    //  On accepte toutes les requêtes pour le développement
    /* if (token !== 'fake-token-123') {
     return reply.status(401).send({
         success: false,
         error: 'Token invalide',
     });
 }


   // done();
}
     */


const authMiddleware = async (req: any, reply: any) => {
    // On accepte toutes les requêtes pour le développement
    return;
};
// ============================================================
// 5. HEALTH
// ============================================================

fastify.get('/health', async () => ({
    status: 'OK',
    service: 'PayMedia Admin Mock',
}));

// ============================================================
// 6. AUTH
// ============================================================

fastify.post('/api/admin/auth/login', async (req, reply) => {
    const { email, password } = req.body as any;

    if (email === 'admin@paymedia.com' && password === 'Admin123!') {
        return reply.send({
            success: true,
            message: 'Connexion réussie',
            data: {
                token: 'fake-token-123',
                user: {
                    id: 1,
                    username: 'SuperAdmin',
                    email: 'admin@paymedia.com',
                    role: 'admin',
                },
            },
        });
    }

    return reply.status(401).send({
        success: false,
        error: 'Email ou mot de passe incorrect',
    });
});

// ============================================================
// 7. DASHBOARD
// ============================================================

fastify.get(
    '/api/admin/dashboard/stats',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { period } = req.query as { period?: string };
        const now = new Date();
        let startDate: Date;

        // Déterminer la période
        switch (period) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
        }

        let multiplier = 1;

        if (period === 'today') {
            multiplier = 0.1;
        } else if (period === 'week') {
            multiplier = 0.3;
        } else if (period === 'year') {
            multiplier = 2;
        } else {
            multiplier = 1;
        }

        // Calcul direct des indicateurs
        const totalUsers = Math.round(users.length * multiplier);
        const activeUsers = Math.round(users.filter(u => u.isActive).length * multiplier);
        const totalContents = Math.round(contents.length * multiplier);
        const publishedContents = Math.round(contents.filter(c => c.status === 'published').length * multiplier);
        const pendingModeration = Math.round(contents.filter(c => c.status === 'pending').length * multiplier);
        const blockedContents = Math.round(contents.filter(c => c.status === 'blocked').length * multiplier);

        const monthlyRevenue = Math.round(845000 * multiplier);
        const totalRevenue = Math.round(2450000 * multiplier);

        const totalTransactions = Math.round(transactions.length * multiplier);
        const failedTransactions = Math.round(transactions.filter(t => t.status === 'failed').length * multiplier);
        const completedTransactions = Math.round(transactions.filter(t => t.status === 'completed').length * multiplier);

        const conversionRate = period === 'today' ? 4.8 : period === 'week' ? 4.5 : 4.2;

        const growth = {
            users: Math.round(12 * multiplier),
            contents: Math.round(8 * multiplier),
            revenue: Math.round(15 * multiplier),
            transactions: Math.round(5 * multiplier),
        };

        let alertsCount = 3;
        if (period === 'today') alertsCount = 0;
        else if (period === 'week') alertsCount = 1;

        const topContents = [
            { id: 1, title: 'Interview du PDG', author: 'MediaPlus', sales: Math.round(1500 * multiplier), revenue: Math.round(2250000 * multiplier) },
            { id: 2, title: 'Guide du développeur', author: 'TechMag', sales: Math.round(850 * multiplier), revenue: Math.round(1275000 * multiplier) },
            { id: 3, title: 'Recette traditionnelle', author: 'WorlFood', sales: Math.round(620 * multiplier), revenue: Math.round(930000 * multiplier) },
            { id: 4, title: 'Entretien IA', author: 'IAInnovation', sales: Math.round(450 * multiplier), revenue: Math.round(675000 * multiplier) },
            { id: 5, title: 'Le secret de la réussite', author: 'Claudel', sales: Math.round(320 * multiplier), revenue: Math.round(480000 * multiplier) },
        ];

        let chartLabels: string[] = [];
        let chartSales: number[] = [];
        let chartUsers: number[] = [];

        if (period === 'today') {
            chartLabels = ['00h', '04h', '08h', '12h', '16h', '20h', '23h'];
            chartSales = [500, 1200, 3000, 5000, 4000, 2000, 800];
            chartUsers = [1, 3, 8, 12, 10, 5, 2];
        } else if (period === 'week') {
            chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
            chartSales = [12000, 8000, 15000, 22000, 18000, 9500, 5000];
            chartUsers = [5, 8, 12, 7, 15, 10, 6];
        } else if (period === 'year') {
            chartLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'];
            chartSales = [45000, 52000, 48000, 61000, 58000, 72000, 65000];
            chartUsers = [20, 25, 22, 30, 28, 35, 32];
        } else {
            chartLabels = ['Sem1', 'Sem2', 'Sem3', 'Sem4'];
            chartSales = [180000, 220000, 200000, 245000];
            chartUsers = [45, 55, 50, 60];
        }

        const alertItems = [];
        if (alertsCount > 0) {
            alertItems.push({
                id: 1,
                type: 'security',
                severity: 'high',
                message: '15 tentatives de connexion suspectes - IP 192.168.1.100',
                date: new Date().toISOString(),
            });
            if (alertsCount > 1) {
                alertItems.push({
                    id: 2,
                    type: 'content',
                    severity: 'medium',
                    message: 'Contenu "Politique énergétique" signalé par 3 utilisateurs',
                    date: new Date(Date.now() - 3600000).toISOString(),
                });
            }
            if (alertsCount > 2) {
                alertItems.push({
                    id: 3,
                    type: 'payment',
                    severity: 'medium',
                    message: 'Transaction #5 échouée - Montant 20 000 FCFA',
                    date: new Date(Date.now() - 7200000).toISOString(),
                });
            }
        }

        const recentActivities = [
            { id: 1, user: 'JeanLecteur', action: 'Achat', amount: Math.round(5000 * multiplier), status: 'completed', date: new Date().toLocaleString() },
            { id: 2, user: 'AliceReader', action: 'Recharge', amount: Math.round(10000 * multiplier), status: 'completed', date: new Date().toLocaleString() },
            { id: 3, user: 'JohnDoe', action: 'Échec paiement', amount: Math.round(1500 * multiplier), status: 'failed', date: new Date().toLocaleString() },
            { id: 4, user: 'PierreLecteur', action: 'Achat', amount: Math.round(3000 * multiplier), status: 'pending', date: new Date().toLocaleString() },
        ];

        return reply.send({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalContents,
                publishedContents,
                pendingModeration,
                blockedContents,
                monthlyRevenue,
                totalRevenue,
                totalTransactions,
                failedTransactions,
                completedTransactions,
                conversionRate,
                growth,
                alerts: {
                    total: alertsCount,
                    items: alertItems,
                },
                recentActivities,
                topContents,
                chartData: {
                    labels: chartLabels,
                    sales: chartSales,
                    users: chartUsers,
                },
            },
        });
    }
);

// ============================================================
// 8. USERS
// ============================================================

fastify.get(
    '/api/admin/users',
    { preHandler: authMiddleware },
    async (_req, reply) => {
        return reply.send({ success: true, data: users });
    }
);

fastify.post(
    '/api/admin/users/:id/block',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const user = users.find((u) => u.id === Number(id));

        if (!user) {
            return reply.status(404).send({ success: false, error: 'Utilisateur non trouvé' });
        }

        user.isActive = false;

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'block_user',
            'Utilisateur',
            user.id,
            `${user.username} (${user.email}) bloqué`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Utilisateur bloqué',
            data: user,
        });
    }
);

fastify.post(
    '/api/admin/users/:id/unblock',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const user = users.find((u) => u.id === Number(id));

        if (!user) {
            return reply.status(404).send({ success: false, error: 'Utilisateur non trouvé' });
        }

        user.isActive = true;

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'unblock_user',
            'Utilisateur',
            user.id,
            `${user.username} (${user.email}) débloqué`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Utilisateur débloqué',
            data: user,
        });
    }
);

fastify.put(
    '/api/admin/users/:id/role',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const { role } = req.body as { role: string };

        const validRoles = ['admin', 'editor', 'reader'];
        if (!validRoles.includes(role)) {
            return reply.status(400).send({
                success: false,
                error: 'Rôle invalide',
            });
        }

        const user = users.find((u) => u.id === Number(id));
        if (!user) {
            return reply.status(404).send({ success: false, error: 'Utilisateur non trouvé' });
        }

        const oldRole = user.role;
        user.role = role;

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'update_role',
            'Utilisateur',
            user.id,
            `${user.username} : rôle changé de ${oldRole} à ${role}`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: `Rôle mis à jour vers ${role}`,
            data: user,
        });
    }
);

fastify.post(
    '/api/admin/users',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { username, email, role, password } = req.body as any;

        if (!username || !email || !role) {
            return reply.status(400).send({
                success: false,
                error: 'Username, email et rôle sont requis',
            });
        }

        const existingUser = users.find((u) => u.email === email);
        if (existingUser) {
            return reply.status(400).send({
                success: false,
                error: 'Cet email est déjà utilisé',
            });
        }

        const newUser = {
            id: users.length + 1,
            username,
            email,
            role: role || 'reader',
            isActive: true,
            password: password || 'default123',
        };

        users.push(newUser);

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'create_user',
            'Utilisateur',
            newUser.id,
            `${newUser.username} (${newUser.email}) créé avec le rôle ${newUser.role}`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Utilisateur créé avec succès',
            data: newUser,
        });
    }
);

fastify.put(
    '/api/admin/users/:id',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const { username, email, role, isActive } = req.body as any;

        const user = users.find((u) => u.id === Number(id));
        if (!user) {
            return reply.status(404).send({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        if (email && email !== user.email) {
            const existingUser = users.find((u) => u.email === email && u.id !== Number(id));
            if (existingUser) {
                return reply.status(400).send({
                    success: false,
                    error: 'Cet email est déjà utilisé',
                });
            }
        }

        const oldUsername = user.username;
        const oldRole = user.role;
        const oldStatus = user.isActive;

        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (isActive !== undefined) user.isActive = isActive;

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        let details = `Utilisateur #${user.id} modifié`;
        if (username && username !== oldUsername) details += ` : nom ${oldUsername} → ${username}`;
        if (role && role !== oldRole) details += ` : rôle ${oldRole} → ${role}`;
        if (isActive !== undefined && isActive !== oldStatus) {
            details += ` : statut ${oldStatus ? 'Actif' : 'Bloqué'} → ${isActive ? 'Actif' : 'Bloqué'}`;
        }

        addAuditLog(
            admin.id,
            admin.username,
            'update_user',
            'Utilisateur',
            user.id,
            details,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Utilisateur modifié avec succès',
            data: user,
        });
    }
);

fastify.delete(
    '/api/admin/users/:id',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;

        const userIndex = users.findIndex((u) => u.id === Number(id));
        if (userIndex === -1) {
            return reply.status(404).send({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        //const _user = users[userIndex];
        const deletedUser = users.splice(userIndex, 1)[0];

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'delete_user',
            'Utilisateur',
            deletedUser.id,
            `${deletedUser.username} (${deletedUser.email}) supprimé`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Utilisateur supprimé avec succès',
            data: deletedUser,
        });
    }
);

fastify.get(
    '/api/admin/users/:id/detail',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const userId = Number(id);

        const user = users.find((u) => u.id === userId);
        if (!user) {
            return reply.status(404).send({
                success: false,
                error: 'Utilisateur non trouvé',
            });
        }

        let stats = {};

        if (user.role === 'reader') {
            const purchases = Math.floor(Math.random() * 50) + 5;
            const totalSpent = purchases * 1500;
            const recentViews = [
                { id: 1, title: 'Interview du PDG', viewedAt: new Date().toISOString() },
                { id: 2, title: 'Guide du développeur', viewedAt: new Date().toISOString() },
                { id: 3, title: 'Recette traditionnelle', viewedAt: new Date().toISOString() },
            ];
            stats = {
                totalPurchases: purchases,
                totalSpent: totalSpent,
                recentlyViewed: recentViews,
            };
        }

        if (user.role === 'editor') {
            const totalContents = Math.floor(Math.random() * 30) + 3;
            const totalRevenue = Math.floor(Math.random() * 500000) + 50000;
            const totalCommission = Math.round(totalRevenue * 0.1);
            const topContents = [
                { id: 1, title: 'Interview du PDG', sales: 150, revenue: 225000 },
                { id: 2, title: 'Guide du développeur', sales: 85, revenue: 127500 },
                { id: 3, title: 'Recette traditionnelle', sales: 62, revenue: 93000 },
            ];
            stats = {
                totalContents,
                totalRevenue,
                totalCommission,
                topContents,
            };
        }

        if (user.role === 'admin') {
            const totalActions = Math.floor(Math.random() * 500) + 50;
            const totalModerations = Math.floor(Math.random() * 200) + 20;
            const recentActions = [
                { id: 1, action: 'Connexion', target: 'Système', date: new Date().toISOString() },
                { id: 2, action: 'Blocage utilisateur', target: 'JeanLecteur', date: new Date().toISOString() },
                { id: 3, action: 'Approbation contenu', target: 'Guide du développeur', date: new Date().toISOString() },
            ];
            stats = {
                totalActions,
                totalModerations,
                recentActions,
            };
        }

        return reply.send({
            success: true,
            data: {
                ...user,
                stats,
            },
        });
    }
);

// ============================================================
// 9. CONTENTS
// ============================================================

fastify.get(
    '/api/admin/contents',
    { preHandler: authMiddleware },
    async (_req, reply) => {
        return reply.send({ success: true, data: contents });
    }
);

fastify.post(
    '/api/admin/contents/:id/approve',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const content = contents.find((c) => c.id === Number(id));

        if (!content) {
            return reply.status(404).send({ success: false, error: 'Contenu non trouvé' });
        }

        content.status = 'published';

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'approve_content',
            'Contenu',
            content.id,
            `${content.title} approuvé (${content.author})`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Contenu approuvé',
            data: content,
        });
    }
);

fastify.post(
    '/api/admin/contents/:id/block',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const content = contents.find((c) => c.id === Number(id));

        if (!content) {
            return reply.status(404).send({ success: false, error: 'Contenu non trouvé' });
        }

        content.status = 'blocked';

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'block_content',
            'Contenu',
            content.id,
            `${content.title} bloqué (${content.author})`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Contenu bloqué',
            data: content,
        });
    }
);

fastify.post(
    '/api/admin/contents/:id/unblock',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const content = contents.find((c) => c.id === Number(id));

        if (!content) {
            return reply.status(404).send({ success: false, error: 'Contenu non trouvé' });
        }

        content.status = 'published';

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'unblock_content',
            'Contenu',
            content.id,
            `${content.title} débloqué (${content.author})`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Contenu débloqué',
            data: content,
        });
    }
);

fastify.post(
    '/api/admin/contents/:id/archive',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const content = contents.find((c) => c.id === Number(id));

        if (!content) {
            return reply.status(404).send({ success: false, error: 'Contenu non trouvé' });
        }

        content.status = 'archived';

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'archive_content',
            'Contenu',
            content.id,
            `${content.title} archivé (${content.author})`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: 'Contenu archivé',
            data: content,
        });
    }
);

fastify.get(
    '/api/admin/contents/:id/detail',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const contentId = Number(id);

        const content = contents.find((c) => c.id === contentId);
        if (!content) {
            return reply.status(404).send({
                success: false,
                error: 'Contenu non trouvé',
            });
        }

        const author = users.find((u) => u.id === content.userId);

        const views = Math.floor(Math.random() * 10000) + 500;
        const downloads = Math.floor(Math.random() * 3000) + 100;
        const purchases = Math.floor(Math.random() * 1500) + 50;
        const revenue = purchases * content.price;

        const moderationHistory = [
            {
                id: 1,
                action: 'Soumis',
                moderator: 'Système',
                comment: 'Contenu soumis pour modération',
                date: new Date(Date.now() - 86400000 * 5).toISOString(),
            },
            {
                id: 2,
                action: 'Approuvé',
                moderator: 'SuperAdmin',
                comment: 'Contenu validé',
                date: new Date(Date.now() - 86400000 * 3).toISOString(),
            },
        ];

        const chartData = {
            labels: ['J-30', 'J-25', 'J-20', 'J-15', 'J-10', 'J-5', 'J-0'],
            sales: [
                Math.floor(Math.random() * 100) + 20,
                Math.floor(Math.random() * 100) + 30,
                Math.floor(Math.random() * 100) + 40,
                Math.floor(Math.random() * 100) + 50,
                Math.floor(Math.random() * 100) + 60,
                Math.floor(Math.random() * 100) + 70,
                Math.floor(Math.random() * 100) + 80,
            ],
        };

        return reply.send({
            success: true,
            data: {
                ...content,
                author: author || null,
                stats: {
                    views,
                    downloads,
                    purchases,
                    revenue,
                },
                moderationHistory,
                chartData,
            },
        });
    }
);

// ============================================================
// 10. TRANSACTIONS
// ============================================================

fastify.get(
    '/api/admin/transactions',
    { preHandler: authMiddleware },
    async (_req, reply) => {
        return reply.send({ success: true, data: transactions });
    }
);

fastify.get(
    '/api/admin/transactions/:id/detail',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const transactionId = Number(id);

        const transaction = transactions.find((t) => t.id === transactionId);
        if (!transaction) {
            return reply.status(404).send({
                success: false,
                error: 'Transaction non trouvée',
            });
        }

        const user = users.find((u) => u.username === transaction.user);

        const userStats = {
            totalTransactions: Math.floor(Math.random() * 50) + 5,
            totalSpent: Math.floor(Math.random() * 500000) + 10000,
            averageAmount: Math.floor(Math.random() * 20000) + 5000,
        };

        const userHistory = transactions
            .filter((t) => t.user === transaction.user)
            .slice(0, 5)
            .map((t) => ({
                id: t.id,
                type: t.type,
                amount: t.amount,
                status: t.status,
                date: t.date,
            }));

        return reply.send({
            success: true,
            data: {
                ...transaction,
                user: user || null,
                userStats,
                userHistory,
            },
        });
    }
);

// ============================================================
// 11. COMMISSIONS
// ============================================================

fastify.get(
    '/api/admin/commissions',
    { preHandler: authMiddleware },
    async (_req, reply) => {
        return reply.send({ success: true, data: commissions });
    }
);

fastify.put(
    '/api/admin/commissions/:id/rate',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const { rate } = req.body as { rate: number };

        if (rate < 0 || rate > 100) {
            return reply.status(400).send({
                success: false,
                error: 'Le taux doit être compris entre 0 et 100',
            });
        }

        const commission = commissions.find((c) => c.id === Number(id));
        if (!commission) {
            return reply.status(404).send({ success: false, error: 'Commission non trouvée' });
        }

        const oldRate = commission.rate || 10;
        commission.rate = rate;

        const admin = (req as any).userData || { id: 1, username: 'SuperAdmin' };
        addAuditLog(
            admin.id,
            admin.username,
            'update_commission',
            'Commission',
            commission.id,
            `${commission.editor} : taux modifié de ${oldRate}% à ${rate}%`,
            req.ip || '127.0.0.1'
        );

        return reply.send({
            success: true,
            message: `Taux mis à jour à ${rate}%`,
            data: commission,
        });
    }
);

fastify.get(
    '/api/admin/commissions/:id/detail',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { id } = req.params as any;
        const commissionId = Number(id);

        const commission = commissions.find((c) => c.id === commissionId);
        if (!commission) {
            return reply.status(404).send({
                success: false,
                error: 'Commission non trouvée',
            });
        }

        const history = commissions
            .filter((c) => c.editor === commission.editor)
            .map((c) => ({
                id: c.id,
                amount: c.amount,
                status: c.status,
                month: c.month,
            }));

        const stats = {
            totalCommissions: history.reduce((sum, h) => sum + h.amount, 0),
            averageCommission: Math.round(history.reduce((sum, h) => sum + h.amount, 0) / history.length),
            totalPaid: history.filter((h) => h.status === 'paid').reduce((sum, h) => sum + h.amount, 0),
            totalPending: history.filter((h) => h.status === 'pending').reduce((sum, h) => sum + h.amount, 0),
        };

        return reply.send({
            success: true,
            data: {
                ...commission,
                history,
                stats,
            },
        });
    }
);

// ============================================================
// 12. AUDIT
// ============================================================

fastify.get(
    '/api/admin/audit',
    { preHandler: authMiddleware },
    async (_req, reply) => {
        return reply.send({ success: true, data: auditLogs });
    }
);

fastify.get(
    '/api/admin/audit/admin/:adminId',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { adminId } = req.params as any;
        const logs = auditLogs.filter((log) => log.adminId === Number(adminId));
        return reply.send({ success: true, data: logs });
    }
);

fastify.get(
    '/api/admin/audit/action/:action',
    { preHandler: authMiddleware },
    async (req, reply) => {
        const { action } = req.params as any;
        const logs = auditLogs.filter((log) => log.action === action);
        return reply.send({ success: true, data: logs });
    }
);

// ============================================================
// 13. START SERVER
// ============================================================

fastify.listen(
    {
        port: 3001,
        host: '0.0.0.0',
    },
    (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        console.log(' Mock API démarrée sur http://localhost:3001');
        console.log(' Login: POST http://localhost:3001/api/admin/auth/login');
        console.log(' Dashboard: GET http://localhost:3001/api/admin/dashboard/stats');
        console.log(' Users: GET http://localhost:3001/api/admin/users');
        console.log(' Contents: GET http://localhost:3001/api/admin/contents');
        console.log(' Transactions: GET http://localhost:3001/api/admin/transactions');
        console.log(' Commissions: GET http://localhost:3001/api/admin/commissions');
        console.log(' Audit: GET http://localhost:3001/api/admin/audit');
        console.log(' Address:', address);
    }
);