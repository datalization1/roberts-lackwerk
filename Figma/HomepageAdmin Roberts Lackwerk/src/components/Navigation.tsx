import { Wrench, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

type Page = 'home' | 'damage-report' | 'truck-rental' | 'about';

interface NavigationProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavigate('home')}>
            <Wrench className="h-8 w-8 text-primary shrink-0" />
            <span className="text-lg sm:text-xl text-foreground whitespace-nowrap">AutoRepair Pro</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            <button
              onClick={() => handleNavigate('home')}
              className={`transition-colors whitespace-nowrap ${
                currentPage === 'home' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Startseite
            </button>
            <button
              onClick={() => handleNavigate('damage-report')}
              className={`transition-colors whitespace-nowrap ${
                currentPage === 'damage-report' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Schadenmeldung
            </button>
            <button
              onClick={() => handleNavigate('truck-rental')}
              className={`transition-colors whitespace-nowrap ${
                currentPage === 'truck-rental' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Vermietung
            </button>
            <button
              onClick={() => handleNavigate('about')}
              className={`transition-colors whitespace-nowrap ${
                currentPage === 'about' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Über uns
            </button>
            <Button onClick={() => handleNavigate('damage-report')} size="sm">
              Jetzt starten
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-foreground hover:bg-accent rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menü öffnen"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleNavigate('home')}
                className={`text-left px-4 py-2 rounded-md transition-colors ${
                  currentPage === 'home' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Startseite
              </button>
              <button
                onClick={() => handleNavigate('damage-report')}
                className={`text-left px-4 py-2 rounded-md transition-colors ${
                  currentPage === 'damage-report' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Schadenmeldung
              </button>
              <button
                onClick={() => handleNavigate('truck-rental')}
                className={`text-left px-4 py-2 rounded-md transition-colors ${
                  currentPage === 'truck-rental' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Vermietung
              </button>
              <button
                onClick={() => handleNavigate('about')}
                className={`text-left px-4 py-2 rounded-md transition-colors ${
                  currentPage === 'about' 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                Über uns
              </button>
              <div className="px-4 pt-2">
                <Button 
                  onClick={() => handleNavigate('damage-report')} 
                  className="w-full"
                >
                  Jetzt starten
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}