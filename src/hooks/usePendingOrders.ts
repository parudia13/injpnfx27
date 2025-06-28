import { useQuery } from '@tanstack/react-query';
import { getPendingOrders } from '@/services/orderService';

export const usePendingOrders = () => {
  return useQuery({
    queryKey: ['pending-orders'],
    queryFn: getPendingOrders,
    staleTime: 60000, // 1 minute
    // Removed automatic refetching that was causing reloads
  });
};