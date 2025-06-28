import { useState } from 'react';
import { useShippingRates, useAddShippingRate, useUpdateShippingRate, useDeleteShippingRate } from '@/hooks/useShippingRates';
import { prefectures } from '@/data/prefectures';
import { toast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogTrigger,
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
import { Truck, Plus, Edit, Trash2, Search } from 'lucide-react';
import { ShippingRate } from '@/types';

const ShippingRates = () => {
  const { data: shippingRates = [], isLoading } = useShippingRates();
  const addShippingRate = useAddShippingRate();
  const updateShippingRate = useUpdateShippingRate();
  const deleteShippingRate = useDeleteShippingRate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  
  const [formData, setFormData] = useState({
    prefecture: '',
    rate: '',
    estimated_days: ''
  });

  const filteredRates = shippingRates.filter(rate => 
    rate.prefecture.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.prefecture_en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availablePrefectures = prefectures.filter(
    prefecture => !shippingRates.some(rate => rate.prefecture === prefecture.name)
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubmit = async () => {
    if (!formData.prefecture || !formData.rate) {
      toast({
        title: "Error",
        description: "Prefektur dan ongkos kirim wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const rate = parseInt(formData.rate);
    if (isNaN(rate) || rate < 0) {
      toast({
        title: "Error",
        description: "Ongkos kirim harus berupa angka positif",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedPrefecture = prefectures.find(p => p.name === formData.prefecture);
      if (!selectedPrefecture) {
        throw new Error("Prefektur tidak valid");
      }

      await addShippingRate.mutateAsync({
        prefecture: selectedPrefecture.name,
        prefecture_en: selectedPrefecture.name_en,
        rate: rate,
        estimated_days: formData.estimated_days || '3-5 hari'
      });

      toast({
        title: "Berhasil",
        description: `Ongkos kirim untuk ${selectedPrefecture.name} berhasil ditambahkan`,
      });

      setIsAddDialogOpen(false);
      setFormData({
        prefecture: '',
        rate: '',
        estimated_days: ''
      });
    } catch (error) {
      console.error('Error adding shipping rate:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal menambahkan ongkos kirim",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRate || !formData.rate) {
      toast({
        title: "Error",
        description: "Ongkos kirim wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const rate = parseInt(formData.rate);
    if (isNaN(rate) || rate < 0) {
      toast({
        title: "Error",
        description: "Ongkos kirim harus berupa angka positif",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateShippingRate.mutateAsync({
        id: selectedRate.id,
        updates: {
          rate: rate,
          estimated_days: formData.estimated_days || selectedRate.estimated_days
        }
      });

      toast({
        title: "Berhasil",
        description: `Ongkos kirim untuk ${selectedRate.prefecture} berhasil diperbarui`,
      });

      setIsEditDialogOpen(false);
      setSelectedRate(null);
    } catch (error) {
      console.error('Error updating shipping rate:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui ongkos kirim",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, prefecture: string) => {
    try {
      await deleteShippingRate.mutateAsync(id);
      
      toast({
        title: "Berhasil",
        description: `Ongkos kirim untuk ${prefecture} berhasil dihapus`,
      });
    } catch (error) {
      console.error('Error deleting shipping rate:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus ongkos kirim",
        variant: "destructive"
      });
    }
  };

  const handleEditClick = (rate: ShippingRate) => {
    setSelectedRate(rate);
    setFormData({
      prefecture: rate.prefecture,
      rate: rate.rate.toString(),
      estimated_days: rate.estimated_days
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
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Ongkir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Ongkos Kirim</DialogTitle>
                <DialogDescription>
                  Tambahkan ongkos kirim untuk prefektur yang belum memiliki tarif
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="prefecture">Prefektur</Label>
                  <Select 
                    value={formData.prefecture} 
                    onValueChange={(value) => handleInputChange('prefecture', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prefektur" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePrefectures.map((prefecture) => (
                        <SelectItem key={prefecture.name} value={prefecture.name}>
                          {prefecture.name} ({prefecture.name_en})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rate">Ongkos Kirim (¥)</Label>
                  <Input
                    id="rate"
                    type="number"
                    min="0"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    placeholder="Contoh: 1500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimated_days">Estimasi Pengiriman (Opsional)</Label>
                  <Input
                    id="estimated_days"
                    value={formData.estimated_days}
                    onChange={(e) => handleInputChange('estimated_days', e.target.value)}
                    placeholder="Contoh: 3-5 hari"
                  />
                  <p className="text-xs text-gray-500">
                    Biarkan kosong untuk menggunakan default "3-5 hari"
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
                <Button 
                  onClick={handleAddSubmit}
                  disabled={addShippingRate.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {addShippingRate.isPending ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daftar Ongkos Kirim</CardTitle>
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Memuat data ongkir...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prefektur</TableHead>
                      <TableHead>Prefektur (EN)</TableHead>
                      <TableHead>Ongkos Kirim</TableHead>
                      <TableHead>Estimasi</TableHead>
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
                          <TableCell className="font-medium">{rate.prefecture}</TableCell>
                          <TableCell>{rate.prefecture_en}</TableCell>
                          <TableCell className="font-semibold text-primary">
                            {formatPrice(rate.rate)}
                          </TableCell>
                          <TableCell>{rate.estimated_days}</TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {new Date(rate.updated_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
                                      Apakah Anda yakin ingin menghapus ongkos kirim untuk {rate.prefecture}?
                                      Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(rate.id, rate.prefecture)}
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
                Perbarui ongkos kirim untuk {selectedRate?.prefecture}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-prefecture">Prefektur</Label>
                <Input
                  id="edit-prefecture"
                  value={selectedRate?.prefecture || ''}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Ongkos Kirim (¥)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  min="0"
                  value={formData.rate}
                  onChange={(e) => handleInputChange('rate', e.target.value)}
                  placeholder="Contoh: 1500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-estimated_days">Estimasi Pengiriman</Label>
                <Input
                  id="edit-estimated_days"
                  value={formData.estimated_days}
                  onChange={(e) => handleInputChange('estimated_days', e.target.value)}
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