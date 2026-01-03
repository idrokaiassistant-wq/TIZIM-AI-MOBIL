import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/dashboard/Dashboard';
import { TasksHome } from './components/tasks/TasksHome';
import { TodayFocus } from './components/today/TodayFocus';
import { HabitsHome } from './components/habits/HabitsHome';
import { FinanceHome } from './components/finance/FinanceHome';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ProductivityHome } from './components/productivity/ProductivityHome';
import { TabBar } from './components/navigation/TabBar';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/shared/ErrorToast';
import { NotificationManager } from './components/shared/NotificationManager';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { errorHandler } from './lib/utils/errorHandler';
import { useAuthStore } from './lib/store';
import { Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import './styles/globals.css';

function NotFoundRedirect() {
  return <Navigate to="/dashboard" replace />;
}

const MobileWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  
  // Hide TabBar on login/register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const content = (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {children}
      </div>
      {!isAuthPage && <TabBar />}
    </>
  );

  if (!isDesktop) return (
    <div className="h-screen bg-ios-bg flex flex-col overflow-hidden">
      {content}
    </div>
  );

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${isMobilePreview ? 'bg-slate-900 items-center justify-center p-8' : 'bg-ios-bg'}`}>
      <button
        onClick={() => setIsMobilePreview(!isMobilePreview)}
        className="fixed top-6 right-6 z-[100] flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full font-bold shadow-ios-lg hover:scale-105 active:scale-95 ios-transition"
      >
        {isMobilePreview ? <><Monitor size={18} /> Desktop View</> : <><Smartphone size={18} /> Mobile Preview</>}
      </button>

      {isMobilePreview ? (
        <div className="relative w-[393px] h-[852px] bg-black rounded-[55px] shadow-2xl border-[8px] border-slate-800 overflow-hidden ring-4 ring-slate-700/20 flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50 flex justify-center items-center">
            <div className="w-12 h-1 bg-white/10 rounded-full"></div>
          </div>
          <div className="flex-1 bg-ios-bg pt-10 relative flex flex-col overflow-hidden">
            {content}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-50"></div>
        </div>
      ) : (
        <div className="w-full h-screen flex overflow-hidden">
          <aside className="w-72 bg-white border-r border-gray-100 flex flex-col p-6">
            <div className="flex items-center gap-3 mb-10 px-2 transition-transform hover:scale-105 ios-transition">
              <img src="/assets/icon.png" alt="Tizim Icon" className="w-10 h-10 rounded-xl shadow-ios border border-slate-100" />
              <span className="text-xl font-black text-slate-900 tracking-tight">Tizim AI</span>
            </div>
          </aside>
          <main className="flex-1 flex justify-center bg-gray-50/30 overflow-hidden">
            <div className="w-full max-w-md bg-white shadow-ios-lg border-x border-gray-50 relative flex flex-col overflow-hidden">
              {content}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        errorHandler.logError(error, {
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      <ToastProvider>
        <Router>
          <AppContent />
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  const location = useLocation();
  const { fetchUser } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchUser();
      } catch {
        // User not authenticated
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchUser is stable from zustand store

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-ios-bg flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/icon.png" alt="Logo" className="w-20 h-20 mx-auto mb-4 rounded-2xl shadow-ios animate-pulse" />
          <p className="text-slate-500 text-sm font-bold">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <MobileWrapper>
      <NotificationManager />
      <AnimatePresence initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageWrapper><Dashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <PageWrapper><TasksHome /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/today"
            element={
              <ProtectedRoute>
                <PageWrapper><TodayFocus /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <PageWrapper><HabitsHome /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <PageWrapper><FinanceHome /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/productivity"
            element={
              <ProtectedRoute>
                <PageWrapper><ProductivityHome /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <PageWrapper><AdminDashboard /></PageWrapper>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </AnimatePresence>
    </MobileWrapper>
  );
}

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="h-full w-full"
  >
    {children}
  </motion.div>
);
