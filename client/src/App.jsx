import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from './hooks/useAuth';
import websocketService from './services/websocketService';
import NotificationBell from './components/Notifications/NotificationBell';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Properties from './pages/Properties/PropertyList';
import PropertyDetails from './pages/properties/PropertyDetails';
import AddProperty from './pages/properties/AddProperty';
import EditProperty from './pages/properties/EditProperty';
import Profile from './pages/profile/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import MessagingPage from './pages/MessagingPage';
import NotFound from './pages/NotFound';

function App() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      websocketService.connect(user.id);
      websocketService.subscribeToNotifications((notification) => {
        toast(notification.message, {
          type: notification.type || 'info'
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
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
          <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
          <Route path="/properties/add" element={<ProtectedRoute allowedRoles={['agent', 'admin']}><AddProperty /></ProtectedRoute>} />
          <Route path="/properties/edit/:id" element={<ProtectedRoute allowedRoles={['agent', 'admin']}><EditProperty /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
          <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ErrorBoundary>
  );
}

export default App;
