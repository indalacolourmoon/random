import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, deleteUser } from '@/actions/users';

export function useUsers(role?: string) {
    return useQuery<any[]>({
        queryKey: ['users', role],
        queryFn: async () => {
            const data = await getUsers();
            if (role) return data.filter((u: any) => u.role === role);
            return data;
        },
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            return await createUser(formData);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['users'] });
            }
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteUser(id);
        },
        onSuccess: (data) => {
            if (!data?.error) {
                queryClient.invalidateQueries({ queryKey: ['users'] });
            }
        },
    });
}
