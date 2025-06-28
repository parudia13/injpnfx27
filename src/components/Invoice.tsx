import React from 'react';
import { Order } from '@/types';
import { formatPrice } from '@/utils/cart';

interface InvoiceProps {
  order: Order;
  invoiceNumber: string;
}

const Invoice = ({ order, invoiceNumber }: InvoiceProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg" id="invoice-content">
      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
                alt="Injapan Food Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Injapan Food</h1>
              <p className="text-gray-600">Makanan Indonesia di Jepang</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-red-600">INVOICE</h2>
          </div>
        </div>
        
        <div className="mt-4 text-center border-t pt-4">
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">📱</span>
              <span>WhatsApp: +62 851-5545-2259</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📧</span>
              <span>info@injapanfood.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Invoice</h3>
          <div className="space-y-2 text-sm">
            <div className="flex">
              <span className="font-medium w-24">No. Invoice:</span>
              <span className="text-red-600 font-bold">{invoiceNumber}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Tanggal:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex">
              <span className="font-medium w-24">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status === 'pending' ? 'Menunggu Konfirmasi' :
                 order.status === 'confirmed' ? 'Dikonfirmasi' :
                 order.status === 'completed' ? 'Selesai' :
                 order.status}
              </span>
            </div>
            {order.shipping_estimate && (
              <div className="flex">
                <span className="font-medium w-24">Estimasi:</span>
                <span>{order.shipping_estimate}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Penerima</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Nama:</span>
              <div className="text-gray-700">{order.customer_info.name}</div>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <div className="text-gray-700">{order.customer_info.email}</div>
            </div>
            <div>
              <span className="font-medium">No. WhatsApp:</span>
              <div className="text-gray-700">{order.customer_info.phone}</div>
            </div>
            <div>
              <span className="font-medium">Alamat:</span>
              <div className="text-gray-700">
                {order.customer_info.address}
                {order.customer_info.prefecture && (
                  <><br />{order.customer_info.prefecture}</>
                )}
                {order.customer_info.postal_code && (
                  <><br />〒{order.customer_info.postal_code}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">No.</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Produk</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Qty</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Harga Satuan</th>
                <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-3">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          Varian: {Object.entries(item.selectedVariants).map(([type, value]) => `${type}: ${value}`).join(', ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right">{formatPrice(item.price)}</td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Section */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Subtotal:</span>
                <span>{formatPrice(order.total_price - (order.shipping_fee || 0))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ongkos Kirim:</span>
                <span>{order.shipping_fee ? formatPrice(order.shipping_fee) : 'Akan dikonfirmasi'}</span>
              </div>
              {order.shipping_estimate && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Estimasi Pengiriman:</span>
                  <span>{order.shipping_estimate}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-xl font-bold text-red-600">
                  <span>Total Belanja:</span>
                  <span>{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes and Referral */}
      {(order.customer_info.notes || order.referralTransaction) && (
        <div className="mb-8 space-y-4">
          {order.customer_info.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2">Catatan Pesanan:</h4>
              <p className="text-yellow-700 text-sm">{order.customer_info.notes}</p>
            </div>
          )}
          
          {order.referralTransaction && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">Kode Referral:</h4>
              <p className="text-green-700 text-sm font-mono">
                {order.referralTransaction.referral_code}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t-2 border-gray-200 pt-6">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Terima kasih telah berbelanja di Injapan Food!
          </p>
          <p className="text-sm text-gray-600">
            Untuk pertanyaan lebih lanjut, hubungi kami melalui WhatsApp: +62 851-5545-2259
          </p>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Invoice ini dibuat secara otomatis oleh sistem Injapan Food
            </p>
            <p className="text-xs text-gray-500">
              Dicetak pada: {new Date().toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;