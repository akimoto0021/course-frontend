import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext'

import Navbar       from './components/Navbar'
import StorePage    from './pages/StorePage'
import LoginPage    from './pages/LoginPage'
import AuthCallback from './pages/AuthCallback'
import PaymentPage  from './pages/PaymentPage'
import PlayerPage   from './pages/PlayerPage'
import MyCoursesPage from './pages/MyCoursesPage'
import AdminLayout  from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import AdminOrders  from './pages/admin/AdminOrders'
import AdminUsers   from './pages/admin/AdminUsers'
import AdminBundleOrders  from './pages/admin/AdminBundleOrders'
import AffiliatePage from './pages/AffiliatePage'

// Route guard
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',justifyContent:'center',padding:'80px' }}><div className="spinner" /></div>
  if (!user)   return <Navigate to="/login" replace />
  if (role === 'admin'     && user.role !== 'admin')     return <Navigate to="/" replace />
  if (role === 'affiliate' && !['admin','affiliate'].includes(user.role)) return <Navigate to="/" replace />
  return children
}

const AppRoutes = () => {
  const { isAdmin } = useAuth()
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<StorePage />} />
        <Route path="/login"         element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/payment/:courseId" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
        <Route path="/player/:courseId"  element={<PrivateRoute><PlayerPage /></PrivateRoute>} />
        <Route path="/my-courses"        element={<PrivateRoute><MyCoursesPage /></PrivateRoute>} />
        <Route path="/affiliate"         element={<PrivateRoute role="affiliate"><AffiliatePage /></PrivateRoute>} />

        <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
          <Route index           element={<AdminDashboard />} />
          <Route path="courses"  element={<AdminCourses />} />
          <Route path="orders"   element={<AdminOrders />} />
          <Route path="users"    element={<AdminUsers />} />
	  <Route path="bundle-orders"  element={<AdminBundleOrders />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
