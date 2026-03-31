import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, updateMessageStatus, bulkUpdateMessageStatus, revertMessageStatus, deleteMessage } from '@/actions/messages';

export function useMessages(filters?: { status?: string, search?: string }) {
    return useQuery<any[]>({
        queryKey: ['messages', filters],
        queryFn: async () => {
            const data = await getMessages(filters);
            return data || [];
        }
    });
}

export function useUpdateMessageStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number, status: 'resolved' | 'archived' | 'read' }) => 
            updateMessageStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useBulkUpdateMessages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, status }: { ids: number[], status: 'resolved' | 'archived' | 'read' }) => 
            bulkUpdateMessageStatus(ids, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useRevertMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => revertMessageStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}
      
