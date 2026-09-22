// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Onboarding, { useOnboarding } from './components/Onboarding';
import { AnimatePresence } from 'framer-motion';
import { hapticLight } from './services/NativePush';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import RegisterRunner from './pages/RegisterRunner';

import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import UserDashboard from './pages/user/Dashboard';
import PlaceOrder from './pages/user/PlaceOrder';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Shops from './pages/user/Shops';
import UserProfile from './pages/user/Profile';
import Receipt from './pages/user/Receipt';

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
import AdminAnnouncements from './pages/admin/Announcements';
import AdminStories from './pages/admin/Stories';
import AdminAds from './pages/admin/Ads';
import AdminPromos from './pages/admin/Promos';

import InstallPrompt from './components/InstallPrompt';
import SoundListener from './components/SoundListener';
import LaunchAd from './components/LaunchAd';
import OfflinePage from './components/OfflinePage';
import PushPrompt from './components/PushPrompt';

// ── ProtectedRoute lives outside App but inside the module ──
function ProtectedRoute({ children, allowedRole }) {
  var auth = useAuth();
  if (auth.loading) return (
    <div style={{ background: 'var(--runit-bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--runit-muted)', fontSize: 14 }}>
      Loading...
    </div>
  );
  if (!auth.user) return <Navigate to="/login" replace />;
  if (auth.user.role !== allowedRole) {
    if (auth.user.role === 'user')   return <Navigate to="/dashboard"  replace />;
    if (auth.user.role === 'runner') return <Navigate to="/runner"      replace />;
    if (auth.user.role === 'admin')  return <Navigate to="/admin"       replace />;
  }
  return children;
}

// ── App component ────────────────────────────────────────────────────────────
export default function App() {
  var [showOnboarding, setShowOnboarding] = useState(false);
  var shouldOnboard = useOnboarding();

  // Show onboarding once for logged-in users who haven't seen it
  useEffect(function() {
    var token = localStorage.getItem('runit_token');
    if (token && shouldOnboard) setShowOnboarding(true);
  }, [shouldOnboard]);

  // Global haptic feedback on every button/link tap — one listener for the whole app
  useEffect(function() {
    var handler = function(e) {
      var target = e.target.closest('button, a, [role="button"]');
      if (target) {
        hapticLight();
      }
    };
    document.addEventListener('pointerdown', handler, { passive: true });
    return function() { document.removeEventListener('pointerdown', handler); };
  }, []);

  return (
    <BrowserRouter>
      <div style={{ animation: 'fadeIn 0.2s ease' }}>

        <LaunchAd />
        <OfflinePage />
        <PushPrompt />

        <AnimatePresence>
          {showOnboarding && (
            <Onboarding onDone={function() { setShowOnboarding(false); }} />
          )}
        </AnimatePresence>

        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
          <Route path="/register/user"   element={<RegisterUser />} />
          <Route path="/register/runner" element={<RegisterRunner />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* User routes */}
          <Route path="/dashboard"           element={<ProtectedRoute allowedRole="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/place-order"         element={<ProtectedRoute allowedRole="user"><PlaceOrder /></ProtectedRoute>} />
          <Route path="/orders"              element={<ProtectedRoute allowedRole="user"><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id"          element={<ProtectedRoute allowedRole="user"><OrderDetail /></ProtectedRoute>} />
          <Route path="/orders/:id/receipt"  element={<ProtectedRoute allowedRole="user"><Receipt /></ProtectedRoute>} />
          <Route path="/shops"               element={<ProtectedRoute allowedRole="user"><Shops /></ProtectedRoute>} />
          <Route path="/profile"             element={<ProtectedRoute allowedRole="user"><UserProfile /></ProtectedRoute>} />

          {/* Runner routes */}
          <Route path="/runner"          element={<ProtectedRoute allowedRole="runner"><RunnerDashboard /></ProtectedRoute>} />
          <Route path="/runner/feed"     element={<ProtectedRoute allowedRole="runner"><Feed /></ProtectedRoute>} />
          <Route path="/runner/active"   element={<ProtectedRoute allowedRole="runner"><ActiveOrder /></ProtectedRoute>} />
          <Route path="/runner/earnings" element={<ProtectedRoute allowedRole="runner"><Earnings /></ProtectedRoute>} />
          <Route path="/runner/profile"  element={<ProtectedRoute allowedRole="runner"><RunnerProfile /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin"                  element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/runners"          element={<ProtectedRoute allowedRole="admin"><AdminRunners /></ProtectedRoute>} />
          <Route path="/admin/users"            element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/orders"           element={<ProtectedRoute allowedRole="admin"><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/shops"            element={<ProtectedRoute allowedRole="admin"><AdminShops /></ProtectedRoute>} />
          <Route path="/admin/fees"             element={<ProtectedRoute allowedRole="admin"><AdminFees /></ProtectedRoute>} />
          <Route path="/admin/commission"       element={<ProtectedRoute allowedRole="admin"><AdminCommission /></ProtectedRoute>} />
          <Route path="/admin/settlements"      element={<ProtectedRoute allowedRole="admin"><AdminSettlements /></ProtectedRoute>} />
          <Route path="/admin/feedback"         element={<ProtectedRoute allowedRole="admin"><AdminFeedback /></ProtectedRoute>} />
          <Route path="/admin/announcements"    element={<ProtectedRoute allowedRole="admin"><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/stories"          element={<ProtectedRoute allowedRole="admin"><AdminStories /></ProtectedRoute>} />
          <Route path="/admin/ads"              element={<ProtectedRoute allowedRole="admin"><AdminAds /></ProtectedRoute>} />
          <Route path="/admin/promos"           element={<ProtectedRoute allowedRole="admin"><AdminPromos /></ProtectedRoute>} />
        </Routes>

        <SoundListener />
        <InstallPrompt />

      </div>
    </BrowserRouter>
  );
}