import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, XCircle, Clock, Package, FileText, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import InvoiceModal from '@/components/InvoiceModal';
import { Order } from '@/types';
import { updateOrderStatus } from '@/services/orderService';
import { useQueryClient } from '@tanstack/react-query';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';

const OrdersHistory = () => {
  const { data: orders = [], isLoading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();

  // Add manual refresh function instead of relying on automatic refetching
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_info?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Confirmed' },
      processing: { color: 'bg-purple-100 text-purple-800', icon: Package, label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
    };

    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge className={`${color} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </Badge>
    );
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Status Updated",
        description: `Order status berhasil diubah ke ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Gagal mengubah status order",
        variant: "destructive",
      });
    }
  };

  const handleShowInvoice = (order: Order) => {
    setInvoiceOrder(order);
    setShowInvoice(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <ErrorState 
            title="Error Loading Orders"
            message="Terjadi kesalahan saat memuat data pesanan. Silakan coba lagi."
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Pesanan</h1>
            <p className="text-gray-600">Kelola dan monitor semua pesanan dengan invoice otomatis</p>
          </div>
          
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari berdasarkan nama, email, atau ID pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <EmptyState 
              title="Tidak ada pesanan ditemukan"
              message={searchTerm || statusFilter !== 'all' 
                ? 'Coba ubah filter pencarian atau status'
                : 'Belum ada pesanan yang masuk'
              }
              icon={<Package className="w-16 h-16 text-gray-400 mx-auto" />}
            />
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(-8)}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {order.customer_info?.name} • {order.customer_info?.email}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-lg font-bold mt-2">
                        {formatPrice(order.total_price)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items ({order.items?.length || 0}):</h4>
                      <div className="space-y-2">
                        {order.items?.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        {(order.items?.length || 0) > 3 && (
                          <p className="text-sm text-gray-500">
                            dan {(order.items?.length || 0) - 3} item lainnya...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium mb-2">Alamat Pengiriman:</h4>
                      <p className="text-sm text-gray-600">
                        {order.customer_info?.address}, {order.customer_info?.prefecture} {order.customer_info?.postal_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        Phone: {order.customer_info?.phone}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Select
                        value={order.status}
                        onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShowInvoice(order)}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Detail Order #{selectedOrder.id.slice(-8)}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Customer Information:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>Name:</strong> {selectedOrder.customer_info?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_info?.email}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customer_info?.phone}</p>
                    <p><strong>Address:</strong> {selectedOrder.customer_info?.address}</p>
                    <p><strong>Prefecture:</strong> {selectedOrder.customer_info?.prefecture}</p>
                    <p><strong>Postal Code:</strong> {selectedOrder.customer_info?.postal_code}</p>
                    {selectedOrder.customer_info?.notes && (
                      <p><strong>Notes:</strong> {selectedOrder.customer_info.notes}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Order Items:</h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatPrice(selectedOrder.total_price)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleShowInvoice(selectedOrder)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Lihat Invoice
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoice && invoiceOrder && (
          <InvoiceModal
            isOpen={showInvoice}
            onClose={() => {
              setShowInvoice(false);
              setInvoiceOrder(null);
            }}
            order={invoiceOrder}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default OrdersHistory;