import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashbord.tsx';
import Users from './pages/Users/Users';
import Contents from './pages/Contents/Contents.tsx';
import Transactions from './pages/Transactions/Transactions.tsx';
import Commissions from './pages/Commissions/Commissions.tsx';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import Audit from './pages/Audit/audit.tsx';
import UserDetail from './pages/Users/UserDetail';
import ContentDetail from './pages/Contents/ContentDetail';
import TransactionDetail from './pages/Transactions/TransactionDetail';
import CommissionDetail from './pages/Commissions/CommissionDetail';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="users" element={<Users />} />
                    <Route path="contents" element={<Contents />} />
                    <Route path="/commissions" element={<Commissions />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="audit" element={<Audit />} />
                    <Route path="users/:id" element={<UserDetail />} />
                    <Route path="contents/:id" element={<ContentDetail />} />
                    <Route path="transactions/:id" element={<TransactionDetail />} />
                    <Route path="commissions/:id" element={<CommissionDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
