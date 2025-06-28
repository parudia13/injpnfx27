import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllOrders, getOrdersByUser, createOrder } from '@/services/orderService';
import { Order, CartItem } from '@/types';

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrders,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
};

export const useUserOrders = (userId: string) => {
  return useQuery({
    queryKey: ['orders', 'user', userId],
    queryFn: () => getOrdersByUser(userId),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: false, // Don't refetch in background
    retry: 3, // Retry failed requests
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      items,
      totalPrice,
      customerInfo,
      userId,
      shipping_fee
    }: {
      items: CartItem[];
      totalPrice: number;
      customerInfo: any;
      userId?: string;
      shipping_fee?: number;
    }) => {
      return await createOrder({
        user_id: userId,
        customer_info: customerInfo,
        items: items,
        total_price: totalPrice,
        status: 'pending',
        shipping_fee: shipping_fee
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['pending-orders'] });
    },
  });
};