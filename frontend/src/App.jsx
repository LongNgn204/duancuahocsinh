// src/App.jsx
// Chú thích: App layout với AppHeader, Breadcrumbs, Sidebar, Focus Mode, lazy routes và Suspense fallback
import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppHeader from './components/layout/AppHeader';
import Breadcrumbs from './components/layout/Breadcrumbs';
import Sidebar from './components/layout/Sidebar';
import FocusModeToggle from './components/layout/FocusModeToggle';
import MobileNav from './components/layout/MobileNav';
import ThemeToggle from './components/layout/ThemeToggle';
import PrivacyNotice from './components/modals/PrivacyNotice';
import OnboardingModal from './components/modals/OnboardingModal';
import { useFocusMode } from './hooks/useFocusMode';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Chat = lazy(() => import('./pages/Chat'));
const BreathingBubble = lazy(() => import('./components/breathing/BreathingBubble'));
const GratitudeJar = lazy(() => import('./components/gratitude/GratitudeJar'));
const BeeGame = lazy(() => import('./components/games/BeeGame'));
const Settings = lazy(() => import('./pages/Settings'));

function Fallback() {
  return (
    <div className="py-12 text-[--muted]">Đang tải…</div>
  );
}

export default function App() {
  const { focusMode } = useFocusMode();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('privacy_consent_v1');
      const seen = localStorage.getItem('onboarding_seen_v1');
      if (!consent) {
        setPrivacyOpen(true);
      } else if (!seen) {
        setOnboardingOpen(true);
      }
    } catch (_) {}
  }, []);

  const acceptPrivacy = () => {
    try { localStorage.setItem('privacy_consent_v1', '1'); } catch (_) {}
    setPrivacyOpen(false);
    try {
      const seen = localStorage.getItem('onboarding_seen_v1');
      if (!seen) setOnboardingOpen(true);
    } catch (_) {}
  };

  const closeOnboarding = () => {
    try { localStorage.setItem('onboarding_seen_v1', '1'); } catch (_) {}
    setOnboardingOpen(false);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        {!focusMode && <AppHeader />}
        {!focusMode && <Breadcrumbs />}

        {/* Body */}
        <div className={`flex-1 ${focusMode ? 'grid place-items-center' : 'flex'}`}>
          {!focusMode && <Sidebar />}
          <main className="flex-1 p-6 pb-20 md:p-8 md:pb-8" role="main">
            <div className="max-w-6xl mx-auto">
              <Suspense fallback={<Fallback />}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/breathing" element={<BreathingBubble />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/gratitude" element={<GratitudeJar />} />
                  <Route path="/games" element={<BeeGame />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Suspense>
            </div>
          </main>
      </div>

        {!focusMode && <MobileNav />}
        {/* Theme & Focus toggles */}
        <ThemeToggle />
        <FocusModeToggle />

        {/* First-run modals */}
        <PrivacyNotice open={privacyOpen} onAccept={acceptPrivacy} />
        <OnboardingModal open={onboardingOpen} onClose={closeOnboarding} />
      </div>
    </Router>
  );
}
