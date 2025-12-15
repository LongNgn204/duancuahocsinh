// src/App.jsx
// Chú thích: App layout v3.0 với Landing Page, modern components, lazy routes
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import Sidebar from './components/layout/Sidebar';
import FocusModeToggle from './components/layout/FocusModeToggle';
// MobileNav removed - now using Sidebar on mobile
// import MobileNav from './components/layout/MobileNav';
import PrivacyNotice from './components/modals/PrivacyNotice';
import OnboardingModal from './components/modals/OnboardingModal';
import UpdateToast from './components/ui/UpdateToast';
import { useFocusMode } from './hooks/useFocusMode';
import GlowOrbs from './components/ui/GlowOrbs';
import FloatingChatButton from './components/ui/FloatingChatButton';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthModal from './components/auth/AuthModal';
import TourGuide, { TourTriggerButton, useTourStatus } from './components/tour/TourGuide';
import { registerServiceWorker } from './utils/notifications';


// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const BreathingBubble = lazy(() => import('./components/breathing/BreathingBubble'));
const GratitudeJar = lazy(() => import('./components/gratitude/GratitudeJar'));
const BeeGame = lazy(() => import('./components/games/BeeGame'));
const BubblePop = lazy(() => import('./components/games/BubblePop'));
const ColorMatch = lazy(() => import('./components/games/ColorMatch'));
const DoodleCanvas = lazy(() => import('./components/games/DoodleCanvas'));
const ReflexGame = lazy(() => import('./components/games/ReflexGame'));
const SpacePilot = lazy(() => import('./components/games/SpacePilot'));
const MatchShape = lazy(() => import('./pages/games/MatchShape'));
const BeeFlying = lazy(() => import('./components/games/BeeFlying'));
const Corner = lazy(() => import('./pages/Corner'));
const Games = lazy(() => import('./pages/Games'));
const Settings = lazy(() => import('./pages/Settings'));
const Wellness = lazy(() => import('./pages/Wellness'));
const Stories = lazy(() => import('./pages/Stories'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading fallback với animation
function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[--brand] to-[--brand-light] animate-pulse" />
        <div className="absolute inset-0 rounded-2xl bg-[--brand] animate-ping opacity-20" />
      </div>
      <p className="mt-4 text-[--muted] text-sm">Đang tải...</p>
    </div>
  );
}

// App Layout cho các trang trong app (có header, sidebar)
function AppLayout({ children }) {
  const { focusMode } = useFocusMode();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background orbs - subtle */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <GlowOrbs />
      </div>

      {/* Header */}
      {!focusMode && <AppHeader />}

      {/* Body */}
      <div className={`flex-1 relative z-10 ${focusMode ? 'grid place-items-center' : 'flex'}`}>
        {!focusMode && <Sidebar />}
        <main className="flex-1 p-3 pb-8 sm:p-4 md:p-6 md:pb-8 lg:p-8 md:ml-0" role="main">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Controls */}
      <FocusModeToggle />

      {/* Floating AI Chat Button */}
      {!focusMode && <FloatingChatButton />}

      {/* Tour Guide Help Button - Disabled */}
      {/* {!focusMode && <TourTriggerButton />} */}
    </div>
  );
}

// Router wrapper để check location
function AppRoutes() {
  const location = useLocation();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Đăng ký Service Worker khi app load
  useEffect(() => {
    registerServiceWorker().catch(err => {
      console.warn('[App] SW registration failed:', err);
    });
  }, []);

  // Check if on landing page
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  useEffect(() => {
    // Only show modals on app pages, not landing
    if (isLandingPage) return;

    try {
      const consent = localStorage.getItem('privacy_consent_v1');
      const seen = localStorage.getItem('onboarding_seen_v1');
      if (!consent) {
        setPrivacyOpen(true);
      } else if (!seen) {
        setOnboardingOpen(true);
      }
    } catch (_) { }
  }, [isLandingPage]);

  const acceptPrivacy = () => {
    try { localStorage.setItem('privacy_consent_v1', '1'); } catch (_) { }
    setPrivacyOpen(false);
    try {
      const seen = localStorage.getItem('onboarding_seen_v1');
      if (!seen) setOnboardingOpen(true);
    } catch (_) { }
  };

  const closeOnboarding = () => {
    try { localStorage.setItem('onboarding_seen_v1', '1'); } catch (_) { }
    setOnboardingOpen(false);
  };

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Landing Page - Standalone without app layout */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />


          {/* App Pages - With layout */}
          <Route path="/app" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/chat" element={<AppLayout><Chat /></AppLayout>} />
          <Route path="/breathing" element={<AppLayout><BreathingBubble /></AppLayout>} />
          <Route path="/gratitude" element={<AppLayout><GratitudeJar /></AppLayout>} />
          <Route path="/games" element={<AppLayout><Games /></AppLayout>} />
          <Route path="/games/reflex" element={<AppLayout><ReflexGame /></AppLayout>} />
          <Route path="/games/bee" element={<AppLayout><BeeGame /></AppLayout>} />
          <Route path="/games/bubble" element={<AppLayout><BubblePop /></AppLayout>} />
          <Route path="/games/memory" element={<AppLayout><ColorMatch /></AppLayout>} />
          <Route path="/games/doodle" element={<AppLayout><DoodleCanvas /></AppLayout>} />
          <Route path="/games/space-pilot" element={<AppLayout><SpacePilot /></AppLayout>} />
          <Route path="/games/match-shape" element={<AppLayout><MatchShape /></AppLayout>} />
          <Route path="/games/bee-flying" element={<AppLayout><BeeFlying /></AppLayout>} />
          <Route path="/corner" element={<AppLayout><Corner /></AppLayout>} />
          <Route path="/wellness" element={<AppLayout><Wellness /></AppLayout>} />
          <Route path="/stories" element={<AppLayout><Stories /></AppLayout>} />
          <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />


          {/* Admin Dashboard - Standalone layout */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback - Redirect unknown paths to landing */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>

      {/* First-run modals - Only show in app */}
      {!isLandingPage && (
        <>
          <PrivacyNotice open={privacyOpen} onAccept={acceptPrivacy} />
          <OnboardingModal open={onboardingOpen} onClose={closeOnboarding} />
        </>
      )}
    </>
  );
}

// AuthModal wrapper to access context
function AuthModalWrapper() {
  const { showAuthModal, closeAuthModal, login } = useAuth();
  return (
    <AuthModal
      isOpen={showAuthModal}
      onClose={closeAuthModal}
      onSuccess={login}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <UpdateToast />
        <AuthModalWrapper />
      </Router>
    </AuthProvider>
  );
}

