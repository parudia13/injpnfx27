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

  const fetchExchangeRate = () => {
    setIsLoading(true);
    setError(null);
    
    // Use exchangerate.host API to get JPY to IDR conversion rate
    fetch('https://api.exchangerate.host/convert?from=JPY&to=IDR')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          const rate = data.info.rate;
          setExchangeRate(rate);
          const rupiah = yenAmount * rate;
          setConvertedRupiah(Math.round(rupiah));
          setLastFetchTime(Date.now());
        } else {
          throw new Error('Failed to get exchange rate');
        }
      })
      .catch(err => {
        console.error('Failed to convert currency:', err);
        setError('Failed to get exchange rate. Using fallback rate.');
        
        // Fallback to approximate rate if API fails (1 JPY ≈ 100 IDR)
        const fallbackRate = 100;
        setExchangeRate(fallbackRate);
        setConvertedRupiah(Math.round(yenAmount * fallbackRate));
      })
      .finally(() => {
        setIsLoading(false);
      });
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