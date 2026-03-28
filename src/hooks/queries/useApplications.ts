import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, approveApplication, rejectApplication } from '@/actions/applications';

export function useApplications() {
    return useQuery<any[]>({
        queryKey: ['applications'],
        queryFn: async () => {
            const data = await getApplications();
            return data || [];
        }
    });
}

export function useApproveApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => approveApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}

export function useRejectApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => rejectApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}
