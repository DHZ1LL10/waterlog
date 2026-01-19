import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import SidebarNav from './components/layout/SidebarNav';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Checkin from './pages/Checkin';
import Checkout from './pages/Checkout';
import Reports from './pages/Reports';
import Login from './pages/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function AppLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNav />
      <div className="flex-1 ml-64">
        <TopBar />
        <main className="mt-16 overflow-auto h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated && window.location.pathname !== '/login') {
    return <Navigate to="/login" />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <AppLayout>
                <Dashboard />
              </AppLayout>
            }
          />
          <Route
            path="/analytics"
            element={
              <AppLayout>
                <Analytics />
              </AppLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <AppLayout>
                <Reports />
              </AppLayout>
            }
          />
          <Route
            path="/checkin"
            element={
              <AppLayout>
                <Checkin />
              </AppLayout>
            }
          />
          <Route
            path="/checkout"
            element={
              <AppLayout>
                <Checkout />
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
