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
            body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              font-size: 12px;
            }
            .print-container {
              width: 100%;
              max-width: 100%;
              padding: 10mm;
              margin: 0;
              box-shadow: none;
              page-break-after: always;
            }
            .page-break-avoid {
              page-break-inside: avoid;
            }
            .invoice-header {
              margin-bottom: 10px;
            }
            .invoice-table {
              font-size: 10px;
            }
            .invoice-table th, .invoice-table td {
              padding: 4px 8px;
            }
            .invoice-footer {
              margin-top: 10px;
              font-size: 10px;
            }
            .invoice-total {
              margin-top: 10px;
              page-break-inside: avoid;
            }
            .compact-text {
              font-size: 10px;
              line-height: 1.2;
            }
            .compact-address {
              max-width: 150px;
              word-break: break-word;
            }
          }
        `}
      </style>

      {/* Header */}
      <div className="border-b-2 border-gray-200 pb-4 mb-4 page-break-avoid invoice-header">
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
        
        <div className="mt-2 text-center border-t pt-2">
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
      <div className="grid grid-cols-2 gap-4 mb-4 page-break-avoid">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Invoice</h3>
          <div className="space-y-1 text-sm">
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
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Informasi Penerima</h3>
          <div className="space-y-1 text-sm">
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
              <div className="text-gray-700 compact-address">
                {order.customer_info.address}
                {order.customer_info.prefecture && (
                  <>, {order.customer_info.prefecture}</>
                )}
                {order.customer_info.postal_code && (
                  <>, 〒{order.customer_info.postal_code}</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-4 page-break-avoid">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Detail Pesanan</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 invoice-table">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">No.</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Produk</th>
                <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Qty</th>
                <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Harga Satuan</th>
                <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-2">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="text-xs text-gray-600">
                          {Object.entries(item.selectedVariants).map(([type, value]) => `${type}: ${value}`).join(', ')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">{formatPrice(item.price)}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Section */}
      <div className="flex justify-end mb-4 invoice-total page-break-avoid">
        <div className="w-64">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span>{formatPrice(order.total_price - (order.shipping_fee || 0))}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Ongkos Kirim:</span>
                <span>{order.shipping_fee ? formatPrice(order.shipping_fee) : 'Akan dikonfirmasi'}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-bold text-red-600">
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
        <div className="mb-4 space-y-2 page-break-avoid">
          {order.customer_info.notes && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-1 text-sm">Catatan Pesanan:</h4>
              <p className="text-yellow-700 text-xs">{order.customer_info.notes}</p>
            </div>
          )}
          
          {order.referralTransaction && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-1 text-sm">Kode Referral:</h4>
              <p className="text-green-700 text-xs font-mono">
                {order.referralTransaction.referral_code}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-gray-200 pt-4 invoice-footer page-break-avoid">
        <div className="text-center space-y-1 compact-text">
          <p className="text-gray-600">
            Terima kasih telah berbelanja di Injapan Food!
          </p>
          <p className="text-gray-600">
            Untuk pertanyaan lebih lanjut, hubungi kami melalui WhatsApp: +62 851-5545-2259
          </p>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-gray-500">
              Invoice ini dibuat secara otomatis oleh sistem Injapan Food
            </p>
            <p className="text-gray-500">
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