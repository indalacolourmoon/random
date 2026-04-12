import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, deleteUser, updateUserRole } from '@/actions/users';
import { SafeUserWithProfile } from '@/db/types';

export function useUsers(role?: string) {
    return useQuery<SafeUserWithProfile[]>({
        queryKey: ['users', role],
        queryFn: async () => {
            const res = await getUsers();
            if (!res.success) return [];
            const data = (res.data || []) as SafeUserWithProfile[];
            if (role) return data.filter((u: { role: string }) => u.role === role);
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

export function useUpdateUserRole() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: any }) => {
            return await updateUserRole(userId, role);
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
        mutationFn: async (id: string) => {
            return await deleteUser(id);
        },
        onSuccess: (data) => {
            if (!data?.error) {
                queryClient.invalidateQueries({ queryKey: ['users'] });
            }
        },
    });
}
