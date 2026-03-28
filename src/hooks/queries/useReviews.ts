import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, uploadReviewFeedback } from '@/actions/reviews';

export function useActiveReviews(reviewerId?: number) {
    return useQuery<any[]>({
        queryKey: ['reviews', reviewerId],
        queryFn: async () => {
            const data = await getActiveReviews(reviewerId);
            return data || [];
        }
    });
}

export function useUnassignedPapers() {
    return useQuery<any[]>({
        queryKey: ['unassignedPapers'],
        queryFn: async () => {
            const data = await getUnassignedAcceptedPapers();
            return data || [];
        }
    });
}

export function useAssignReviewer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => assignReviewer(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            queryClient.invalidateQueries({ queryKey: ['unassignedPapers'] });
        }
    });
}

export function useUploadReviewFeedback() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ reviewId, formData }: { reviewId: number, formData: FormData }) => uploadReviewFeedback(reviewId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        }
    });
}
