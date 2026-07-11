// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import RegisterRunner from './pages/RegisterRunner';

import UserDashboard from './pages/user/Dashboard';
import PlaceOrder from './pages/user/PlaceOrder';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Shops from './pages/user/Shops';
import UserProfile from './pages/user/Profile';

import RunnerDashboard from './pages/runner/Dashboard';
import Feed from './pages/runner/Feed';
import ActiveOrder from './pages/runner/ActiveOrder';
import Earnings from './pages/runner/Earnings';
import RunnerProfile from './pages/runner/Profile';

import AdminDashboard from './pages/admin/Dashboard';
import AdminRunners from './pages/admin/Runners';
import AdminUsers from './pages/admin/Users';
import AdminOrders from './pages/admin/Orders';
import AdminShops from './pages/admin/Shops';
import AdminFees from './pages/admin/Fees';
import AdminCommission from './pages/admin/Commission';
import AdminSettlements from './pages/admin/Settlements';
import AdminFeedback from './pages/admin/Feedback';
import InstallPrompt from './components/InstallPrompt';
import AdminAnnouncements from './pages/admin/Announcements';
import SoundListener from './components/SoundListener';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'var(--runit-text)', padding: 40 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) {
    if (user.role === 'user') return <Navigate to="/dashboard" replace />;
    if (user.role === 'runner') return <Navigate to="/runner" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/user" element={<RegisterUser />} />
          <Route path="/register/runner" element={<RegisterRunner />} />

          <Route path="/dashboard" element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/place-order" element={<ProtectedRoute allowedRole="user"><PlaceOrder /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute allowedRole="user"><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute allowedRole="user"><OrderDetail /></ProtectedRoute>} />
          <Route path="/shops" element={<ProtectedRoute allowedRole="user"><Shops /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute>} />

          <Route path="/runner" element={<ProtectedRoute allowedRole="runner"><RunnerDashboard /></ProtectedRoute>} />
          <Route path="/runner/feed" element={<ProtectedRoute allowedRole="runner"><Feed /></ProtectedRoute>} />
          <Route path="/runner/active" element={<ProtectedRoute allowedRole="runner"><ActiveOrder /></ProtectedRoute>} />
          <Route path="/runner/earnings" element={<ProtectedRoute allowedRole="runner"><Earnings /></ProtectedRoute>} />
          <Route path="/runner/profile" element={<ProtectedRoute allowedRole="runner"><RunnerProfile /></ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/runners" element={<ProtectedRoute allowedRole="admin"><AdminRunners /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRole="admin"><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/shops" element={<ProtectedRoute allowedRole="admin"><AdminShops /></ProtectedRoute>} />
          <Route path="/admin/fees" element={<ProtectedRoute allowedRole="admin"><AdminFees /></ProtectedRoute>} />
          <Route path="/admin/commission" element={<ProtectedRoute allowedRole="admin"><AdminCommission /></ProtectedRoute>} />
          <Route path="/admin/settlements" element={<ProtectedRoute allowedRole="admin"><AdminSettlements /></ProtectedRoute>} />
          <Route path="/admin/feedback" element={<ProtectedRoute allowedRole="admin"><AdminFeedback /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute allowedRole="admin"><AdminAnnouncements /></ProtectedRoute>} />
        </Routes>
        <SoundListener />
        <InstallPrompt />
      </div>
    </BrowserRouter>
  );
}