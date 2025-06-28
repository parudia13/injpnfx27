import { useQuery } from '@tanstack/react-query';
import { getPendingOrders } from '@/services/orderService';

export const usePendingOrders = () => {
  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: getPendingOrders,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
};