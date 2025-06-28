import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, CheckCircle, XCircle, AlertTriangle, Calendar, CreditCard, User, FileImage, Upload, RefreshCw, Info } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, getFirestore } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentProof {
  id: string;
  user_id?: string;
  nama: string;
  email: string;
  invoice_id: string;
  metode_pembayaran: string;
  bukti_url: string;
  uploaded_at: string;
  status: 'Menunggu' | 'Terverifikasi' | 'Ditolak';
  notes?: string;
}

const PaymentVerification = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [imageError, setImageError] = useState(false);
  const queryClient = useQueryClient();
  const firestore = getFirestore();

  // Fetch payment proofs from Firestore
  const { data: paymentProofs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['payment-proofs'],
    queryFn: async () => {
      try {
        const paymentProofsRef = collection(db, 'payment_proofs');
        let q = query(paymentProofsRef, orderBy('uploaded_at', 'desc'));
        
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PaymentProof[];
      } catch (error) {
        console.error('Error fetching payment proofs:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
  });

  // Filter payment proofs based on search term and status filter
  const filteredPaymentProofs = paymentProofs.filter(proof => {
    const matchesSearch = 
      proof.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || proof.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Handle verification
  const handleVerify = async (paymentId: string) => {
    try {
      const paymentRef = doc(firestore, 'payment_proofs', paymentId);
      await updateDoc(paymentRef, {
        status: 'Terverifikasi',
        verified_at: new Date().toISOString()
      });
      
      // Also update the corresponding order if needed
      const payment = paymentProofs.find(p => p.id === paymentId);
      if (payment && payment.invoice_id) {
        // Find order by invoice_id and update its payment status
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('id', '==', payment.invoice_id));
        const orderSnapshot = await getDocs(q);
        
        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(doc(firestore, 'orders', orderDoc.id), {
            'customer_info.payment_status': 'verified',
            updated_at: new Date().toISOString()
          });
        }
      }
      
      toast({
        title: "Pembayaran Terverifikasi",
        description: "Status pembayaran telah diperbarui menjadi terverifikasi",
      });
      
      // Close modal and refresh data
      setIsDetailModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['payment-proofs'] });
      refetch();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast({
        title: "Error",
        description: "Gagal memverifikasi pembayaran",
        variant: "destructive",
      });
    }
  };

  // Handle rejection
  const handleReject = async () => {
    if (!selectedPayment) return;
    
    try {
      const paymentRef = doc(firestore, 'payment_proofs', selectedPayment.id);
      await updateDoc(paymentRef, {
        status: 'Ditolak',
        notes: rejectionReason,
        rejected_at: new Date().toISOString()
      });
      
      // Also update the corresponding order if needed
      if (selectedPayment.invoice_id) {
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('id', '==', selectedPayment.invoice_id));
        const orderSnapshot = await getDocs(q);
        
        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0];
          await updateDoc(doc(firestore, 'orders', orderDoc.id), {
            'customer_info.payment_status': 'rejected',
            'customer_info.payment_notes': rejectionReason,
            updated_at: new Date().toISOString()
          });
        }
      }
      
      toast({
        title: "Pembayaran Ditolak",
        description: "Status pembayaran telah diperbarui menjadi ditolak",
      });
      
      // Close modals and refresh data
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['payment-proofs'] });
      refetch();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast({
        title: "Error",
        description: "Gagal menolak pembayaran",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Menunggu':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu</Badge>;
      case 'Terverifikasi':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Terverifikasi</Badge>;
      case 'Ditolak':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verifikasi Pembayaran</h1>
            <p className="text-gray-600">Kelola dan verifikasi bukti pembayaran dari pelanggan</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Pencarian</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nama, email, atau invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Menunggu">Menunggu</SelectItem>
                  <SelectItem value="Terverifikasi">Terverifikasi</SelectItem>
                  <SelectItem value="Ditolak">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Bukti Pembayaran ({filteredPaymentProofs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Memuat data pembayaran...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Terjadi Kesalahan</p>
                <p className="text-gray-600 mb-4">Gagal memuat data pembayaran</p>
                <Button onClick={() => refetch()}>Coba Lagi</Button>
              </div>
            ) : filteredPaymentProofs.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileImage className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {paymentProofs.length === 0 
                    ? 'Belum ada bukti pembayaran' 
                    : 'Tidak ada bukti pembayaran yang sesuai filter'}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {paymentProofs.length === 0 
                    ? 'Bukti pembayaran yang dikirim pelanggan akan muncul di sini' 
                    : 'Coba ubah filter atau kata kunci pencarian'}
                </p>
                
                {paymentProofs.length === 0 && (
                  <div className="max-w-md mx-auto">
                    <Alert className="bg-blue-50 border-blue-200 mb-4">
                      <Info className="h-4 w-4 text-blue-800" />
                      <AlertDescription className="text-blue-800 text-sm">
                        Bukti pembayaran yang dikirim pelanggan akan muncul di sini
                      </AlertDescription>
                    </Alert>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-left">
                      <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                        <Upload className="w-4 h-4 mr-2 text-primary" />
                        Proses Upload Bukti Pembayaran
                      </h4>
                      <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Pelanggan memilih metode pembayaran transfer bank saat checkout</li>
                        <li>Pelanggan mengupload bukti transfer melalui form checkout</li>
                        <li>Bukti pembayaran disimpan di Firebase Storage</li>
                        <li>Data bukti pembayaran disimpan di koleksi <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">payment_proofs</code></li>
                        <li>Admin dapat memverifikasi atau menolak bukti pembayaran</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama & Email</TableHead>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Metode Pembayaran</TableHead>
                      <TableHead>Waktu Upload</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPaymentProofs.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{payment.nama}</div>
                              <div className="text-sm text-gray-500">{payment.email}</div>
                              {payment.user_id && (
                                <div className="text-xs text-gray-400">ID: {payment.user_id.slice(0, 8)}...</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{payment.invoice_id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span>{payment.metode_pembayaran}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(payment.uploaded_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setIsDetailModalOpen(true);
                                setImageError(false);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Detail
                            </Button>
                            
                            {payment.status === 'Menunggu' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                                onClick={() => handleVerify(payment.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verifikasi
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        {selectedPayment && (
          <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileImage className="w-5 h-5" />
                  <span>Detail Bukti Pembayaran</span>
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Informasi Pembayaran</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div>
                        <span className="font-medium text-gray-700">Nama:</span>
                        <span className="ml-2">{selectedPayment.nama}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2">{selectedPayment.email}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Invoice ID:</span>
                        <span className="ml-2">{selectedPayment.invoice_id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Metode Pembayaran:</span>
                        <span className="ml-2">{selectedPayment.metode_pembayaran}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Waktu Upload:</span>
                        <span className="ml-2">{formatDate(selectedPayment.uploaded_at)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className="ml-2">{getStatusBadge(selectedPayment.status)}</span>
                      </div>
                      {selectedPayment.notes && (
                        <div>
                          <span className="font-medium text-gray-700">Catatan:</span>
                          <p className="mt-1 text-sm bg-white p-2 rounded border">{selectedPayment.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {selectedPayment.status === 'Menunggu' && (
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleVerify(selectedPayment.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verifikasi Pembayaran
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Tolak Pembayaran
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tolak Bukti Pembayaran</AlertDialogTitle>
                            <AlertDialogDescription>
                              Masukkan alasan penolakan bukti pembayaran ini. Alasan ini akan disimpan dan dapat dilihat oleh admin lain.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <div className="py-4">
                            <Input
                              placeholder="Alasan penolakan..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleReject}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Tolak Pembayaran
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
                
                {/* Payment Proof Image */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Bukti Pembayaran</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {imageError ? (
                      <div className="aspect-auto h-[300px] flex flex-col items-center justify-center border border-gray-200 rounded-md bg-gray-100">
                        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-2" />
                        <p className="text-gray-600 text-sm">Gambar tidak dapat dimuat</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setImageError(false)}
                        >
                          Coba Lagi
                        </Button>
                      </div>
                    ) : (
                      <div className="aspect-auto max-h-[400px] overflow-hidden rounded-md border border-gray-200">
                        <img 
                          src={selectedPayment.bukti_url} 
                          alt="Bukti Pembayaran" 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            setImageError(true);
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    )}
                    <div className="mt-3 flex justify-center">
                      <a 
                        href={selectedPayment.bukti_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Buka gambar di tab baru
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default PaymentVerification;