import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useLanguage } from '@/hooks/useLanguage';
import UserMenu from '@/components/UserMenu';
import CartIcon from '@/components/CartIcon';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  shouldAnimateCart?: boolean;
}

const Header = ({ shouldAnimateCart = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  // Enhanced navigation with better scroll handling
  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    
    // Force immediate scroll to top before navigation
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Use a small delay to ensure scroll happens before navigation
    setTimeout(() => {
      navigate(path);
      // Ensure scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 50);
    }, 10);
  };

  const navItems = [
    { path: '/', label: t('nav.home') },
    { path: '/products', label: t('nav.products') },
    { path: '/how-to-buy', label: t('nav.howToBuy') },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('/')} 
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img 
                src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
                alt="Injapan Food Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">Injapan Food</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`font-medium transition-colors duration-200 cursor-pointer ${
                  isActive(item.path)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>

          {/* Right side - Language, Cart, Auth, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Cart */}
            <div
              onClick={() => handleNavClick('/cart')}
              className="relative p-2 text-gray-700 hover:text-primary transition-colors duration-200 cursor-pointer flex items-center space-x-1"
              aria-label="Keranjang Saya"
            >
              <CartIcon onAnimationTrigger={shouldAnimateCart} />
              <span className="hidden sm:inline text-sm font-medium">Keranjang Saya</span>
            </div>

            {/* Auth */}
            {user ? (
              <UserMenu />
            ) : (
              <div onClick={() => handleNavClick('/auth')}>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('nav.login')}</span>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-primary transition-colors duration-200"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className={`bg-current block transition-all duration-300 h-0.5 w-6 transform ${
                  isMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-0.5'
                }`} />
                <span className={`bg-current block transition-all duration-300 h-0.5 w-6 my-0.5 ${
                  isMenuOpen ? 'opacity-0' : 'opacity-100'
                }`} />
                <span className={`bg-current block transition-all duration-300 h-0.5 w-6 transform ${
                  isMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0.5'
                }`} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`font-medium transition-colors duration-200 text-left cursor-pointer ${
                    isActive(item.path)
                      ? 'text-primary'
                      : 'text-gray-700 hover:text-primary'
                  }`}
                >
                  {item.label}
                </div>
              ))}
              <div
                onClick={() => handleNavClick('/cart')}
                className="text-gray-700 hover:text-primary font-medium text-left cursor-pointer"
              >
                Keranjang Saya
              </div>
              {!user && (
                <div
                  onClick={() => handleNavClick('/auth')}
                  className="text-gray-700 hover:text-primary font-medium text-left cursor-pointer"
                >
                  {t('nav.login')} / {t('nav.register')}
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;