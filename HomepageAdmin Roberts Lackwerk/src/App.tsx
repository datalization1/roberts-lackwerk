import { useState } from 'react';
import { Navigation } from './components/Navigation';
import { LandingPage } from './components/LandingPage';
import { DamageReportForm } from './components/DamageReportForm';
import { TruckBookingForm } from './components/TruckBookingForm';
import { AboutPage } from './components/AboutPage';
import { AdminLogin } from './components/AdminLogin';
import { AdminPage } from './components/AdminPage';
import { Footer } from './components/Footer';

type Page = 'home' | 'damage-report' | 'truck-rental' | 'about' | 'admin' | 'admin-login';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const handleAdminNavigate = () => {
    if (isAdminAuthenticated) {
      setCurrentPage('admin');
    } else {
      setCurrentPage('admin-login');
    }
  };

  const handleAdminLogin = (username: string, password: string) => {
    // In production, this would validate against a real backend
    setIsAdminAuthenticated(true);
    setCurrentPage('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setCurrentPage('home');
  };

  const handleNavigate = (page: Page) => {
    if (page === 'admin') {
      handleAdminNavigate();
    } else {
      setCurrentPage(page);
    }
  };

  const showNavAndFooter = currentPage !== 'admin' && currentPage !== 'admin-login';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNavAndFooter && <Navigation currentPage={currentPage} onNavigate={handleNavigate} />}
      
      <main className="flex-1">
        {currentPage === 'home' && <LandingPage onNavigate={handleNavigate} />}
        {currentPage === 'damage-report' && <DamageReportForm onBack={() => setCurrentPage('home')} />}
        {currentPage === 'truck-rental' && <TruckBookingForm onBack={() => setCurrentPage('home')} />}
        {currentPage === 'about' && <AboutPage onBack={() => setCurrentPage('home')} />}
        {currentPage === 'admin-login' && (
          <AdminLogin 
            onBack={() => setCurrentPage('home')} 
            onLogin={handleAdminLogin}
          />
        )}
        {currentPage === 'admin' && (
          <AdminPage 
            onBack={() => setCurrentPage('home')}
            onLogout={handleAdminLogout}
          />
        )}
      </main>

      {showNavAndFooter && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}