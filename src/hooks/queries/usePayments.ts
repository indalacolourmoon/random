import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getPayments,
    getAcceptedUnpaidPapers,
    updatePaymentStatus,
    initializePayment,
    PaymentRow,
    UnpaidPaperRow
} from '@/actions/payments';

export function usePayments() {
    return useQuery<PaymentRow[]>({
        queryKey: ['payments'],
        queryFn: async () => {
            const res = await getPayments();
            return res.success ? res.data ?? [] : [];
        },
    });
}

export function useUnpaidPapers() {
    return useQuery<UnpaidPaperRow[]>({
        queryKey: ['unpaid-papers'],
        queryFn: async () => {
            const res = await getAcceptedUnpaidPapers();
            return res.success ? res.data ?? [] : [];
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
        mutationFn: async ({ id, status, transactionId }: { id: number; status: 'pending' | 'paid' | 'verified' | 'failed' | 'waived'; transactionId?: string }) => {
            return await updatePaymentStatus(id, status, transactionId);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['payments'] });
            }
        },
    });
}
