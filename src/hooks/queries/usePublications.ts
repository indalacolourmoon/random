import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVolumesIssues,
    createVolumeIssue,
    publishIssue,
    getPapersByIssueId,
    unassignPaperFromIssue,
    updateVolumeIssue,
    deleteVolumeIssue
} from '@/actions/publications';
import { assignPaperToIssue } from '@/actions/publications';

export function useVolumesIssues() {
    return useQuery<any[]>({
        queryKey: ['volumes-issues'],
        queryFn: async () => {
            return await getVolumesIssues();
        },
    });
}

export function usePapersByIssue(issueId: number | null) {
    return useQuery<any[]>({
        queryKey: ['issue-papers', issueId],
        queryFn: async () => {
            if (!issueId) return [];
            return await getPapersByIssueId(issueId);
        },
        enabled: !!issueId,
    });
}

export function useCreateVolumeIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            return await createVolumeIssue(formData);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
            }
        },
    });
}

export function useUpdateVolumeIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
            return await updateVolumeIssue(id, formData);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
            }
        },
    });
}

export function useDeleteVolumeIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteVolumeIssue(id);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
            }
        },
    });
}

export function usePublishIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            return await publishIssue(id);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
            }
        },
    });
}

export function useUnassignPaper() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (paperId: number) => {
            return await unassignPaperFromIssue(paperId);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['issue-papers'] });
                queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
            }
        },
    });
}

export function useAssignPaperToIssue() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ submissionId, issueId, startPage, endPage }: { submissionId: number; issueId: number; startPage?: number; endPage?: number }) => {
            return await assignPaperToIssue(submissionId, issueId, startPage, endPage);
        },
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: ['volumes-issues'] });
                queryClient.invalidateQueries({ queryKey: ['submissions'] });
            }
        },
    });
}
