import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllShippingRates, 
  getShippingRateByPrefecture, 
  addShippingRate, 
  updateShippingRate, 
  deleteShippingRate 
} from '@/services/shippingService';
import { ShippingRate } from '@/types';

export const useShippingRates = () => {
  return useQuery({
    queryKey: ['shipping-rates'],
    queryFn: getAllShippingRates,
  });
};

export const useShippingRateByPrefecture = (prefectureId: string) => {
  return useQuery({
    queryKey: ['shipping-rate', prefectureId],
    queryFn: () => getShippingRateByPrefecture(prefectureId),
    enabled: !!prefectureId,
  });
};

export const useAddShippingRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shippingRateData: Omit<ShippingRate, 'id' | 'created_at' | 'updated_at'>) => 
      addShippingRate(shippingRateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
    },
  });
};

export const useUpdateShippingRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ShippingRate> }) => 
      updateShippingRate(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
      queryClient.invalidateQueries({ queryKey: ['shipping-rate', variables.updates.prefecture_id] });
    },
  });
};

export const useDeleteShippingRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteShippingRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipping-rates'] });
    },
  });
};