'use client';

import { useQuery } from '@tanstack/react-query';
import { getPublishedPapers, getLatestIssuePapers, getArchivePapers } from '@/actions/archives';
import { trackManuscript } from '@/actions/track';
import { getLatestPublishedIssue } from '@/actions/publications';
import { getEditorialBoard } from '@/actions/users';
import { type PublishedPaperUI, type UserWithProfile } from '@/db/types';

export const publicKeys = {
    all: ['public'] as const,
    archives: () => [...publicKeys.all, 'archives'] as const,
    currentIssue: () => [...publicKeys.all, 'current-issue-papers'] as const,
    archivePapers: () => [...publicKeys.all, 'archive-papers'] as const,
    latestIssue: () => [...publicKeys.all, 'latest-issue'] as const,
    editorialBoard: () => [...publicKeys.all, 'editorial-board'] as const,
    track: (paperId: string, email: string) => [...publicKeys.all, 'track', paperId, email] as const,
};

export function useEditorialBoard(initialData?: UserWithProfile[]) {
    return useQuery({
        queryKey: publicKeys.editorialBoard(),
        queryFn: () => getEditorialBoard(),
        select: (res) => res.success ? res.data : [],
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // Keep in memory for 1 hour
    });
}

export function usePublicArchives(initialData?: PublishedPaperUI[]) {
    return useQuery({
        queryKey: publicKeys.archives(),
        queryFn: () => getPublishedPapers(),
        select: (res) => res.success ? res.data : [],
        staleTime: 1000 * 60 * 10, // 10 minutes for public archives
        gcTime: 1000 * 60 * 30, // Keep in memory for 30 mins
    });
}

export function useLatestIssuePapers(initialData?: PublishedPaperUI[]) {
    return useQuery({
        queryKey: publicKeys.currentIssue(),
        queryFn: () => getLatestIssuePapers(),
        select: (res) => res.success ? res.data : [],
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });
}

export function useArchivePapers(initialData?: PublishedPaperUI[]) {
    return useQuery({
        queryKey: publicKeys.archivePapers(),
        queryFn: () => getArchivePapers(),
        select: (res) => res.success ? res.data : [],
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
    });
}

export function useLatestIssue() {
    return useQuery({
        queryKey: publicKeys.latestIssue(),
        queryFn: () => getLatestPublishedIssue(),
        select: (res) => res.success ? res.data : null,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 15, // Keep in memory for 15 mins
    });
}

export function useTrackManuscript(paperId: string, email?: string, enabled = false) {
    return useQuery({
        queryKey: publicKeys.track(paperId, email || ""),
        queryFn: () => trackManuscript(paperId, email),
        enabled: enabled && !!paperId,
        staleTime: 0,
        retry: false,
    });
}
