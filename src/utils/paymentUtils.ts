import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, storage } from '@/config/firebase';

// Upload payment proof to Firebase Storage and save metadata to Firestore
export const uploadPaymentProofToFirebase = async (
  file: File,
  userData: {
    userId?: string;
    name: string;
    email: string;
    invoiceId: string;
    paymentMethod: string;
  }
): Promise<string> => {
  try {
    // 1. Upload file to Firebase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `payment_proof_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `payment-proofs/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // 2. Save metadata to Firestore
    const paymentProofsRef = collection(db, 'payment_proofs');
    const docRef = await addDoc(paymentProofsRef, {
      user_id: userData.userId || null,
      nama: userData.name,
      email: userData.email,
      invoice_id: userData.invoiceId,
      metode_pembayaran: userData.paymentMethod,
      bukti_url: downloadURL,
      uploaded_at: new Date().toISOString(),
      status: 'Menunggu'
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error uploading payment proof:', error);
    throw error;
  }
};

// Helper function to format payment method for display
export const formatPaymentMethod = (method: string): string => {
  switch (method) {
    case 'Bank Transfer (Rupiah)':
      return 'Transfer Bank (Rupiah)';
    case 'Bank Transfer (Yucho / ゆうちょ銀行)':
      return 'Transfer Yucho Bank';
    case 'COD (Cash on Delivery)':
      return 'COD (Bayar di Tempat)';
    default:
      return method;
  }
};