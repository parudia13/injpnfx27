import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/useFirebaseAuth';
import { LanguageProvider } from '@/hooks/useLanguage';
import Index from '@/pages/Index';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Auth from '@/pages/Auth';
import Orders from '@/pages/Orders';
import HowToBuy from '@/pages/HowToBuy';
import NotFound from '@/pages/NotFound';

// Admin pages
import Admin from '@/pages/Admin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import EnhancedAdminDashboard from '@/pages/admin/EnhancedAdminDashboard';
import ProductsList from '@/pages/admin/ProductsList';
import AddProduct from '@/pages/admin/AddProduct';
import EditProduct from '@/pages/admin/EditProduct';
import OrdersHistory from '@/pages/admin/OrdersHistory';
import OrderConfirmation from '@/pages/admin/OrderConfirmation';
import UserManagement from '@/pages/admin/UserManagement';
import AdminLogs from '@/pages/admin/AdminLogs';
import ImportExport from '@/pages/admin/ImportExport';
import RecycleBin from '@/pages/admin/RecycleBin';
import ShippingRates from '@/pages/admin/ShippingRates';

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/how-to-buy" element={<HowToBuy />} />
              
              {/* Admin routes */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/enhanced" element={<EnhancedAdminDashboard />} />
              <Route path="/admin/products" element={<ProductsList />} />
              <Route path="/admin/add-product" element={<AddProduct />} />
              <Route path="/admin/edit-product/:id" element={<EditProduct />} />
              <Route path="/admin/products/edit/:id" element={<EditProduct />} />
              <Route path="/admin/orders-history" element={<OrdersHistory />} />
              <Route path="/admin/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/logs" element={<AdminLogs />} />
              <Route path="/admin/import-export" element={<ImportExport />} />
              <Route path="/admin/recycle-bin" element={<RecycleBin />} />
              <Route path="/admin/shipping-rates" element={<ShippingRates />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;