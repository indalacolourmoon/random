import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, submitReview } from '@/actions/reviews';

export interface ReviewAssignment {
    id: number;
    status: 'assigned' | 'completed' | 'withdrawn';
    assigned_at: string;
    deadline: string;
    review_round: number;
    submission_id: number;
    paper_id: string;
    title: string;
    reviewer_name: string;
    decision?: string | null;
    comments_to_author?: string | null;
    review_submitted_at?: string | null;
    manuscript_path?: string | null;
    feedback_file_path?: string | null;
    submission_status: string;
}

export interface UnassignedPaper {
    id: number;
    paper_id: string;
    title: string;
    pdf_url: string | null;
}

export function useActiveReviews(reviewerId?: string) {
    return useQuery<ReviewAssignment[]>({
        queryKey: ['reviews', reviewerId],
        queryFn: async () => {
            const data = await getActiveReviews(reviewerId);
            return (data as ReviewAssignment[]) || [];
        }
    });
}

export function useUnassignedPapers() {
    return useQuery<UnassignedPaper[]>({
        queryKey: ['unassignedPapers'],
        queryFn: async () => {
            const data = await getUnassignedAcceptedPapers();
            return (data as UnassignedPaper[]) || [];
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

export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ assignmentId, formData }: { assignmentId: number, formData: FormData }) => submitReview(assignmentId, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        }
    });
}
