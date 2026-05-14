import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/layout/ProtectedRoute'
import { ToastProvider } from '@/components/ui/toast-provider'

// Auth pages
import LoginPage          from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import UpdatePasswordPage from '@/pages/auth/UpdatePasswordPage'

// Dashboard shell (lazy for perf)
import { lazy, Suspense } from 'react'
import { Loader2 } from 'lucide-react'

const DashboardLayout   = lazy(() => import('@/components/layout/DashboardLayout'))
const DashboardHome     = lazy(() => import('@/pages/dashboard/DashboardHome'))
const PagesListPage     = lazy(() => import('@/pages/dashboard/PagesListPage'))
const PageEditorPage    = lazy(() => import('@/pages/dashboard/PageEditorPage'))
const MediaLibraryPage  = lazy(() => import('@/pages/dashboard/MediaLibraryPage'))
const SettingsPage      = lazy(() => import('@/pages/dashboard/SettingsPage'))
const UsersPage         = lazy(() => import('@/pages/dashboard/UsersPage'))

// Admin-only
const AdminClientsPage  = lazy(() => import('@/pages/admin/AdminClientsPage'))
const AdminClientDetail = lazy(() => import('@/pages/admin/AdminClientDetail'))

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Auth */}
        <Route path="/auth/login" element={
          <PublicOnlyRoute><LoginPage /></PublicOnlyRoute>
        } />
        <Route path="/auth/forgot-password" element={
          <PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>
        } />
        <Route path="/auth/update-password" element={
          <ProtectedRoute><UpdatePasswordPage /></ProtectedRoute>
        } />

        {/* Dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={
            <Suspense fallback={<PageLoader />}><DashboardHome /></Suspense>
          } />
          <Route path="pages" element={
            <Suspense fallback={<PageLoader />}><PagesListPage /></Suspense>
          } />
          <Route path="pages/:pageId" element={
            <Suspense fallback={<PageLoader />}><PageEditorPage /></Suspense>
          } />
          <Route path="media" element={
            <Suspense fallback={<PageLoader />}><MediaLibraryPage /></Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<PageLoader />}><SettingsPage /></Suspense>
          } />
          <Route path="users" element={
            <Suspense fallback={<PageLoader />}><UsersPage /></Suspense>
          } />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<PageLoader />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/clients" replace />} />
          <Route path="clients" element={
            <Suspense fallback={<PageLoader />}><AdminClientsPage /></Suspense>
          } />
          <Route path="clients/:clientId" element={
            <Suspense fallback={<PageLoader />}><AdminClientDetail /></Suspense>
          } />
        </Route>

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ToastProvider>
  )
}
