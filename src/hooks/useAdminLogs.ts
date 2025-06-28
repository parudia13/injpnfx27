import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLog } from '@/types';

// Mock data untuk admin logs
const mockAdminLogs: AdminLog[] = [
  {
    id: '1',
    user_id: 'user-1', // Fixed: added required user_id
    admin_id: 'admin-1',
    action: 'Product created',
    target_type: 'product',
    target_id: 'prod-1',
    details: {},
    created_at: new Date().toISOString()
  }
];

export const useAdminLogs = () => {
  return useQuery({
    queryKey: ['admin-logs'],
    queryFn: async (): Promise<AdminLog[]> => {
      // Return mock data instead of Supabase query
      return mockAdminLogs;
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Refetch every minute
    refetchIntervalInBackground: false, // Don't refetch when tab is not active
  });
};

export const useLogAdminAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (logData: {
      action: string;
      target_type: string;
      target_id?: string;
      details?: any;
    }) => {
      // Mock implementation - in real app this would log to your preferred system
      console.log('Admin action logged:', logData);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-logs'] });
    },
  });
};