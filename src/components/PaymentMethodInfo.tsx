import { useState } from 'react';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CreditCard, RefreshCw } from 'lucide-react';

interface PaymentMethodInfoProps {
  paymentMethod: string;
  totalAmount: number;
}

const PaymentMethodInfo = ({ paymentMethod, totalAmount }: PaymentMethodInfoProps) => {
  const { convertedRupiah, isLoading, error, refreshRate } = useCurrencyConverter(totalAmount, paymentMethod);
  const [showRefreshAnimation, setShowRefreshAnimation] = useState(false);

  const handleRefreshRate = () => {
    setShowRefreshAnimation(true);
    refreshRate();
    setTimeout(() => setShowRefreshAnimation(false), 1000);
  };

  if (!paymentMethod) return null;

  return (
    <Card className="mt-4">
      <CardContent className="pt-6">
        <div className="flex items-center space-x-2 mb-3">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-800">Informasi Pembayaran</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Metode Pembayaran:</span>
            <span className="font-medium">{paymentMethod}</span>
          </div>

          {paymentMethod === 'Bank Transfer (Rupiah)' && (
            <>
              <Separator />
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 font-medium">Total dalam Rupiah:</span>
                  <div className="flex items-center">
                    {isLoading ? (
                      <span className="text-gray-500">Mengkonversi...</span>
                    ) : (
                      <span className="font-bold text-blue-700">
                        Rp {convertedRupiah?.toLocaleString('id-ID') || '-'}
                      </span>
                    )}
                    <button 
                      onClick={handleRefreshRate}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                      title="Refresh kurs"
                      type="button"
                    >
                      <RefreshCw className={`w-4 h-4 ${showRefreshAnimation ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
                
                {error ? (
                  <p className="text-xs text-yellow-600 mt-2">
                    Gagal mendapatkan kurs terbaru. Menggunakan kurs perkiraan.
                  </p>
                ) : (
                  <p className="text-xs text-blue-600 mt-1">
                    *Kurs otomatis berdasarkan nilai tukar saat ini.
                  </p>
                )}
                
                <div className="mt-3 text-sm text-blue-600">
                  <p className="font-medium">Informasi Rekening:</p>
                  <p>Bank: BCA</p>
                  <p>No. Rekening: 1234567890</p>
                  <p>Atas Nama: PT. Injapan Shop</p>
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'Bank Transfer (Yucho / ゆうちょ銀行)' && (
            <>
              <Separator />
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-600">
                  <p className="font-medium">Informasi Rekening:</p>
                  <p>Bank: Yucho Bank (ゆうちょ銀行)</p>
                  <p>Account Number: 22210551</p>
                  <p>Nama: Heri Kurnianta</p>
                  <p>Bank code: 11170</p>
                  <p>Branch code: 118</p>
                </div>
              </div>
            </>
          )}

          {paymentMethod === 'COD (Cash on Delivery)' && (
            <>
              <Separator />
              
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-600">
                  Pembayaran dilakukan saat pesanan diterima. Pastikan Anda memiliki uang tunai yang cukup saat pengiriman tiba.
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodInfo;