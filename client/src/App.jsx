import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import useAuth from './contexts/useAuth';
import websocketService from './services/websocketService';
import NotificationBell from './components/Notifications/NotificationBell';
import ProtectedRoute from './components/routes/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/Properties/PropertyList';
import PropertyDetails from './pages/Properties/PropertyDetails';
import AddProperty from './pages/Properties/AddProperty';
import EditProperty from './pages/Properties/EditProperty';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import MessagingPage from './pages/MessagingPage';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import Unauthorized from './pages/Unauthorized';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      websocketService.connect(user.id);

      websocketService.subscribeToNotifications((notification) => {
        toast(notification.message, {
          type: notification.type || 'info',
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      });
    }

    return () => {
      websocketService.disconnect();
    };
  }, [user]);

  return (
    <ErrorBoundary>
      <CssBaseline />
      <NotificationBell />

      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔐 Protected Routes under Layout */}
        <Route element={<Layout />}>
          {/* 🔁 Redirect root to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 📊 Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          {/* 👤 Profile */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          {/* 💬 Messaging */}
          <Route path="/messages" element={
            <ProtectedRoute>
              <MessagingPage />
            </ProtectedRoute>
          } />
          <Route path="/messages/:conversationId" element={
            <ProtectedRoute>
              <MessagingPage />
            </ProtectedRoute>
          } />

          {/* 🏠 Property Management */}
          <Route path="/properties/add" element={
            <ProtectedRoute allowedRoles={['agent', 'admin']}>
              <AddProperty />
            </ProtectedRoute>
          } />
          <Route path="/properties/edit/:id" element={
            <ProtectedRoute allowedRoles={['agent', 'admin']}>
              <EditProperty />
            </ProtectedRoute>
          } />
          <Route path="/properties/:id" element={
            <ProtectedRoute>
              <PropertyDetails />
            </ProtectedRoute>
          } />
          <Route path="/properties" element={
            <ProtectedRoute>
              <Properties />
            </ProtectedRoute>
          } />

          {/* 🛠 Admin Panel */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Route>

        {/* ⚠️ Custom Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </ErrorBoundary>
  );
}

export default App;
