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
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { ShippingRate } from '@/types';

const SHIPPING_RATES_COLLECTION = 'shipping_rates';

export const getAllShippingRates = async (): Promise<ShippingRate[]> => {
  try {
    const shippingRatesRef = collection(db, SHIPPING_RATES_COLLECTION);
    const q = query(shippingRatesRef, orderBy('prefecture'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ShippingRate));
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    throw error;
  }
};

export const getShippingRateByPrefecture = async (prefecture: string): Promise<ShippingRate | null> => {
  try {
    const shippingRatesRef = collection(db, SHIPPING_RATES_COLLECTION);
    const q = query(shippingRatesRef, where('prefecture', '==', prefecture));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    } as ShippingRate;
  } catch (error) {
    console.error('Error fetching shipping rate:', error);
    throw error;
  }
};

export const addShippingRate = async (shippingRateData: Omit<ShippingRate, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
  try {
    // Check if rate already exists for this prefecture
    const existingRate = await getShippingRateByPrefecture(shippingRateData.prefecture);
    
    if (existingRate) {
      throw new Error(`Shipping rate for ${shippingRateData.prefecture} already exists`);
    }
    
    const shippingRateRef = doc(collection(db, SHIPPING_RATES_COLLECTION));
    const timestamp = new Date().toISOString();
    
    await setDoc(shippingRateRef, {
      ...shippingRateData,
      created_at: timestamp,
      updated_at: timestamp
    });
    
    return shippingRateRef.id;
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