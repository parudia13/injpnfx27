import { useState, useEffect } from 'react';
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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Define the prefectures of Japan
const japanPrefectures = [
  { id: 'hokkaido', kanji: '北海道', romaji: 'Hokkaido' },
  { id: 'aomori', kanji: '青森県', romaji: 'Aomori' },
  { id: 'iwate', kanji: '岩手県', romaji: 'Iwate' },
  { id: 'miyagi', kanji: '宮城県', romaji: 'Miyagi' },
  { id: 'akita', kanji: '秋田県', romaji: 'Akita' },
  { id: 'yamagata', kanji: '山形県', romaji: 'Yamagata' },
  { id: 'fukushima', kanji: '福島県', romaji: 'Fukushima' },
  { id: 'ibaraki', kanji: '茨城県', romaji: 'Ibaraki' },
  { id: 'tochigi', kanji: '栃木県', romaji: 'Tochigi' },
  { id: 'gunma', kanji: '群馬県', romaji: 'Gunma' },
  { id: 'saitama', kanji: '埼玉県', romaji: 'Saitama' },
  { id: 'chiba', kanji: '千葉県', romaji: 'Chiba' },
  { id: 'tokyo', kanji: '東京都', romaji: 'Tokyo' },
  { id: 'kanagawa', kanji: '神奈川県', romaji: 'Kanagawa' },
  { id: 'niigata', kanji: '新潟県', romaji: 'Niigata' },
  { id: 'toyama', kanji: '富山県', romaji: 'Toyama' },
  { id: 'ishikawa', kanji: '石川県', romaji: 'Ishikawa' },
  { id: 'fukui', kanji: '福井県', romaji: 'Fukui' },
  { id: 'yamanashi', kanji: '山梨県', romaji: 'Yamanashi' },
  { id: 'nagano', kanji: '長野県', romaji: 'Nagano' },
  { id: 'gifu', kanji: '岐阜県', romaji: 'Gifu' },
  { id: 'shizuoka', kanji: '静岡県', romaji: 'Shizuoka' },
  { id: 'aichi', kanji: '愛知県', romaji: 'Aichi' },
  { id: 'mie', kanji: '三重県', romaji: 'Mie' },
  { id: 'shiga', kanji: '滋賀県', romaji: 'Shiga' },
  { id: 'kyoto', kanji: '京都府', romaji: 'Kyoto' },
  { id: 'osaka', kanji: '大阪府', romaji: 'Osaka' },
  { id: 'hyogo', kanji: '兵庫県', romaji: 'Hyogo' },
  { id: 'nara', kanji: '奈良県', romaji: 'Nara' },
  { id: 'wakayama', kanji: '和歌山県', romaji: 'Wakayama' },
  { id: 'tottori', kanji: '鳥取県', romaji: 'Tottori' },
  { id: 'shimane', kanji: '島根県', romaji: 'Shimane' },
  { id: 'okayama', kanji: '岡山県', romaji: 'Okayama' },
  { id: 'hiroshima', kanji: '広島県', romaji: 'Hiroshima' },
  { id: 'yamaguchi', kanji: '山口県', romaji: 'Yamaguchi' },
  { id: 'tokushima', kanji: '徳島県', romaji: 'Tokushima' },
  { id: 'kagawa', kanji: '香川県', romaji: 'Kagawa' },
  { id: 'ehime', kanji: '愛媛県', romaji: 'Ehime' },
  { id: 'kochi', kanji: '高知県', romaji: 'Kochi' },
  { id: 'fukuoka', kanji: '福岡県', romaji: 'Fukuoka' },
  { id: 'saga', kanji: '佐賀県', romaji: 'Saga' },
  { id: 'nagasaki', kanji: '長崎県', romaji: 'Nagasaki' },
  { id: 'kumamoto', kanji: '熊本県', romaji: 'Kumamoto' },
  { id: 'oita', kanji: '大分県', romaji: 'Oita' },
  { id: 'miyazaki', kanji: '宮崎県', romaji: 'Miyazaki' },
  { id: 'kagoshima', kanji: '鹿児島県', romaji: 'Kagoshima' },
  { id: 'okinawa', kanji: '沖縄県', romaji: 'Okinawa' }
];

interface ShippingRate {
  id: string;
  prefecture_id: string;
  kanji: string;
  price: number;
  delivery_time: string;
  created_at?: string;
  updated_at?: string;
}

