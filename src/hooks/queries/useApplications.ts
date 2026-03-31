import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, approveApplication, rejectApplication } from '@/actions/applications';

export function useApplications(filters?: { role?: string, status?: string, interest?: string }) {
    return useQuery<any[]>({
        queryKey: ['applications', filters],
        queryFn: async () => {
            const data = await getApplications(filters);
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
        mutationFn: ({ id, reason }: { id: number, reason: string }) => rejectApplication(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}
