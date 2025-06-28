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
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg print-container" id="invoice-content">
      {/* Print-specific styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              font-size: 12px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .print-container {
              width: 100%;
              max-width: 100%;
              padding: 15mm;
              margin: 0;
              box-shadow: none;
              page-break-after: always;
            }
            .page-break-avoid {
              page-break-inside: avoid;
            }
            table {
              page-break-inside: avoid;
            }
            tr {
              page-break-inside: avoid;
            }
          }
        `}
      </style>

      {/* Header with Logo and Title */}
      <div className="flex justify-between items-center border-b-2 border-gray-200 pb-4 mb-6 page-break-avoid">
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
          <h2 className="text-4xl font-bold text-red-600">INVOICE</h2>
        </div>
      </div>

      {/* Contact Information */}
      <div className="flex justify-between text-sm text-gray-600 mb-6 border-b pb-4">
        <div className="flex items-center space-x-2">
          <span>📱 WhatsApp: +817084894699</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>📧 info@injapanfood.com</span>
        </div>
      </div>

      {/* Invoice and Customer Info */}
      <div className="grid grid-cols-2 gap-8 mb-8 page-break-avoid">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Invoice</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">No. Invoice:</span>
              <span className="text-red-600 font-bold">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tanggal:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
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
            <div className="flex justify-between">
              <span className="font-medium">Metode Pembayaran:</span>
              <span>{order.customer_info.payment_method || 'COD'}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Penerima</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Nama:</span>
              <span>{order.customer_info.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{order.customer_info.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">No. WhatsApp:</span>
              <span>{order.customer_info.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Alamat:</span>
              <span className="text-right">
                {order.customer_info.address}
                {order.customer_info.prefecture && (
                  <>, {order.customer_info.prefecture}</>
                )}
                {order.customer_info.postal_code && (
                  <>, 〒{order.customer_info.postal_code}</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8 page-break-avoid">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Pesanan</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">No.</th>
              <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Produk</th>
              <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Harga Satuan</th>
              <th className="border border-gray-300 px-4 py-2 text-right font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {Object.entries(item.selectedVariants).map(([type, value]) => `${type}: ${value}`).join(', ')}
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{formatPrice(item.price)}</td>
                <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                  {formatPrice(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total Section */}
      <div className="flex justify-end mb-8 page-break-avoid">
        <div className="w-64">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between text-base">
                <span className="font-medium">Subtotal:</span>
                <span>{formatPrice(order.total_price - (order.shipping_fee || 0))}</span>
              </div>
              <div className="flex justify-between text-base">
                <span>Ongkos Kirim:</span>
                <span>{order.shipping_fee ? formatPrice(order.shipping_fee) : 'Akan dikonfirmasi'}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold text-red-600">
                  <span>Total Belanja:</span>
                  <span>{formatPrice(order.total_price)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Information */}
      {order.customer_info.payment_method && (
        <div className="mb-8 page-break-avoid">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Informasi Pembayaran:</h4>
            <p className="text-blue-700 font-medium">{order.customer_info.payment_method}</p>
            
            {order.customer_info.payment_method === 'Bank Transfer (Rupiah)' && (
              <div className="mt-2 text-blue-700">
                <p><span className="font-medium">Nama Penerima:</span> PT. Injapan Shop</p>
                <p><span className="font-medium">Nomor Rekening:</span> 1234567890 (BCA)</p>
              </div>
            )}
            
            {order.customer_info.payment_method === 'Bank Transfer (Yucho / ゆうちょ銀行)' && (
              <div className="mt-2 text-blue-700">
                <p><span className="font-medium">Nama Penerima:</span> イジャパンショップ</p>
                <p><span className="font-medium">Nomor Rekening:</span> 9876543210</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Section */}
      {order.customer_info.notes && (
        <div className="mb-8 page-break-avoid">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Catatan Pesanan:</h4>
            <p className="text-yellow-700">{order.customer_info.notes}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-6 text-center page-break-avoid">
        <p className="text-gray-600 mb-2">
          Terima kasih telah berbelanja di Injapan Food!
        </p>
        <p className="text-gray-600 mb-4">
          Untuk pertanyaan lebih lanjut, hubungi kami melalui WhatsApp: +817084894699
        </p>
        <div className="text-xs text-gray-500">
          <p>Invoice ini dibuat secara otomatis oleh sistem Injapan Food</p>
          <p>
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
  );
};

export default Invoice;