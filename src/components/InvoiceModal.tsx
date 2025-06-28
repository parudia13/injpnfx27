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
              padding: 15mm;
              box-sizing: border-box;
            }
            .page-break-avoid {
              page-break-inside: avoid;
            }
            table {
              page-break-inside: avoid;
              width: 100%;
              border-collapse: collapse;
            }
            tr {
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            .flex {
              display: flex;
            }
            .justify-between {
              justify-content: space-between;
            }
            .items-center {
              align-items: center;
            }
            .space-x-4 > * + * {
              margin-left: 1rem;
            }
            .border-b-2 {
              border-bottom-width: 2px;
            }
            .border-gray-200 {
              border-color: #e5e7eb;
            }
            .pb-4 {
              padding-bottom: 1rem;
            }
            .mb-6 {
              margin-bottom: 1.5rem;
            }
            .text-2xl {
              font-size: 1.5rem;
            }
            .text-4xl {
              font-size: 2.25rem;
            }
            .font-bold {
              font-weight: 700;
            }
            .text-gray-900 {
              color: #111827;
            }
            .text-gray-600 {
              color: #4b5563;
            }
            .text-red-600 {
              color: #dc2626;
            }
            .text-right {
              text-align: right;
            }
            .w-16 {
              width: 4rem;
            }
            .h-16 {
              height: 4rem;
            }
            .rounded-lg {
              border-radius: 0.5rem;
            }
            .overflow-hidden {
              overflow: hidden;
            }
            .object-cover {
              object-fit: cover;
            }
            .grid {
              display: grid;
            }
            .grid-cols-2 {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .gap-8 {
              gap: 2rem;
            }
            .bg-gray-50 {
              background-color: #f9fafb;
            }
            .p-4 {
              padding: 1rem;
            }
            .text-lg {
              font-size: 1.125rem;
            }
            .font-semibold {
              font-weight: 600;
            }
            .mb-3 {
              margin-bottom: 0.75rem;
            }
            .space-y-2 > * + * {
              margin-top: 0.5rem;
            }
            .font-medium {
              font-weight: 500;
            }
            .w-64 {
              width: 16rem;
            }
            .border {
              border-width: 1px;
            }
            .border-t {
              border-top-width: 1px;
            }
            .pt-2 {
              padding-top: 0.5rem;
            }
            .mt-2 {
              margin-top: 0.5rem;
            }
            .text-xl {
              font-size: 1.25rem;
            }
            .text-center {
              text-align: center;
            }
            .text-xs {
              font-size: 0.75rem;
            }
            .text-yellow-800 {
              color: #92400e;
            }
            .text-yellow-700 {
              color: #a16207;
            }
            .bg-yellow-50 {
              background-color: #fffbeb;
            }
            .border-yellow-200 {
              border-color: #fde68a;
            }
            .pt-6 {
              padding-top: 1.5rem;
            }
            .mb-2 {
              margin-bottom: 0.5rem;
            }
            .mb-4 {
              margin-bottom: 1rem;
            }
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