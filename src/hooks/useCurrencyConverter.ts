import { useState, useEffect } from 'react';

/**
 * Custom hook to convert JPY to IDR using exchange rate API
 * @param yenAmount - Amount in Japanese Yen
 * @param paymentMethod - Selected payment method
 * @returns Converted amount in Indonesian Rupiah or null if not applicable
 */
export const useCurrencyConverter = (yenAmount: number, paymentMethod: string) => {
  const [convertedRupiah, setConvertedRupiah] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch exchange rate if payment method is bank transfer in Rupiah
    if (paymentMethod === 'Bank Transfer (Rupiah)') {
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
            const rupiah = yenAmount * rate;
            setConvertedRupiah(Math.round(rupiah));
          } else {
            throw new Error('Failed to get exchange rate');
          }
        })
        .catch(err => {
          console.error('Failed to convert currency:', err);
          setError('Failed to get exchange rate. Using fallback rate.');
          
          // Fallback to approximate rate if API fails (1 JPY ≈ 100 IDR)
          const fallbackRate = 100;
          setConvertedRupiah(Math.round(yenAmount * fallbackRate));
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setConvertedRupiah(null);
      setIsLoading(false);
      setError(null);
    }
  }, [yenAmount, paymentMethod]);

  return { convertedRupiah, isLoading, error };
};