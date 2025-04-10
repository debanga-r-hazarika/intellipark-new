import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NavbarProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message || 'Error logging out');
        console.error('Logout error:', error);
        return;
      }
      
      setIsLoggedIn(false);
      toast.success("Successfully logged out!");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('An unexpected error occurred');
    }
  };
  
  const handleProfileClick = () => {
    if (!isLoggedIn) {
      toast.error("You need to log in first!");
      return false;
    }
    return true;
  };
  
  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'nav-glassmorphism py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary flex items-center">
            <span className="mr-2">🅿️</span>
            IntelliPark
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            )}
          </button>
          
          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`link-hover ${location.pathname === '/' ? 'link-active' : ''}`}
            >
              Home
            </Link>
            
            {isLoggedIn && (
              <Link 
                to="/profile" 
                className={`link-hover ${location.pathname === '/profile' ? 'link-active' : ''}`}
              >
                My Profile
              </Link>
            )}
            
            {!isLoggedIn && (
              <Dialog>
                <DialogTrigger asChild>
                  <button 
                    className={`link-hover ${location.pathname === '/profile' ? 'link-active' : ''}`}
                    onClick={(e) => {
                      if (!handleProfileClick()) {
                        e.preventDefault();
                      }
                    }}
                  >
                    My Profile
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Authentication Required</DialogTitle>
                    <DialogDescription>
                      You need to log in to access your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/login'}
                    >
                      Login
                    </Button>
                    <Button 
                      onClick={() => window.location.href = '/register'}
                    >
                      Register
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <Link 
              to="/reserve" 
              className={`link-hover ${location.pathname === '/reserve' ? 'link-active' : ''}`}
            >
              Reserve Parking
            </Link>
            
            <Link 
              to="/contact" 
              className={`link-hover ${location.pathname === '/contact' ? 'link-active' : ''}`}
            >
              Contact Us
            </Link>
            
            {isLoggedIn ? (
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="hover-lift"
              >
                Logout
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/login'}
                  className="hover-lift"
                >
                  Login
                </Button>
                <Button 
                  onClick={() => window.location.href = '/register'}
                  className="hover-lift btn-hover-glow"
                >
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 animate-slide-in">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className={`link-hover ${location.pathname === '/' ? 'link-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {isLoggedIn && (
                <Link 
                  to="/profile" 
                  className={`link-hover ${location.pathname === '/profile' ? 'link-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
              )}
              
              {!isLoggedIn && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      className={`link-hover text-left ${location.pathname === '/profile' ? 'link-active' : ''}`}
                      onClick={(e) => {
                        if (!handleProfileClick()) {
                          e.preventDefault();
                        }
                      }}
                    >
                      My Profile
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Authentication Required</DialogTitle>
                      <DialogDescription>
                        You need to log in to access your profile.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => window.location.href = '/login'}
                      >
                        Login
                      </Button>
                      <Button 
                        onClick={() => window.location.href = '/register'}
                      >
                        Register
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              <Link 
                to="/reserve" 
                className={`link-hover ${location.pathname === '/reserve' ? 'link-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Reserve Parking
              </Link>
              
              <Link 
                to="/contact" 
                className={`link-hover ${location.pathname === '/contact' ? 'link-active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
              
              {isLoggedIn ? (
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      window.location.href = '/login';
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      window.location.href = '/register';
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
