export const generateInvoicePDF = async (element: HTMLElement | null, invoiceNumber: string) => {
  if (!element) {
    console.error('Element not found for PDF generation');
    return;
  }

  try {
    // Import html2canvas and jsPDF dynamically
    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    // Configure html2canvas options for better quality
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions - A4 size
    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = 297; // A4 height in mm
    
    // Calculate image dimensions to fit A4
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add image to PDF, centered and scaled to fit
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pdfHeight));
    
    // Download the PDF
    pdf.save(`Invoice-${invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Fallback: open print dialog
    window.print();
  }
};