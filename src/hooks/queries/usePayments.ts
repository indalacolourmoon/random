import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPayments,
    getAcceptedUnpaidPapers,
    updatePaymentStatus,
    initializePayment
} from '@/actions/payments';

export function usePayments() {
    return useQuery<any[]>({
        queryKey: ['payments'],
        queryFn: async () => {
            return await getPayments();
        },
    });
}

export function useUnpaidPapers() {
    return useQuery<any[]>({
        queryKey: ['unpaid-papers'],
        queryFn: async () => {
            return await getAcceptedUnpaidPapers();
        },
    });
}

export function useInitializePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ submissionId, amount, currency }: { submissionId: number; amount: number; currency: string }) => {
            return await initializePayment(submissionId, amount, currency);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['unpaid-papers'] });
        },
    });
}

export function useUpdatePaymentStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status, transactionId }: { id: number; status: string; transactionId: string }) => {
            return await updatePaymentStatus(id, status, transactionId);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['payments'] });
            }
        },
    });
}
