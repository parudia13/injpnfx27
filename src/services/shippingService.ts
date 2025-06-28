import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ShippingRate } from '@/types';

const SHIPPING_RATES_COLLECTION = 'shipping_rates';

export const getAllShippingRates = async (): Promise<ShippingRate[]> => {
  try {
    const shippingRatesRef = collection(db, SHIPPING_RATES_COLLECTION);
    const snapshot = await getDocs(shippingRatesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ShippingRate));
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    throw error;
  }
};

export const getShippingRateByPrefecture = async (prefectureId: string): Promise<ShippingRate | null> => {
  try {
    if (!prefectureId) {
      console.log('No prefecture ID provided');
      return null;
    }
    
    console.log('Fetching shipping rate for prefecture ID:', prefectureId);
    
    const shippingRatesRef = collection(db, SHIPPING_RATES_COLLECTION);
    const q = query(shippingRatesRef, where('prefecture_id', '==', prefectureId));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log('No shipping rate found for prefecture ID:', prefectureId);
      return null;
    }
    
    const data = snapshot.docs[0].data();
    console.log('Found shipping rate:', data);
    
    return {
      id: snapshot.docs[0].id,
      ...data
    } as ShippingRate;
  } catch (error) {
    console.error('Error fetching shipping rate:', error);
    throw error;
  }
};

export const addShippingRate = async (shippingRateData: Omit<ShippingRate, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    // Check if rate already exists for this prefecture
    const existingRate = await getShippingRateByPrefecture(shippingRateData.prefecture_id);
    
    if (existingRate) {
      throw new Error(`Shipping rate for ${shippingRateData.kanji} already exists`);
    }
    
    const shippingRateRef = collection(db, SHIPPING_RATES_COLLECTION);
    const timestamp = new Date().toISOString();
    
    const docRef = await addDoc(shippingRateRef, {
      ...shippingRateData,
      created_at: timestamp,
      updated_at: timestamp
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding shipping rate:', error);
    throw error;
  }
};

export const updateShippingRate = async (id: string, updates: Partial<ShippingRate>): Promise<void> => {
  try {
    const shippingRateRef = doc(db, SHIPPING_RATES_COLLECTION, id);
    
    await updateDoc(shippingRateRef, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating shipping rate:', error);
    throw error;
  }
};

export const deleteShippingRate = async (id: string): Promise<void> => {
  try {
    const shippingRateRef = doc(db, SHIPPING_RATES_COLLECTION, id);
    await deleteDoc(shippingRateRef);
  } catch (error) {
    console.error('Error deleting shipping rate:', error);
    throw error;
  }
};