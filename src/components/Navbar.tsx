import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const Navbar: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout');
    }
  };
  
  return (
    <nav className="bg-background border-b shadow-sm py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Parking App
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/home" className="text-gray-700 hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/reserve" className="text-gray-700 hover:text-primary transition-colors">
            Reserve
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary transition-colors">
            Contact
          </Link>
          <Link to="/admin" className="text-gray-700 hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
        
        <div className="space-x-2">
          {isLoggedIn ? (
            <>
              <Link to="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
