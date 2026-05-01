import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './shared/services/authService';
import Register from './features/auth/Register';
import Login from './features/auth/Login';
import Dashboard from './features/user/Dashboard';
import Exercises from './features/exercise/Exercises';
import CreateWorkout from './features/workout/CreateWorkout';
import WorkoutHistory from './features/workout/WorkoutHistory';
import GoalsPage from './features/goal/GoalsPage';
import ProfilePage from './features/user/ProfilePage';
import AdminDashboard from './features/admin/AdminDashboard';
import OAuth2Callback from './features/auth/OAuth2Callback';
import { WorkoutProvider } from './shared/context/WorkoutContext';
import UserLayout from './shared/layouts/UserLayout';
import AdminLayout from './shared/layouts/AdminLayout';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role;
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  } catch {
    return false;
  }
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return isAdmin() ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <WorkoutProvider>
      <Router>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />
          <Route
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/exercises" element={<Exercises />} />
            <Route path="/create-workout" element={<CreateWorkout />} />
            <Route path="/workout-history" element={<WorkoutHistory />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </WorkoutProvider>
  );
}

export default App;
