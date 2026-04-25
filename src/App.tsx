// === FILE: src/App.tsx ===
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// User
import { UserDashboard } from './pages/user/UserDashboard';
import { BookingPage } from './pages/user/BookingPage';
import { SchedulePage } from './pages/user/SchedulePage';
import { HabitsPage } from './pages/user/HabitsPage';
import { HistoryPage } from './pages/user/HistoryPage';

// Trainer
import { TrainerDashboard } from './pages/trainer/TrainerDashboard';
import { BookingRequestsPage } from './pages/trainer/BookingRequestsPage';
import { AvailabilityPage } from './pages/trainer/AvailabilityPage';
import { ClientListPage } from './pages/trainer/ClientListPage';

// Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';

// Protected Route Component
const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { isAuthenticated, role } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  
  return <Outlet />;
};

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  
  // User Routes
  {
    path: '/user',
    element: <ProtectedRoute allowedRoles={['user']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <UserDashboard /> },
          { path: 'booking', element: <BookingPage /> },
          { path: 'schedule', element: <SchedulePage /> },
          { path: 'habits', element: <HabitsPage /> },
          { path: 'history', element: <HistoryPage /> },
        ]
      }
    ]
  },

  // Trainer Routes
  {
    path: '/trainer',
    element: <ProtectedRoute allowedRoles={['trainer']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <TrainerDashboard /> },
          { path: 'requests', element: <BookingRequestsPage /> },
          { path: 'availability', element: <AvailabilityPage /> },
          { path: 'clients', element: <ClientListPage /> },
        ]
      }
    ]
  },

  // Admin Routes
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'dashboard', element: <AdminDashboard /> },
          { path: 'analytics', element: <AnalyticsPage /> },
        ]
      }
    ]
  },

  // Catch all
  { path: '*', element: <Navigate to="/" replace /> }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