const ShippingRates = () => {
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  
  const [formData, setFormData] = useState({
    prefecture_id: '',
    kanji: '',
    price: '',
    delivery_time: ''
  });

  // Fetch shipping rates on component mount
  useEffect(() => {
    fetchShippingRates();
  }, []);

  const fetchShippingRates = async () => {
    setIsLoading(true);
    try {
      const shippingRatesRef = collection(db, 'shipping_rates');
      const snapshot = await getDocs(shippingRatesRef);
      
      const rates: ShippingRate[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ShippingRate));
      
      setShippingRates(rates);
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data ongkir",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRates = shippingRates.filter(rate => 
    rate.kanji.includes(searchTerm) || 
    (japanPrefectures.find(p => p.id === rate.prefecture_id)?.romaji || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailablePrefectures = () => {
    const usedPrefectureIds = new Set(shippingRates.map(rate => rate.prefecture_id));
    return japanPrefectures.filter(prefecture => !usedPrefectureIds.has(prefecture.id));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrefectureChange = (prefectureId: string) => {
    const prefecture = japanPrefectures.find(p => p.id === prefectureId);
    if (prefecture) {
      setFormData(prev => ({
        ...prev,
        prefecture_id: prefectureId,
        kanji: prefecture.kanji
      }));
    }
  };

  const handleAddSubmit = async () => {
    if (!formData.prefecture_id || !formData.kanji || !formData.price) {
      toast({
        title: "Error",
        description: "Prefektur dan ongkir wajib diisi",
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
      // Check if prefecture already has a shipping rate
      const shippingRatesRef = collection(db, 'shipping_rates');
      const q = query(shippingRatesRef, where("prefecture_id", "==", formData.prefecture_id));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        toast({
          title: "Error",
          description: "Ongkir untuk prefektur ini sudah ada",
          variant: "destructive"
        });
        return;
      }

      // Add new shipping rate
      const newRate = {
        prefecture_id: formData.prefecture_id,
        kanji: formData.kanji,
        price: price,
        delivery_time: formData.delivery_time || '3-5 hari',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'shipping_rates'), newRate);

      toast({
        title: "Berhasil",
        description: `Ongkir untuk ${formData.kanji} berhasil ditambahkan`,
      });

      setIsAddDialogOpen(false);
      setFormData({
        prefecture_id: '',
        kanji: '',
        price: '',
        delivery_time: ''
      });
      fetchShippingRates();
    } catch (error) {
      console.error('Error adding shipping rate:', error);
      toast({
        title: "Error",
        description: "Gagal menambahkan ongkir",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedRate || !formData.price) {
      toast({
        title: "Error",
        description: "Ongkir wajib diisi",
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
      const rateRef = doc(db, 'shipping_rates', selectedRate.id);
      await updateDoc(rateRef, {
        price: price,
        delivery_time: formData.delivery_time || selectedRate.delivery_time,
        updated_at: new Date().toISOString()
      });

      toast({
        title: "Berhasil",
        description: `Ongkir untuk ${selectedRate.kanji} berhasil diperbarui`,
      });

      setIsEditDialogOpen(false);
      setSelectedRate(null);
      fetchShippingRates();
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
      await deleteDoc(doc(db, 'shipping_rates', id));
      
      toast({
        title: "Berhasil",
        description: `Ongkir untuk ${kanji} berhasil dihapus`,
      });
      
      fetchShippingRates();
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
      prefecture_id: rate.prefecture_id,
      kanji: rate.kanji,
      price: (rate.price ?? 0).toString(),
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
                    value={formData.prefecture_id} 
                    onValueChange={handlePrefectureChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih prefektur" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailablePrefectures().map((prefecture) => (
                        <SelectItem key={prefecture.id} value={prefecture.id}>
                          {prefecture.kanji} ({prefecture.romaji})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Ongkos Kirim (¥)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Contoh: 1500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="delivery_time">Estimasi Pengiriman</Label>
                  <Input
                    id="delivery_time"
                    value={formData.delivery_time}
                    onChange={(e) => handleInputChange('delivery_time', e.target.value)}
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
                  className="bg-green-600 hover:bg-green-700"
                >
                  Simpan
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
                      <TableHead>Romaji</TableHead>
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
                          <TableCell className="font-medium">{rate.kanji}</TableCell>
                          <TableCell>
                            {japanPrefectures.find(p => p.id === rate.prefecture_id)?.romaji || '-'}
                          </TableCell>
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
                  value={selectedRate?.kanji || ''}
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ShippingRates;