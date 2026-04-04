import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, submitReview } from '@/actions/reviews';

export interface ReviewAssignment {
    id: number;
    status: 'assigned' | 'completed' | 'withdrawn';
    assignedAt: string;
    deadline: string;
    reviewRound: number;
    submissionId: number;
    paperId: string;
    title: string;
    reviewerName: string;
    decision?: string | null;
    commentsToAuthor?: string | null;
    submittedAt?: string | null;
    submissionStatus: string;
    manuscriptPath?: string;
    feedbackFilePath?: string;
}

export interface UnassignedPaper {
    id: number;
    paperId: string;
    title: string;
    pdfUrl?: string;
}

export function useActiveReviews(reviewerId?: string) {
    return useQuery<ReviewAssignment[]>({
        queryKey: ['reviews', reviewerId],
        queryFn: async () => {
            const res = await getActiveReviews(reviewerId);
            return res.success ? (res.data as ReviewAssignment[]) ?? [] : [];
        }
    });
}

export function useUnassignedPapers() {
    return useQuery<UnassignedPaper[]>({
        queryKey: ['unassignedPapers'],
        queryFn: async () => {
            const res = await getUnassignedAcceptedPapers();
            return res.success ? (res.data as UnassignedPaper[]) ?? [] : [];
        }
    });
}

export function useAssignReviewer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (formData: FormData) => assignReviewer(formData),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['reviews'] });
                queryClient.invalidateQueries({ queryKey: ['unassignedPapers'] });
            }
        }
    });
}

export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId, formData }: { assignmentId: number, formData: FormData }) => submitReview(assignmentId, formData),
        onSuccess: (res) => {
            if (res.success) {
                queryClient.invalidateQueries({ queryKey: ['reviews'] });
            }
        }
    });
}
