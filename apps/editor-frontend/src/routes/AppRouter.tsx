import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/editor/Login/LoginPage.js';
import { RegisterPage } from '@/pages/editor/register/RegisterPage.js';
import { EditorLayout } from '@/components/editor/layouts/EditorLayout.js';
import { EditorRoute } from '@/routes/EditorRoute.js';
import { EditorDashboard } from '@/pages/editor/Dashboard/EditorDashboard.js';
import { EditorContents } from '@/pages/editor/Contents/EditorContents.js';
import { EditorContentCreate } from '@/pages/editor/Contents/EditorContentCreate.js';
import { EditorContentEdit } from '@/pages/editor/Contents/EditorContentEdit.js';
import { EditorContentDetail } from '@/pages/editor/Contents/EditorContentDetail.js'

export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<div>Accès refusé</div>} />

            <Route path="/" element={<EditorRoute><EditorLayout /></EditorRoute>}>
                <Route index element={<Navigate to="/editor/dashboard" replace />} />
                <Route path="editor/dashboard" element={<EditorDashboard />} />
                <Route path="editor/contents" element={<EditorContents />} />
                <Route path="editor/contents/create" element={<EditorContentCreate />} />
                <Route path="editor/contents/:id/edit" element={<EditorContentEdit />} />
                <Route path="editor/contents/:id" element={<EditorContentDetail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};