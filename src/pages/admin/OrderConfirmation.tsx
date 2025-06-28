import React, { useState } from 'react';
import { usePendingOrders } from '@/hooks/usePendingOrders';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderConfirmation from '@/components/admin/OrderConfirmation';
import InvoiceModal from '@/components/InvoiceModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useQueryClient } from '@tanstack/react-query';

const OrderConfirmationPage = () => {
  const { data: pendingOrders = [], isLoading, error } = usePendingOrders();
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  const handleShowInvoice = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  // Add manual refresh function instead of relying on automatic refetching
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <ErrorState 
            title="Error Loading Pending Orders"
            message="Terjadi kesalahan saat memuat data pesanan pending. Silakan coba lagi."
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['pending-orders'] })}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Konfirmasi Pesanan</h1>
              <p className="text-gray-600 mt-2">
                Kelola pesanan yang menunggu konfirmasi admin
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              <Badge variant="secondary" className="text-sm">
                <Clock className="w-4 h-4 mr-1" />
                {pendingOrders.length} Pending
              </Badge>
            </div>
          </div>
        </div>

        {pendingOrders.length === 0 ? (
          <EmptyState 
            title="Tidak Ada Pesanan Pending"
            message="Semua pesanan telah dikonfirmasi atau tidak ada pesanan baru."
            icon={<Clock className="w-16 h-16 text-gray-400 mx-auto" />}
          />
        ) : (
          <div className="space-y-6">
            {pendingOrders.some(order => order.referralTransaction) && (
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Perhatian Referral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-700 text-sm">
                    Beberapa pesanan menggunakan kode referral. Pastikan untuk mengkonfirmasi 
                    pesanan agar komisi referral dapat diberikan ke user yang bersangkutan.
                  </p>
                </CardContent>
              </Card>
            )}

            {pendingOrders.map((order) => (
              <div key={order.id} className="space-y-4">
                <OrderConfirmation order={order} />
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleShowInvoice(order)}
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Invoice
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && selectedOrder && (
          <InvoiceModal
            isOpen={showInvoice}
            onClose={() => {
              setShowInvoice(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default OrderConfirmationPage;