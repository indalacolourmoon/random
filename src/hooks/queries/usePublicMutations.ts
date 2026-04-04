'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitContactMessage } from '@/actions/messages';
import { submitPaper } from '@/actions/submit-paper';
import { submitReviewerApplication } from '@/actions/reviewer';
import { toast } from 'sonner';

export function useContactMutation() {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await submitContactMessage(formData);
            if (!result.success) throw new Error(result.error || 'Failed to send message');
            return result;
        },
        onError: (error: Error) => {
            toast.error('Transmission Error', {
                description: error instanceof Error ? error.message : String(error)
            });
        }
    });
}

export function useSubmissionMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await submitPaper(formData);
            if (!result.success) throw new Error(result.error || 'Failed to submit manuscript');
            return result;
        },
        onSuccess: () => {
            // Invalidate archives since a new paper might be published (though usually it requires approval first)
            queryClient.invalidateQueries({ queryKey: ['public', 'archives'] });
        },
        onError: (error: Error) => {
            toast.error('Submission Failed', {
                description: error instanceof Error ? error.message : String(error)
            });
        }
    });
}

export function useReviewerApplicationMutation() {
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const result = await submitReviewerApplication(formData);
            if (!result.success) throw new Error(result.error || 'Failed to submit application');
            return result;
        },
        onError: (error: Error) => {
            toast.error('Application Error', {
                description: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
