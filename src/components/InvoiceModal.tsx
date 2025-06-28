import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import { Order } from '@/types';
import Invoice from './Invoice';
import { generateInvoiceNumber } from '@/utils/invoiceUtils';
import { generateInvoicePDF } from '@/utils/pdfUtils';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const InvoiceModal = ({ isOpen, onClose, order }: InvoiceModalProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceNumber = generateInvoiceNumber(order.id, order.created_at);

  const handleDownloadPDF = async () => {
    try {
      await generateInvoicePDF(invoiceRef.current, invoiceNumber);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handlePrint = () => {
    const printContent = invoiceRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              margin: 0; 
              padding: 0; 
              background: white;
              width: 210mm;
              height: 297mm;
            }
            .print-container {
              width: 100%;
              padding: 10mm;
              box-sizing: border-box;
            }
            .page-break-avoid {
              page-break-inside: avoid;
            }
            .invoice-header {
              margin-bottom: 10px;
            }
            .invoice-table {
              font-size: 10px;
              width: 100%;
              border-collapse: collapse;
            }
            .invoice-table th, .invoice-table td {
              padding: 4px 8px;
              border: 1px solid #d1d5db;
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
            /* Additional print-specific styles */
            .max-w-4xl { max-width: 100%; }
            .mx-auto { margin-left: auto; margin-right: auto; }
            .bg-white { background-color: white; }
            .p-8 { padding: 2rem; }
            .shadow-lg { box-shadow: none; }
            .border-b-2 { border-bottom-width: 2px; }
            .border-gray-200 { border-color: #e5e7eb; }
            .pb-6 { padding-bottom: 1.5rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            .mb-8 { margin-bottom: 2rem; }
            .flex { display: flex; }
            .items-center { align-items: center; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .space-x-4 > * + * { margin-left: 1rem; }
            .space-x-8 > * + * { margin-left: 2rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-3 > * + * { margin-top: 0.75rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .w-16 { width: 4rem; }
            .h-16 { width: 4rem; }
            .w-24 { width: 6rem; }
            .w-64 { width: 16rem; }
            .w-full { width: 100%; }
            .rounded-lg { border-radius: 0.5rem; }
            .overflow-hidden { overflow: hidden; }
            .object-cover { object-fit: cover; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-xs { font-size: 0.75rem; line-height: 1rem; }
            .font-bold { font-weight: 700; }
            .font-semibold { font-weight: 600; }
            .font-medium { font-weight: 500; }
            .text-gray-900 { color: #111827; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-700 { color: #374151; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-500 { color: #6b7280; }
            .text-red-600 { color: #dc2626; }
            .text-yellow-800 { color: #92400e; }
            .text-yellow-700 { color: #a16207; }
            .text-blue-800 { color: #1e40af; }
            .text-green-800 { color: #166534; }
            .text-green-700 { color: #15803d; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .mt-1 { margin-top: 0.25rem; }
            .mt-4 { margin-top: 1rem; }
            .mr-2 { margin-right: 0.5rem; }
            .grid { display: grid; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .gap-4 { gap: 1rem; }
            .border { border-width: 1px; }
            .border-t { border-top-width: 1px; }
            .border-t-2 { border-top-width: 2px; }
            .border-collapse { border-collapse: collapse; }
            .border-gray-300 { border-color: #d1d5db; }
            .px-4 { padding-left: 1rem; padding-right: 1rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .pt-3 { padding-top: 0.75rem; }
            .pt-4 { padding-top: 1rem; }
            .pt-6 { padding-top: 1.5rem; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-yellow-50 { background-color: #fffbeb; }
            .bg-green-50 { background-color: #f0fdf4; }
            .bg-blue-100 { background-color: #dbeafe; }
            .bg-green-100 { background-color: #dcfce7; }
            .bg-yellow-100 { background-color: #fef3c7; }
            .border-yellow-200 { border-color: #fde68a; }
            .border-green-200 { border-color: #bbf7d0; }
            .overflow-x-auto { overflow-x: auto; }
            .font-mono { font-family: ui-monospace, SFMono-Regular, monospace; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Invoice #{invoiceNumber}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownloadPDF}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div ref={invoiceRef}>
          <Invoice order={order} invoiceNumber={invoiceNumber} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;