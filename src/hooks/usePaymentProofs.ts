import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getAllPaymentProofs, 
  getPaymentProofsByStatus, 
  getPaymentProofsByUser,
  getPaymentProofByInvoice,
  verifyPaymentProof,
  rejectPaymentProof,
  uploadPaymentProof,
  PaymentProof
} from '@/services/paymentService';

export const usePaymentProofs = () => {
  return useQuery({
    queryKey: ['payment-proofs'],
    queryFn: getAllPaymentProofs,
    staleTime: 60000, // 1 minute
  });
};

export const usePaymentProofsByStatus = (status: string) => {
  return useQuery({
    queryKey: ['payment-proofs', 'status', status],
    queryFn: () => getPaymentProofsByStatus(status),
    staleTime: 60000, // 1 minute
    enabled: !!status,
  });
};

export const usePaymentProofsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['payment-proofs', 'user', userId],
    queryFn: () => getPaymentProofsByUser(userId),
    staleTime: 60000, // 1 minute
    enabled: !!userId,
  });
};

export const usePaymentProofByInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['payment-proof', 'invoice', invoiceId],
    queryFn: () => getPaymentProofByInvoice(invoiceId),
    staleTime: 60000, // 1 minute
    enabled: !!invoiceId,
  });
};

export const useVerifyPaymentProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) => verifyPaymentProof(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-proofs'] });
    },
  });
};

export const useRejectPaymentProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) => 
      rejectPaymentProof(paymentId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-proofs'] });
    },
  });
};

export const useUploadPaymentProof = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      file, 
      paymentData 
    }: { 
      file: File; 
      paymentData: Omit<PaymentProof, 'id' | 'bukti_url' | 'uploaded_at'> 
    }) => uploadPaymentProof(file, paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-proofs'] });
    },
  });
};