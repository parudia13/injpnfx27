import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to convert JPY to IDR using exchange rate API
 * @param yenAmount - Amount in Japanese Yen
 * @param paymentMethod - Selected payment method
 * @returns Object containing converted amount, loading state, and error
 */
export const useCurrencyConverter = (yenAmount: number, paymentMethod: string) => {
  const [convertedRupiah, setConvertedRupiah] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  
  // Use a ref to track if we're already fetching to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);
  
  // Use localStorage to cache the exchange rate and last fetch time
  const getCachedRate = () => {
    try {
      const cachedData = localStorage.getItem('exchange_rate_cache');
      if (cachedData) {
        const { rate, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // Return cached rate if it's less than 1 hour old
        if (now - timestamp < ONE_HOUR) {
          return rate;
        }
      }
    } catch (e) {
      console.warn('Error reading cached exchange rate:', e);
    }
    return null;
  };
  
  const setCachedRate = (rate: number) => {
    try {
      localStorage.setItem('exchange_rate_cache', JSON.stringify({
        rate,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Error caching exchange rate:', e);
    }
  };

  const fetchExchangeRate = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      // Try primary API first
      const response = await fetch('https://api.exchangerate.host/latest?base=JPY&symbols=IDR', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        // Add cache control to prevent browser caching
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get exchange rate from primary API');
      }
      
      const data = await response.json();
      
      if (data.rates && data.rates.IDR) {
        const rate = data.rates.IDR;
        setExchangeRate(rate);
        setCachedRate(rate);
        const rupiah = yenAmount * rate;
        setConvertedRupiah(Math.round(rupiah));
      } else {
        throw new Error('Invalid data from primary API');
      }
    } catch (primaryError) {
      console.warn('Primary API failed:', primaryError);
      
      try {
        // Try backup API if primary fails
        const backupResponse = await fetch('https://open.er-api.com/v6/latest/JPY', {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          cache: 'no-cache'
        });
        
        if (!backupResponse.ok) {
          throw new Error('Failed to get exchange rate from backup API');
        }
        
        const backupData = await backupResponse.json();
        
        if (backupData.rates && backupData.rates.IDR) {
          const backupRate = backupData.rates.IDR;
          setExchangeRate(backupRate);
          setCachedRate(backupRate);
          const rupiah = yenAmount * backupRate;
          setConvertedRupiah(Math.round(rupiah));
        } else {
          throw new Error('Invalid data from backup API');
        }
      } catch (backupError) {
        console.error('Both APIs failed:', backupError);
        
        // Use fallback rate if both APIs fail
        setError('Failed to get exchange rate. Using fallback rate.');
        const fallbackRate = 100; // Approximate rate: 1 JPY ≈ 100 IDR
        setExchangeRate(fallbackRate);
        const rupiah = yenAmount * fallbackRate;
        setConvertedRupiah(Math.round(rupiah));
      }
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  // Initial load effect - only runs when payment method changes to Rupiah
  useEffect(() => {
    // Only fetch exchange rate if payment method is bank transfer in Rupiah
    if (paymentMethod === 'Bank Transfer (Rupiah)') {
      // Try to get cached rate first
      const cachedRate = getCachedRate();
      
      if (cachedRate) {
        // Use cached rate if available
        setExchangeRate(cachedRate);
        const rupiah = yenAmount * cachedRate;
        setConvertedRupiah(Math.round(rupiah));
      } else {
        // Fetch new rate if no cached rate
        fetchExchangeRate();
      }
    } else {
      // Reset state if payment method is not Rupiah
      setConvertedRupiah(null);
      setIsLoading(false);
      setError(null);
    }
  }, [paymentMethod]);

  // Recalculation effect - only runs when yenAmount changes and we already have a rate
  useEffect(() => {
    if (exchangeRate && paymentMethod === 'Bank Transfer (Rupiah)') {
      setConvertedRupiah(Math.round(yenAmount * exchangeRate));
    }
  }, [yenAmount, exchangeRate, paymentMethod]);

  return { 
    convertedRupiah, 
    isLoading, 
    error,
    refreshRate: fetchExchangeRate 
  };
};