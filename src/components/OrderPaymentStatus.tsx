import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useState } from 'react';

interface OrderPaymentStatusProps {
  status: 'pending' | 'verified' | 'rejected';
  paymentProofUrl?: string | null;
  onViewProof?: () => void;
}

const OrderPaymentStatus = ({ 
  status, 
  paymentProofUrl, 
  onViewProof 
}: OrderPaymentStatusProps) => {
  const [showProof, setShowProof] = useState(false);

  const handleViewProof = () => {
    if (onViewProof) {
      onViewProof();
    } else {
      setShowProof(true);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Menunggu Verifikasi</span>
          </Badge>
        );
      case 'verified':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Pembayaran Terverifikasi</span>
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Pembayaran Ditolak</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-700">Status Pembayaran:</div>
        {getStatusBadge()}
      </div>
      
      {paymentProofUrl && (
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewProof}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Lihat Bukti Pembayaran
          </Button>
          
          {showProof && !onViewProof && (
            <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50" onClick={() => setShowProof(false)}>
              <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProof(false)}
                  className="absolute -top-12 right-0 text-white bg-black bg-opacity-50 hover:bg-opacity-70"
                >
                  ✕ Close
                </Button>
                <img 
                  src={paymentProofUrl} 
                  alt="Bukti Pembayaran" 
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
          )}
        </div>
      )}
      
      {status === 'pending' && !paymentProofUrl && (
        <p className="text-sm text-yellow-600">
          Belum ada bukti pembayaran yang diunggah
        </p>
      )}
      
      {status === 'rejected' && (
        <p className="text-sm text-red-600">
          Pembayaran ditolak. Silakan hubungi admin untuk informasi lebih lanjut.
        </p>
      )}
    </div>
  );
};

export default OrderPaymentStatus;