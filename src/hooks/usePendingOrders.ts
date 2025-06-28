import { useQuery } from '@tanstack/react-query';
import { getPendingOrders } from '@/services/orderService';

export const usePendingOrders = () => {
  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: getPendingOrders,
    staleTime: 0, // Always consider data stale for real-time updates
    // Remove the automatic refetching that's causing reloads
    // refetchInterval: 2000, // Refetch every 2 seconds
    // refetchIntervalInBackground: true, // Continue refetching when tab is not active
  });
};