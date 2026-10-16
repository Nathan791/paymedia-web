// src/routes/AppRouter.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import { EditorRoute } from './EditorRoute';
import { RequirePermission } from './RequirePermission';
import { EditorLayout } from '@/layouts/EditorLayout';
import { LoginPage } from '@/pages/Login/LoginPage';
import { EditorDashboard } from '@/pages/Dashboard/EditorDashboard';
import { EditorContents } from '@/pages/Contents/EditorContents';
import { EditorContentCreate } from '@/pages/Contents/EditorContentCreate';
import { EditorContentDetail } from '@/pages/Contents/EditorContentDetail';
import { EditorContentEdit } from '@/pages/Contents/EditorContentEdit';
import { EditorEditions } from '@/pages/Editions/EditorEditions';
import { EditorEditionDetail } from '@/pages/Editions/EditorEditionDetail';
import { EditorAccessPoints } from '@/pages/Access/EditorAccessPoints';
import { EditorTransactions } from '@/pages/Transactions/EditorTransactions';
import { EditorRevenue } from '@/pages/Revenue/EditorRevenue';
import { EditorAnalytics } from '@/pages/Analytics/EditorAnalytics';
import { EditorContentAnalytics } from '@/pages/Analytics/EditorContentAnalytics';
import { EditorSettings } from '@/pages/Settings/EditorSettings';
import { EditorProfile } from '@/pages/Profile/EditorProfile';
import { EditorTeam } from '@/pages/Team/EditorTeam';
import { RegisterPage } from '@/pages/Register/RegisterPage';
import { NotFound } from '@/pages/NotFound';
import { ForgotPasswordPage } from '@/pages/ForgotPassword/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/RessetPassword/RessetPasswordPage.tsx';

export function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
                path="/editor"
                element={
                    <EditorRoute>
                        <EditorLayout />
                    </EditorRoute>
                }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<EditorDashboard />} />

                {/* Le contenu suit une règle plus fine que "canCreateContent"
                    (un journaliste ne peut créer/soumettre que le sien, voir
                    content.service.ts) — géré à l'intérieur des pages plutôt
                    qu'ici, où on se contente de vérifier l'accès au module. */}
                <Route path="contents" element={<RequirePermission permission="canCreateContent"><EditorContents /></RequirePermission>} />
                <Route path="contents/create" element={<RequirePermission permission="canCreateContent"><EditorContentCreate /></RequirePermission>} />
                <Route path="contents/:id" element={<RequirePermission permission="canCreateContent"><EditorContentDetail /></RequirePermission>} />
                <Route path="contents/:id/edit" element={<RequirePermission permission="canCreateContent"><EditorContentEdit /></RequirePermission>} />

                <Route path="editions" element={<RequirePermission permission="canCreateContent"><EditorEditions /></RequirePermission>} />
                <Route path="editions/:id" element={<RequirePermission permission="canCreateContent"><EditorEditionDetail /></RequirePermission>} />

                <Route path="access" element={<RequirePermission permission="canCreateContent"><EditorAccessPoints /></RequirePermission>} />
                <Route path="transactions" element={<RequirePermission permission="canViewRevenue"><EditorTransactions /></RequirePermission>} />
                <Route path="revenue" element={<RequirePermission permission="canViewRevenue"><EditorRevenue /></RequirePermission>} />
                <Route path="analytics" element={<RequirePermission permission="canCreateContent"><EditorAnalytics /></RequirePermission>} />
                <Route path="analytics/content/:id" element={<RequirePermission permission="canCreateContent"><EditorContentAnalytics /></RequirePermission>} />
                <Route path="team" element={<RequirePermission permission="canManageTeam"><EditorTeam /></RequirePermission>} />
                <Route path="settings" element={<RequirePermission permission="canManageSettings"><EditorSettings /></RequirePermission>} />
                <Route path="profile" element={<EditorProfile />} />

            </Route>

            <Route path="/" element={<Navigate to="/editor" replace />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />}/>
            <Route path="/reset-password" element={<ResetPasswordPage />}/>
        </Routes>

    );
}
