import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Image } from 'lucide-react';
import { updatePaymentProof } from '@/services/orderService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';

interface PaymentProofUploaderProps {
  orderId: string;
  onSuccess?: () => void;
}

const PaymentProofUploader = ({ orderId, onSuccess }: PaymentProofUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(selectedFile.type)) {
      toast({
        title: "Format file tidak valid",
        description: "Harap unggah file gambar (JPG, PNG, WEBP, GIF)",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Ukuran file terlalu besar",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file || !orderId) return;

    setUploading(true);
    try {
      // Upload to Firebase Storage
      const storageRef = ref(storage, `payment-proofs/${orderId}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update order with payment proof URL
      await updatePaymentProof(orderId, downloadURL);

      toast({
        title: "Bukti Pembayaran Berhasil Diunggah",
        description: "Bukti pembayaran Anda telah diunggah dan menunggu verifikasi admin",
      });

      // Reset form
      setFile(null);
      setPreview(null);

      // Call success callback if provided
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      toast({
        title: "Gagal Mengunggah Bukti Pembayaran",
        description: "Terjadi kesalahan saat mengunggah bukti pembayaran. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="payment-proof" className="text-base font-medium">
          Unggah Bukti Pembayaran
        </Label>
        <p className="text-sm text-gray-600 mt-1 mb-3">
          Unggah bukti transfer atau pembayaran Anda untuk memverifikasi pesanan
        </p>

        {!preview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Input
              id="payment-proof"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Label
              htmlFor="payment-proof"
              className="flex flex-col items-center cursor-pointer"
            >
              <Image className="w-12 h-12 text-gray-400 mb-2" />
              <span className="text-sm font-medium text-gray-700">
                Klik untuk memilih file
              </span>
              <span className="text-xs text-gray-500 mt-1">
                JPG, PNG, WEBP, GIF (Maks. 5MB)
              </span>
            </Label>
          </div>
        ) : (
          <div className="relative border rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-64 object-contain"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemoveFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Mengunggah...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Unggah Bukti Pembayaran
          </>
        )}
      </Button>
    </div>
  );
};

export default PaymentProofUploader;