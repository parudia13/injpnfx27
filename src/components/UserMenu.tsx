import { LogOut, User, ShoppingBag, Settings, Percent } from 'lucide-react';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // For Firebase, you can check admin status based on custom claims or a separate admin list
    // For now, we'll set a simple check - you can modify this based on your needs
    const checkAdminStatus = () => {
      if (user) {
        // You can implement custom claims or check against a list of admin emails
        // For demo purposes, let's check if email contains 'admin'
        const adminEmails = ['admin@gmail.com', 'ari4rich@gmail.com'];
        setIsAdmin(adminEmails.includes(user.email || ''));
      }
    };

    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleReferralClick = () => {
    navigate('/referral');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-2 cursor-pointer">
          <User className="w-4 h-4" />
          <span className="hidden md:inline">{user.email}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.displayName || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleOrdersClick}>
          <ShoppingBag className="mr-2 h-4 w-4" />
          <span>Riwayat Pesanan</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleReferralClick}>
          <Percent className="mr-2 h-4 w-4" />
          <span>Affiliate</span>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAdminClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Admin Panel</span>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Keluar</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;