import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import WorkCreatePage from './pages/WorkCreatePage';
import WorkEditPage from './pages/WorkEditPage';
import WorkDetailPage from './pages/WorkDetailPage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage from './pages/PostDetailPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/works/create" element={<WorkCreatePage />} />
        <Route path="/works/:id" element={<WorkDetailPage />} />
        <Route path="/works/:id/edit" element={<WorkEditPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
