import { useState, useEffect } from 'react';

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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const fetchExchangeRate = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try primary API first
      const response = await fetch('https://api.exchangerate.host/latest?base=JPY&symbols=IDR');
      
      if (!response.ok) {
        throw new Error('Primary API failed');
      }
      
      const data = await response.json();
      
      if (data.rates && data.rates.IDR) {
        const rate = data.rates.IDR;
        setExchangeRate(rate);
        const rupiah = yenAmount * rate;
        setConvertedRupiah(Math.round(rupiah));
        setLastFetchTime(Date.now());
        setIsLoading(false);
      } else {
        throw new Error('Failed to get exchange rate from primary API');
      }
    } catch (primaryError) {
      console.error('Primary API error:', primaryError);
      
      try {
        // Try backup API if primary fails
        const backupResponse = await fetch('https://open.er-api.com/v6/latest/JPY');
        
        if (!backupResponse.ok) {
          throw new Error('Backup API failed');
        }
        
        const backupData = await backupResponse.json();
        
        if (backupData.rates && backupData.rates.IDR) {
          const backupRate = backupData.rates.IDR;
          setExchangeRate(backupRate);
          const rupiah = yenAmount * backupRate;
          setConvertedRupiah(Math.round(rupiah));
          setLastFetchTime(Date.now());
          setIsLoading(false);
        } else {
          throw new Error('Invalid data from backup API');
        }
      } catch (backupError) {
        console.error('Backup API error:', backupError);
        
        // Use fallback rate if both APIs fail
        setError('Failed to get exchange rate. Using fallback rate.');
        const fallbackRate = 100; // Approximate rate: 1 JPY ≈ 100 IDR
        setExchangeRate(fallbackRate);
        setConvertedRupiah(Math.round(yenAmount * fallbackRate));
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Only fetch exchange rate if payment method is bank transfer in Rupiah
    if (paymentMethod === 'Bank Transfer (Rupiah)') {
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
      
      // Fetch new rate if we don't have one or if it's older than 1 hour
      if (!exchangeRate || (now - lastFetchTime) > ONE_HOUR) {
        fetchExchangeRate();
      } else if (exchangeRate) {
        // Use cached rate if we have one and it's recent
        setConvertedRupiah(Math.round(yenAmount * exchangeRate));
      }
    } else {
      setConvertedRupiah(null);
      setIsLoading(false);
      setError(null);
    }
  }, [yenAmount, paymentMethod, exchangeRate, lastFetchTime]);

  return { 
    convertedRupiah, 
    isLoading, 
    error,
    refreshRate: fetchExchangeRate 
  };
};