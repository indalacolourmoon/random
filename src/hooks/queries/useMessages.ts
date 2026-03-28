import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, updateMessageStatus, deleteMessage } from '@/actions/messages';

export function useMessages() {
    return useQuery<any[]>({
        queryKey: ['messages'],
        queryFn: async () => {
            return await getMessages();
        },
    });
}

export function useUpdateMessageStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            return await updateMessageStatus(id, status);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteMessage(id);
        },
        onSuccess: (data) => {
            if (!data.error) {
                queryClient.invalidateQueries({ queryKey: ['messages'] });
            }
        },
    });
}
