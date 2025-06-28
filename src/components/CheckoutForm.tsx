import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { prefectures } from '@/data/prefectures';
import { CartItem, Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/hooks/useFirebaseAuth';
import InvoiceModal from '@/components/InvoiceModal';
import { useShippingRateByPrefecture } from '@/hooks/useShippingRates';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap harus minimal 2 karakter'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid').regex(/^[0-9+\-\s]+$/, 'Format nomor tidak valid'),
  email: z.string().email('Format email tidak valid'),
  prefecture: z.string().min(1, 'Silakan pilih prefektur'),
  city: z.string().min(2, 'Area/Kota/Cho/Machi harus minimal 2 karakter'),
  postalCode: z.string().min(7, 'Kode pos harus 7 digit').max(7, 'Kode pos harus 7 digit').regex(/^[0-9]{7}$/, 'Kode pos harus berupa 7 angka'),
  address: z.string().min(10, 'Alamat lengkap harus minimal 10 karakter'),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  cart: CartItem[];
  total: number;
  onOrderComplete: () => void;
}

const CheckoutForm = ({ cart, total, onOrderComplete }: CheckoutFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const { user } = useAuth();
  const createOrder = useCreateOrder();
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const { data: shippingRate } = useShippingRateByPrefecture(selectedPrefecture);
  const [shippingFee, setShippingFee] = useState<number | null>(null);

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      whatsapp: '',
      email: user?.email || '',
      prefecture: '',
      city: '',
      postalCode: '',
      address: '',
      notes: '',
    },
  });

  // Update shipping fee when prefecture changes
  useEffect(() => {
    if (shippingRate) {
      setShippingFee(shippingRate.price);
    } else {
      setShippingFee(null);
    }
  }, [shippingRate]);

  // Calculate total with shipping
  const totalWithShipping = total + (shippingFee || 0);

  const generateWhatsAppMessage = (data: CheckoutFormData) => {
    const productList = cart.map(item => {
      const variants = item.selectedVariants 
        ? Object.entries(item.selectedVariants).map(([type, value]) => `${type}: ${value}`).join(', ')
        : '';
      
      return `- ${item.name}${variants ? ` | Varian: ${variants}` : ''} | Qty: ${item.quantity} | ¥${(item.price * item.quantity).toLocaleString()}`;
    }).join('\n');

    const shippingInfo = shippingFee 
      ? `\n*ONGKOS KIRIM: ¥${shippingFee.toLocaleString()}*` 
      : '';

    const message = `Halo Admin Injapan Food

Saya ingin memesan produk melalui website. Berikut detail pesanan saya:

*INFORMASI PENERIMA:*
Nama penerima: ${data.fullName}
Nomor WhatsApp: ${data.whatsapp}
Email: ${data.email}
Prefektur: ${data.prefecture}
Area/Kota/Cho/Machi: ${data.city}
Kode Pos: ${data.postalCode}
Alamat lengkap: ${data.address}

*DAFTAR PRODUK:*
${productList}

*SUBTOTAL BELANJA: ¥${total.toLocaleString()}*${shippingInfo}
*TOTAL BELANJA: ¥${totalWithShipping.toLocaleString()}*

${data.notes ? `Catatan: ${data.notes}` : ''}

Mohon konfirmasi pesanan saya. Terima kasih banyak!`;

    return encodeURIComponent(message);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Silakan tambahkan produk ke keranjang terlebih dahulu.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order in Firebase/Firestore
      const orderData = {
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image_url,
          selectedVariants: item.selectedVariants || {}
        })),
        totalPrice: totalWithShipping,
        customerInfo: {
          name: data.fullName,
          email: data.email,
          phone: data.whatsapp,
          prefecture: data.prefecture,
          city: data.city,
          postal_code: data.postalCode,
          address: data.address,
          notes: data.notes
        },
        userId: user?.uid,
        shipping_fee: shippingFee || 0
      };

      const result = await createOrder.mutateAsync({
        items: orderData.items,
        totalPrice: orderData.totalPrice,
        customerInfo: orderData.customerInfo,
        userId: orderData.userId,
        shipping_fee: orderData.shipping_fee
      });

      // Create order object for invoice
      const newOrder: Order = {
        id: result,
        user_id: user?.uid || '',
        items: orderData.items,
        total_price: orderData.totalPrice,
        customer_info: orderData.customerInfo,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        total_amount: orderData.totalPrice,
        shipping_address: {
          name: data.fullName,
          address: data.address,
          city: data.city,
          state: data.prefecture,
          zip: data.postalCode,
          country: 'Japan'
        },
        payment_method: 'cod',
        shipping_fee: shippingFee || 0
      };

      setCreatedOrder(newOrder);
      
      // Show success message
      toast({
        title: "Pesanan Berhasil Dibuat",
        description: "Pesanan telah disimpan di riwayat Anda. Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan.",
      });

      // Show invoice first
      setShowInvoice(true);
      
      // Open WhatsApp after a short delay
      setTimeout(() => {
        const whatsappMessage = generateWhatsAppMessage(data);
        const phoneNumber = '6285155452259'; // Replace with your actual WhatsApp number
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappMessage}`;
        window.open(whatsappUrl, '_blank');
      }, 1000);

      // Clear form and cart
      form.reset();
      onOrderComplete();
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Terjadi Kesalahan",
        description: "Gagal membuat pesanan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Informasi Pengiriman</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap Penerima *</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp/Telepon *</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contoh@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="prefecture"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prefektur *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedPrefecture(value.toLowerCase());
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pilih prefektur" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg max-h-60 z-50">
                      {prefectures.map((prefecture) => (
                        <SelectItem key={prefecture.name} value={prefecture.name_en}>
                          {prefecture.name} ({prefecture.name_en})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area/Kota/Cho/Machi *</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Shibuya-ku, Harajuku" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode Pos *</FormLabel>
                <FormControl>
                  <Input placeholder="1234567" maxLength={7} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alamat Lengkap *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Masukkan alamat lengkap termasuk nomor rumah, nama jalan, dll."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan Pesanan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tambahkan catatan khusus untuk pesanan Anda..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shipping Fee Information */}
          <div className="border-t border-b py-4 my-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Ongkos Kirim:</span>
              {selectedPrefecture ? (
                shippingFee !== null ? (
                  <span>¥{shippingFee.toLocaleString()}</span>
                ) : (
                  <span className="text-yellow-600 text-sm">Ongkir untuk prefektur ini belum diatur</span>
                )
              ) : (
                <span className="text-gray-500">Pilih prefektur</span>
              )}
            </div>
            <div className="flex justify-between items-center pt-2 text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">¥{totalWithShipping.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={isSubmitting || cart.length === 0 || (selectedPrefecture && shippingFee === null)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>
                {isSubmitting ? 'Memproses...' : 'Pesan via WhatsApp'}
              </span>
            </Button>
            <p className="text-center text-sm text-gray-600 mt-2">
              Pesanan akan disimpan di riwayat Anda dan dikirim ke WhatsApp
            </p>
            
            {selectedPrefecture && shippingFee === null && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Ongkir untuk prefektur ini belum diatur. Silakan pilih prefektur lain atau hubungi admin.
                </p>
              </div>
            )}
          </div>
        </form>
      </Form>

      {/* Invoice Modal */}
      {showInvoice && createdOrder && (
        <InvoiceModal
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          order={createdOrder}
        />
      )}
    </div>
  );
};

export default CheckoutForm;