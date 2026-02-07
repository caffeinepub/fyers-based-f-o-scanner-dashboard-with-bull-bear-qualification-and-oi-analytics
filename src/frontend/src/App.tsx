import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import RequireAuth from './components/auth/RequireAuth';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

type Page = 'dashboard' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RequireAuth>
        <ProfileSetupModal />
        <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'settings' && <Settings />}
        </AppShell>
        <Toaster />
      </RequireAuth>
    </ThemeProvider>
  );
}
