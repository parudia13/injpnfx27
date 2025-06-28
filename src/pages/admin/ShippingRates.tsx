import { useState, useEffect } from 'react';
import { useShippingRates, useAddShippingRate, useUpdateShippingRate, useDeleteShippingRate } from '@/hooks/useShippingRates';
import { prefectures } from '@/data/prefectures';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Truck, Edit, Trash2, Search, RefreshCw } from 'lucide-react';
import { ShippingRate } from '@/types';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const ShippingRates = () => {
  const { data: shippingRates = [], isLoading, refetch } = useShippingRates();
  const updateShippingRate = useUpdateShippingRate();
  const deleteShippingRate = useDeleteShippingRate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [formData, setFormData] = useState({
    price: '',
    delivery_time: ''
  });

  // Filter rates based on search term
  const filteredRates = shippingRates.filter(rate => {
    const kanjiMatch = rate.kanji && rate.kanji.toLowerCase().includes(searchTerm.toLowerCase());
    const romajiMatch = rate.romaji && rate.romaji.toLowerCase().includes(searchTerm.toLowerCase());
    return kanjiMatch || romajiMatch;
  });

  // Check if we need to initialize the shipping rates
  useEffect(() => {
    const checkAndInitializeRates = async () => {
      if (!isLoading && shippingRates.length === 0) {
        const shouldInitialize = window.confirm(
          "Belum ada data ongkir yang tersedia. Apakah Anda ingin menginisialisasi data ongkir untuk semua prefektur Jepang?"
        );
        
        if (shouldInitialize) {
          await initializeShippingRates();
        }
      }
    };
    
    checkAndInitializeRates();
  }, [isLoading, shippingRates]);

  // Initialize shipping rates for all prefectures
  const initializeShippingRates = async () => {
    try {
      setIsInitializing(true);
      
      // Check if collection exists and has documents
      const ratesRef = collection(db, 'shipping_rates');
      const snapshot = await getDocs(ratesRef);
      
      if (snapshot.size > 0) {
        toast({
          title: "Info",
          description: "Data ongkir sudah ada di database",
        });
        setIsInitializing(false);
        return;
      }
      
      // Initialize rates for all prefectures
      const timestamp = new Date().toISOString();
      
      for (const prefecture of prefectures) {
        const prefectureId = prefecture.name_en.toLowerCase();
        const docRef = doc(db, 'shipping_rates', prefectureId);
        await setDoc(docRef, {
          prefecture_id: prefectureId,
          kanji: prefecture.name,
          romaji: prefecture.name_en,
          price: 0,
          delivery_time: "-",
          created_at: timestamp,
          updated_at: timestamp
        });
      }
      
      toast({
        title: "Berhasil",
        description: "Data ongkir untuk 47 prefektur berhasil diinisialisasi",
      });
      
      // Refresh the data
      refetch();
    } catch (error) {
      console.error('Error initializing shipping rates:', error);
      toast({
        title: "Error",
        description: "Gagal menginisialisasi data ongkir",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async () => {
    if (!selectedRate || !formData.price || !formData.delivery_time) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const price = parseInt(formData.price);
    if (isNaN(price) || price < 0) {
      toast({
        title: "Error",
        description: "Ongkir harus berupa angka positif",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateShippingRate.mutateAsync({
        id: selectedRate.id,
        updates: {
          price: price,
          delivery_time: formData.delivery_time
        }
      });

      toast({
        title: "Berhasil",
        description: `Ongkir untuk ${selectedRate.kanji} berhasil diperbarui`,
      });

      setIsEditDialogOpen(false);
      setSelectedRate(null);
    } catch (error) {
      console.error('Error updating shipping rate:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui ongkir",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, kanji: string) => {
    try {
      await deleteShippingRate.mutateAsync(id);
      
      toast({
        title: "Berhasil",
        description: `Ongkir untuk ${kanji} berhasil dihapus`,
      });
    } catch (error) {
      console.error('Error deleting shipping rate:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus ongkir",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (rate: ShippingRate) => {
    setSelectedRate(rate);
    setFormData({
      price: rate.price.toString(),
      delivery_time: rate.delivery_time
    });
    setIsEditDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Truck className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pengaturan Ongkir</h1>
              <p className="text-gray-600">Kelola ongkos kirim untuk setiap prefektur di Jepang</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={initializeShippingRates} 
              disabled={isInitializing || isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isInitializing ? 'animate-spin' : ''}`} />
              {isInitializing ? 'Menginisialisasi...' : 'Inisialisasi Data'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Ongkos Kirim ({filteredRates.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari prefektur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || isInitializing ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">
                  {isInitializing ? 'Menginisialisasi data ongkir...' : 'Memuat data ongkir...'}
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prefektur (Kanji)</TableHead>
                      <TableHead>Prefektur (Romaji)</TableHead>
                      <TableHead>Ongkos Kirim</TableHead>
                      <TableHead>Estimasi Waktu</TableHead>
                      <TableHead>Terakhir Diperbarui</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          {searchTerm ? 'Tidak ada prefektur yang cocok dengan pencarian' : 'Belum ada ongkos kirim yang ditambahkan'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRates.map((rate) => (
                        <TableRow key={rate.id}>
                          <TableCell className="font-medium">{rate.kanji}</TableCell>
                          <TableCell>{rate.romaji}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatPrice(rate.price)}
                          </TableCell>
                          <TableCell>{rate.delivery_time}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {rate.updated_at ? new Date(rate.updated_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditClick(rate)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Ongkos Kirim</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus ongkos kirim untuk {rate.kanji}?
                                      Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(rate.id, rate.kanji)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Ongkos Kirim</DialogTitle>
              <DialogDescription>
                Perbarui ongkos kirim untuk {selectedRate?.kanji}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prefecture">Prefektur</Label>
                <Input
                  id="edit-prefecture"
                  value={`${selectedRate?.kanji || ''} (${selectedRate?.romaji || ''})`}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Ongkos Kirim (¥)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="Contoh: 1500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-delivery_time">Estimasi Pengiriman</Label>
                <Input
                  id="edit-delivery_time"
                  value={formData.delivery_time}
                  onChange={(e) => handleInputChange('delivery_time', e.target.value)}
                  placeholder="Contoh: 3-5 hari"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleEditSubmit}
                disabled={updateShippingRate.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updateShippingRate.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ShippingRates;