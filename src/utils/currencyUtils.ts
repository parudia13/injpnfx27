/**
 * Utility functions for currency conversion and formatting
 */

/**
 * Format a number as Indonesian Rupiah
 * @param amount - Amount to format
 * @returns Formatted string with Rp prefix
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format a number as Japanese Yen
 * @param amount - Amount to format
 * @returns Formatted string with ¥ prefix
 */
export const formatYen = (amount: number): string => {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Convert JPY to IDR using a fallback rate
 * @param yenAmount - Amount in Japanese Yen
 * @param rate - Exchange rate (default: 100)
 * @returns Converted amount in Indonesian Rupiah
 */
export const convertYenToRupiah = (yenAmount: number, rate: number = 100): number => {
  return Math.round(yenAmount * rate);
};

/**
 * Fallback function to convert JPY to IDR when API fails
 * Uses a conservative estimate of 1 JPY = 100 IDR
 * @param yenAmount - Amount in Japanese Yen
 * @returns Estimated amount in Indonesian Rupiah
 */
export const fallbackYenToRupiah = (yenAmount: number): number => {
  const fallbackRate = 100; // Conservative estimate: 1 JPY ≈ 100 IDR
  return Math.round(yenAmount * fallbackRate);
};