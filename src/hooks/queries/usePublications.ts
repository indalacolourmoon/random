import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Issue } from '@/db/types';
import {
    getVolumesIssues,
    createVolumeIssue,
    publishIssue,
    getPapersByIssueId,
    unassignPaperFromIssue,
    updateVolumeIssue,
    deleteVolumeIssue,
    assignPaperToIssue,
    PaperWithPublication
} from '@/actions/publications';

export function useVolumesIssues() {
    return useQuery<(Issue & { paperCount: number })[]>({
        queryKey: ['volumes-issues'],
        queryFn: async () => {
            const res = await getVolumesIssues();
            return res.success ? res.data ?? [] : [];
        },
    });
}

export function usePapersByIssue(issueId: number | null) {
    return useQuery<PaperWithPublication[]>({
        queryKey: ['issue-papers', issueId],
        queryFn: async () => {
            if (!issueId) return [];
            const res = await getPapersByIssueId(issueId);
            return res.success ? res.data ?? [] : [];
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
