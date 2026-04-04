import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '@/actions/settings';

export function useSettings() {
    return useQuery<Record<string, string>>({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await getSettings();
            return res.success ? res.data ?? {} : {};
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            return await updateSettings(formData);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['settings'] });
            }
        },
    });
}
