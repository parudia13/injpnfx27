import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Search, Eye, CheckCircle, XCircle, Clock, Package, FileText, CreditCard } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import InvoiceModal from '@/components/InvoiceModal';
import { Order } from '@/types';
import { updateOrderStatus } from '@/services/orderService';
import { useQueryClient } from '@tanstack/react-query';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import { useOrders } from '@/hooks/useOrders';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const PaymentVerification = () => {
  const { data: orders = [], isLoading, error } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Filter orders by payment status and search term
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_info?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_info?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by payment status
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'pending' && order.payment_status === 'pending') ||
      (statusFilter === 'verified' && order.payment_status === 'verified') ||
      (statusFilter === 'rejected' && order.payment_status === 'rejected');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Menunggu Verifikasi' },
      verified: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Pembayaran Terverifikasi' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Pembayaran Ditolak' },
    };

    const { color, icon: Icon, label } = config[status as keyof typeof config] || config.pending;

    return (
      <Badge className={`${color} flex items-center space-x-1`}>
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </Badge>
    );
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'confirmed', 'verified');
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Pembayaran Terverifikasi",
        description: "Status pembayaran berhasil diubah menjadi terverifikasi",
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Gagal memverifikasi pembayaran",
        variant: "destructive",
      });
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'cancelled', 'rejected');
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Pembayaran Ditolak",
        description: "Status pembayaran berhasil diubah menjadi ditolak",
      });
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Gagal menolak pembayaran",
        variant: "destructive",
      });
    }
  };

  const handleShowInvoice = (order: Order) => {
    setInvoiceOrder(order);
    setShowInvoice(true);
  };

  const handleShowPaymentProof = (imageUrl: string) => {
    setSelectedPaymentProof(imageUrl);
    setShowPaymentProof(true);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
          <p className="text-gray-600">Verifikasi bukti pembayaran dari pelanggan</p>
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
              <SelectItem value="pending">Menunggu Verifikasi</SelectItem>
              <SelectItem value="verified">Terverifikasi</SelectItem>
              <SelectItem value="rejected">Ditolak</SelectItem>
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
                : 'Belum ada pesanan yang perlu diverifikasi'
              }
              icon={<CreditCard className="w-16 h-16 text-gray-400 mx-auto" />}
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
                      {order.payment_status && getStatusBadge(order.payment_status)}
                      <p className="text-lg font-bold mt-2">
                        {formatPrice(order.total_price)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Payment Info */}
                    <div>
                      <h4 className="font-medium mb-2">Informasi Pembayaran:</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm"><strong>Metode:</strong> {order.customer_info?.payment_method || 'Tidak ada informasi'}</p>
                        {order.payment_proof_url ? (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran:</p>
                            <div className="flex items-center space-x-2">
                              <img 
                                src={order.payment_proof_url} 
                                alt="Bukti Pembayaran" 
                                className="w-16 h-16 object-cover rounded-md cursor-pointer border border-gray-200"
                                onClick={() => handleShowPaymentProof(order.payment_proof_url || '')}
                              />
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleShowPaymentProof(order.payment_proof_url || '')}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Lihat Bukti
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-600 mt-2">Belum ada bukti pembayaran</p>
                        )}
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div>
                      <h4 className="font-medium mb-2">Ringkasan Pesanan:</h4>
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

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      {order.payment_status === 'pending' && (
                        <>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                size="sm"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verifikasi
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Verifikasi</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin memverifikasi pembayaran ini? Status pesanan akan berubah menjadi "Dikonfirmasi".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleVerifyPayment(order.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Verifikasi
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Tolak
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Penolakan</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menolak pembayaran ini? Status pesanan akan berubah menjadi "Dibatalkan".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRejectPayment(order.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Tolak Pembayaran
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                      
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

        {/* Payment Proof Modal */}
        {showPaymentProof && selectedPaymentProof && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl max-h-[90vh]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPaymentProof(false)}
                className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
              >
                ✕ Close
              </Button>
              <img 
                src={selectedPaymentProof} 
                alt="Bukti Pembayaran" 
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentVerification;