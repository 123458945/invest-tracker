import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HoldingsPage from './pages/HoldingsPage';
import AlertsPage from './pages/AlertsPage';
import TransactionsPage from './pages/TransactionsPage';
import UserSettingsPage from './pages/UserSettingsPage';
import EmailTestPage from './pages/EmailTestPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout>
          <DashboardPage />
        </MainLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/holdings',
    element: (
      <PrivateRoute>
        <MainLayout>
          <HoldingsPage />
        </MainLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/transactions',
    element: (
      <PrivateRoute>
        <MainLayout>
          <TransactionsPage />
        </MainLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/alerts',
    element: (
      <PrivateRoute>
        <MainLayout>
          <AlertsPage />
        </MainLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <PrivateRoute>
        <MainLayout>
          <UserSettingsPage />
        </MainLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/email-test',
    element: (
      <PrivateRoute>
        <MainLayout>
          <EmailTestPage />
        </MainLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
