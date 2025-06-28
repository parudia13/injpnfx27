import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MessageCircle, FileText, CreditCard, AlertTriangle, Copy, Check, Upload, ArrowRight } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUploadPaymentProof } from '@/hooks/usePaymentProofs';
import { updatePaymentProofInvoiceId } from '@/services/paymentService';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap harus minimal 2 karakter'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid').regex(/^[0-9+\-\s]+$/, 'Format nomor tidak valid'),
  email: z.string().email('Format email tidak valid'),
  prefecture: z.string().min(1, 'Silakan pilih prefektur'),
  city: z.string().min(2, 'Area/Kota/Cho/Machi harus minimal 2 karakter'),
  postalCode: z.string().min(7, 'Kode pos harus 7 digit').max(7, 'Kode pos harus 7 digit').regex(/^[0-9]{7}$/, 'Kode pos harus berupa 7 angka'),
  address: z.string().min(10, 'Alamat lengkap harus minimal 10 karakter'),
  notes: z.string().optional(),
  paymentMethod: z.string().min(1, 'Silakan pilih metode pembayaran'),
  paymentProof: z.instanceof(FileList).optional().refine(
    (files) => {
      if (!files || files.length === 0) return true;
      return Array.from(files).every(file => file.size <= 10 * 1024 * 1024); // 10MB limit
    },
    {
      message: 'File terlalu besar. Maksimal 10MB',
    }
  ),
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
  const uploadPaymentProofMutation = useUploadPaymentProof();
  const [uploadedPaymentProofId, setUploadedPaymentProofId] = useState<string | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string>('');
  const { data: shippingRate, isLoading: isLoadingShippingRate } = useShippingRateByPrefecture(selectedPrefecture);
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      paymentMethod: '',
    },
  });

  // Update shipping fee when prefecture changes
  useEffect(() => {
    if (shippingRate) {
      console.log('Setting shipping fee from rate:', shippingRate);
      setShippingFee(shippingRate.price);
    } else {
      console.log('No shipping rate found, setting fee to null');
      setShippingFee(null);
    }
  }, [shippingRate]);

  // Calculate total with shipping
  const totalWithShipping = total + (shippingFee || 0);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied({ ...isCopied, [field]: true });
      setTimeout(() => {
        setIsCopied({ ...isCopied, [field]: false });
      }, 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Ukuran file maksimal 10MB",
          variant: "destructive",
        });
        return;
      }
      setPaymentProofFile(file);
    }
  };

  const generateWhatsAppMessage = (data: CheckoutFormData) => {
    const productList = cart.map(item => {
      const variants = item.selectedVariants 
        ? Object.entries(item.selectedVariants).map(([type, value]) => `${type}: ${value}`).join(', ')
        : '';
      
      return `- ${item.name}${variants ? ` | Varian: ${variants}` : ''} | Qty: ${item.quantity} | ¥${(item.price * item.quantity).toLocaleString()}`;
    }).join('\n');

    const shippingInfo = shippingFee 
      ? `\n*ONGKOS KIRIM (${data.prefecture}): ¥${shippingFee.toLocaleString()}*` 
      : '';

    // Payment method information
    let paymentInfo = `\n*METODE PEMBAYARAN:*\n${data.paymentMethod}`;
    
    // Add bank account details based on selected payment method
    if (data.paymentMethod === 'Bank Transfer (Rupiah)') {
      paymentInfo += `\nNama Penerima: PT. Injapan Shop\nNomor Rekening: 1234567890 (BCA)`;
    } else if (data.paymentMethod === 'Bank Transfer (Yucho / ゆうちょ銀行)') {
      paymentInfo += `\nNama Penerima: Heri Kurnianta\nAccount Number: 22210551\nNama Bank: BANK POST\nBank code: 11170\nBranch code: 118\nReferensi: 24`;
    }

    // Add payment status
    if (hasPaid && paymentProofFile) {
      paymentInfo += `\n\n*STATUS PEMBAYARAN:* Sudah Dibayar ✅\nBukti pembayaran telah diunggah.`;
    }

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
${paymentInfo}

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
    let paymentProofDocId: string | null = null; // Initialize paymentProofDocId

    try {
      // Step 1: Upload payment proof if applicable
      if (selectedPaymentMethod !== 'COD (Cash on Delivery)' && paymentProofFile) {
        try {
          paymentProofDocId = await uploadPaymentProofMutation.mutateAsync({
            file: paymentProofFile,
            paymentData: {
              user_id: user?.uid,
              nama: data.fullName,
              email: data.email,
              invoice_id: 'temp_invoice_id', // Placeholder, will be updated later
              metode_pembayaran: data.paymentMethod,
              status: 'Menunggu'
            }
          });
          setUploadedPaymentProofId(paymentProofDocId); // Store the ID
          toast({
            title: "Bukti Pembayaran Diunggah",
            description: "Bukti pembayaran Anda berhasil diunggah. Menunggu konfirmasi pesanan.",
          });
        } catch (uploadError) {
          console.error('Error uploading payment proof:', uploadError);
          toast({
            title: "Gagal Unggah Bukti Pembayaran",
            description: "Terjadi kesalahan saat mengunggah bukti pembayaran. Silakan coba lagi.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return; // Stop submission if payment proof upload fails
        }
      }

      // Step 2: Create order in Firebase/Firestore
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
          notes: data.notes,
          payment_method: data.paymentMethod,
          payment_status: hasPaid ? 'paid' : 'pending'
        },
        userId: user?.uid,
        shipping_fee: shippingFee || 0
      };

      const orderId = await createOrder.mutateAsync({
        items: orderData.items,
        totalPrice: orderData.totalPrice,
        customerInfo: orderData.customerInfo,
        userId: orderData.userId,
        shipping_fee: orderData.shipping_fee
      });

      // Step 3: Update payment proof with actual invoice ID if it was uploaded
      if (paymentProofDocId) {
        await updatePaymentProofInvoiceId(paymentProofDocId, orderId);
        toast({
          title: "Bukti Pembayaran Diperbarui",
          description: "Bukti pembayaran Anda telah ditautkan dengan pesanan.",
        });
      }

      // Create order object for invoice
      const newOrder: Order = {
        id: orderId, // Use the actual orderId
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
        payment_method: data.paymentMethod as 'credit_card' | 'paypal' | 'cod',
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
        const phoneNumber = '+817084894699'; // Replace with your actual WhatsApp number
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
                      console.log('Selected prefecture:', value);
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
                        <SelectItem key={prefecture.name} value={prefecture.name_en.toLowerCase()}>
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

          {/* Payment Method Selection */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-primary" />
              Pilih Metode Pembayaran
            </h3>
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metode Pembayaran *</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedPaymentMethod(value);
                      setHasPaid(false);
                      setPaymentProofFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pilih metode pembayaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="COD (Cash on Delivery)">COD (Cash on Delivery)</SelectItem>
                      <SelectItem value="Bank Transfer (Rupiah)">Bank Transfer (Rupiah)</SelectItem>
                      <SelectItem value="Bank Transfer (Yucho / ゆうちょ銀行)">Bank Transfer (Yucho / ゆうちょ銀行)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Bank Transfer Details - Yucho */}
          {selectedPaymentMethod === 'Bank Transfer (Yucho / ゆうちょ銀行)' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-4 text-lg">Jumlah yang harus dibayar: <span className="text-red-600">¥{totalWithShipping.toLocaleString()}</span></h3>
                
                <div className="space-y-6">
                  {/* Step 1: Transfer Information */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3">Langkah 1: Mengirim uang ke rekening</h4>
                    <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Account Number:</span>
                          <span className="text-gray-900">22210551</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('22210551', 'account')}
                        >
                          {isCopied['account'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['account'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Nama Pemegang Rekening:</span>
                          <span className="text-gray-900">Heri Kurnianta</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('Heri Kurnianta', 'name')}
                        >
                          {isCopied['name'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['name'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Nama Bank:</span>
                          <span className="text-gray-900">BANK POST</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('BANK POST', 'bank')}
                        >
                          {isCopied['bank'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['bank'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Bank code:</span>
                          <span className="text-gray-900">11170</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('11170', 'bankcode')}
                        >
                          {isCopied['bankcode'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['bankcode'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Branch code:</span>
                          <span className="text-gray-900">118</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('118', 'branchcode')}
                        >
                          {isCopied['branchcode'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['branchcode'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Referensi:</span>
                          <span className="text-gray-900">24</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('24', 'reference')}
                        >
                          {isCopied['reference'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['reference'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 2: Upload Payment Proof */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3">Langkah 2: Silakan unggah bukti pembayaran</h4>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <FormField
                        control={form.control}
                        name="paymentProof"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex flex-col items-center justify-center w-full">
                                <label htmlFor="payment-proof" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">Klik untuk unggah bukti pembayaran</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Maksimal 10MB (JPG, PNG, PDF)
                                    </p>
                                  </div>
                                  <input
                                    id="payment-proof"
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/png,application/pdf"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                      onChange(e.target.files);
                                      handleFileChange(e);
                                    }}
                                    {...rest}
                                  />
                                </label>
                              </div>
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-2">
                              Lampirkan tanda terima bank atau screenshot transaksi untuk mempercepat konfirmasi
                            </p>
                            {paymentProofFile && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700 flex items-center">
                                  <Check className="w-4 h-4 mr-1" />
                                  {paymentProofFile.name} ({(paymentProofFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Step 3: Confirmation */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3">Langkah 3: Apakah Anda telah bayar?</h4>
                    <div className="space-y-3">
                      <Button
                        type="button"
                        className={`w-full ${paymentProofFile ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!paymentProofFile}
                        onClick={() => setHasPaid(true)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Saya sudah bayar
                      </Button>
                      
                      <div className="text-center">
                        <a href="https://wa.me/817084894699" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Hubungi kami sebelum pembayaran
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-800" />
                  <AlertDescription className="text-yellow-800 text-sm">
                    Harap transfer sesuai dengan total belanja dan simpan bukti transfer
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Bank Transfer Details - Rupiah */}
          {selectedPaymentMethod === 'Bank Transfer (Rupiah)' && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-blue-800 mb-4 text-lg">Jumlah yang harus dibayar: <span className="text-red-600">¥{totalWithShipping.toLocaleString()}</span></h3>
                
                <div className="space-y-6">
                  {/* Step 1: Transfer Information */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3">Langkah 1: Mengirim uang ke rekening</h4>
                    <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Nama Penerima:</span>
                          <span className="text-gray-900">PT. Injapan Shop</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('PT. Injapan Shop', 'name-rupiah')}
                        >
                          {isCopied['name-rupiah'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['name-rupiah'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="font-semibold text-gray-700 w-40">Nomor Rekening:</span>
                          <span className="text-gray-900">1234567890 (BCA)</span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => copyToClipboard('1234567890', 'account-rupiah')}
                        >
                          {isCopied['account-rupiah'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                          {isCopied['account-rupiah'] ? 'Disalin' : 'Salin'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 2: Upload Payment Proof */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3">Langkah 2: Silakan unggah bukti pembayaran</h4>
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <FormField
                        control={form.control}
                        name="paymentProof"
                        render={({ field: { onChange, value, ...rest } }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex flex-col items-center justify-center w-full">
                                <label htmlFor="payment-proof" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="mb-2 text-sm text-gray-500">
                                      <span className="font-semibold">Klik untuk unggah bukti pembayaran</span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Maksimal 10MB (JPG, PNG, PDF)
                                    </p>
                                  </div>
                                  <input
                                    id="payment-proof"
                                    type="file"
                                    className="hidden"
                                    accept="image/jpeg,image/png,application/pdf"
                                    ref={fileInputRef}
                                    onChange={(e) => {
                                      onChange(e.target.files);
                                      handleFileChange(e);
                                    }}
                                    {...rest}
                                  />
                                </label>
                              </div>
                            </FormControl>
                            <p className="text-xs text-gray-500 mt-2">
                              Lampirkan tanda terima bank atau screenshot transaksi untuk mempercepat konfirmasi
                            </p>
                            {paymentProofFile && (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-700 flex items-center">
                                  <Check className="w-4 h-4 mr-1" />
                                  {paymentProofFile.name} ({(paymentProofFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Step 3: Confirmation */}
                  <div>
                    <h4 className="font-medium text-blue-800 mb-3">Langkah 3: Apakah Anda telah bayar?</h4>
                    <div className="space-y-3">
                      <Button
                        type="button"
                        className={`w-full ${paymentProofFile ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                        disabled={!paymentProofFile}
                        onClick={() => setHasPaid(true)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Saya sudah bayar
                      </Button>
                      
                      <div className="text-center">
                        <a href="https://wa.me/817084894699" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          Hubungi kami sebelum pembayaran
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-800" />
                  <AlertDescription className="text-yellow-800 text-sm">
                    Harap transfer sesuai dengan total belanja dan simpan bukti transfer
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Order Summary with Shipping Fee */}
          <div className="border-t border-b py-4 my-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Subtotal Produk:</span>
              <span>¥{total.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Ongkos Kirim:</span>
              {selectedPrefecture ? (
                isLoadingShippingRate ? (
                  <span className="text-gray-500">Memuat...</span>
                ) : shippingFee !== null ? (
                  <span>¥{shippingFee.toLocaleString()}</span>
                ) : (
                  <span className="text-yellow-600 text-sm">Ongkir belum diatur</span>
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
              disabled={
                isSubmitting || 
                cart.length === 0 || 
                (selectedPrefecture && shippingFee === null) || 
                !selectedPaymentMethod ||
                (selectedPaymentMethod !== 'COD (Cash on Delivery)' && !hasPaid)
              }
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
            
            {!selectedPaymentMethod && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  Silakan pilih metode pembayaran untuk melanjutkan.
                </p>
              </div>
            )}
            
            {selectedPaymentMethod !== 'COD (Cash on Delivery)' && !hasPaid && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1 flex-shrink-0" />
                  Silakan unggah bukti pembayaran dan klik "Saya sudah bayar" untuk melanjutkan.
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