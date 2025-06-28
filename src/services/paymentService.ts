import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';

const PAYMENT_PROOFS_COLLECTION = 'payment_proofs';
const STORAGE_FOLDER = 'payment-proofs';

export interface PaymentProof {
  id?: string;
  user_id?: string;
  nama: string;
  email: string;
  invoice_id: string;
  metode_pembayaran: string;
  bukti_url: string;
  uploaded_at: string;
  status: 'Menunggu' | 'Terverifikasi' | 'Ditolak';
  notes?: string;
  verified_at?: string;
  rejected_at?: string;
}

export const getAllPaymentProofs = async (): Promise<PaymentProof[]> => {
  try {
    const paymentProofsRef = collection(db, PAYMENT_PROOFS_COLLECTION);
    const q = query(paymentProofsRef, orderBy('uploaded_at', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentProof));
  } catch (error) {
    console.error('Error fetching payment proofs:', error);
    throw error;
  }
};

export const getPaymentProofsByStatus = async (status: string): Promise<PaymentProof[]> => {
  try {
    const paymentProofsRef = collection(db, PAYMENT_PROOFS_COLLECTION);
    const q = query(
      paymentProofsRef,
      where('status', '==', status),
      orderBy('uploaded_at', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentProof));
  } catch (error) {
    console.error('Error fetching payment proofs by status:', error);
    throw error;
  }
};

export const getPaymentProofsByUser = async (userId: string): Promise<PaymentProof[]> => {
  try {
    const paymentProofsRef = collection(db, PAYMENT_PROOFS_COLLECTION);
    const q = query(
      paymentProofsRef,
      where('user_id', '==', userId),
      orderBy('uploaded_at', 'desc')
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as PaymentProof));
  } catch (error) {
    console.error('Error fetching payment proofs by user:', error);
    throw error;
  }
};

export const getPaymentProofByInvoice = async (invoiceId: string): Promise<PaymentProof | null> => {
  try {
    const paymentProofsRef = collection(db, PAYMENT_PROOFS_COLLECTION);
    const q = query(paymentProofsRef, where('invoice_id', '==', invoiceId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as PaymentProof;
  } catch (error) {
    console.error('Error fetching payment proof by invoice:', error);
    throw error;
  }
};

export const uploadPaymentProof = async (
  file: File,
  paymentData: Omit<PaymentProof, 'id' | 'bukti_url' | 'uploaded_at'>
): Promise<string> => {
  try {
    // Upload file to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storageRef = ref(storage, `${STORAGE_FOLDER}/${fileName}`);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Create payment proof document
    const paymentProofsRef = collection(db, PAYMENT_PROOFS_COLLECTION);
    const docRef = await addDoc(paymentProofsRef, {
      ...paymentData,
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

export const verifyPaymentProof = async (paymentId: string): Promise<void> => {
  try {
    const paymentRef = doc(db, PAYMENT_PROOFS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      status: 'Terverifikasi',
      verified_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying payment proof:', error);
    throw error;
  }
};

export const rejectPaymentProof = async (paymentId: string, reason: string): Promise<void> => {
  try {
    const paymentRef = doc(db, PAYMENT_PROOFS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      status: 'Ditolak',
      notes: reason,
      rejected_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error rejecting payment proof:', error);
    throw error;
  }
};

export const updatePaymentProofInvoiceId = async (paymentProofId: string, invoiceId: string): Promise<void> => {
  try {
    const paymentRef = doc(db, PAYMENT_PROOFS_COLLECTION, paymentProofId);
    await updateDoc(paymentRef, {
      invoice_id: invoiceId,
      updated_at: new Date().toISOString() // Add updated_at for consistency
    });
    console.log(`Payment proof ${paymentProofId} updated with invoice ID ${invoiceId}`);
  } catch (error) {
    console.error('Error updating payment proof invoice ID:', error);
    throw error;
  }
};