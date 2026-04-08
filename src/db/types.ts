import { 
    users, 
    userProfiles, 
    submissions, 
    submissionVersions, 
    submissionFiles, 
    submissionAuthors, 
    reviewAssignments, 
    reviews, 
    payments, 
    volumesIssues, 
    publications, 
    applications,
    applicationInterests,
    contactMessages,
    notifications, 
    activityLogs, 
    settings 
} from "./schema";
import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";

// 👤 Users & Profiles
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserProfile = InferSelectModel<typeof userProfiles>;
export type NewUserProfile = InferInsertModel<typeof userProfiles>;

export type UserWithProfile = User & {
    profile: UserProfile | null;
};

// 📄 Submissions
export type ShortSubmission = InferSelectModel<typeof submissions>;
export type NewSubmission = InferInsertModel<typeof submissions>;
export type Version = InferSelectModel<typeof submissionVersions>;
export type NewVersion = InferInsertModel<typeof submissionVersions>;
export type SubmissionFile = InferSelectModel<typeof submissionFiles>;
export type Author = InferSelectModel<typeof submissionAuthors>;

export type SubmissionDetail = ShortSubmission & {
    correspondingAuthor: UserWithProfile;
    versions: (Version & { files: SubmissionFile[] })[];
    authors: Author[];
    payment: InferSelectModel<typeof payments> | null;
    publication: InferSelectModel<typeof publications> | null;
    issue: InferSelectModel<typeof volumesIssues> | null;
    reviewAssignments: ReviewWithReviewer[];
};

export type SubmissionUI = SubmissionDetail & {
    paper_id: string;
    submitted_at: Date | null;
    updated_at: Date | null;
    title: string;
    abstract: string;
    keywords: string;
    file_path: string;
    pdf_url: string;
    author_name: string;
    author_email: string;
    co_authors: string; // JSON string
    volume_number?: number;
    issue_number?: number;
    start_page?: number | null;
    end_page?: number | null;
    issue_id?: number | null;
    latestVersion?: Version & { files: SubmissionFile[] };
    allFiles: SubmissionFile[];
    allReviews: ReviewWithReviewer[];
    payment?: InferSelectModel<typeof payments> | null;
};

// 🧪 Reviews
export type ReviewAssignment = InferSelectModel<typeof reviewAssignments>;
export type Review = InferSelectModel<typeof reviews>;

export type ReviewWithReviewer = ReviewAssignment & {
    reviewer: UserWithProfile;
    review: Review | null;
};

// 📚 Publications
export type Publication = InferSelectModel<typeof publications>;
export type Issue = InferSelectModel<typeof volumesIssues>;

// 📩 Applications
export type Application = InferSelectModel<typeof applications> & {
    research_interests?: string[];
};
export type NewApplication = InferInsertModel<typeof applications>;
export type ApplicationInterest = InferSelectModel<typeof applicationInterests>;
export type NewApplicationInterest = InferInsertModel<typeof applicationInterests>;

// 📝 Author Dashboard / Details
export type AuthorDashboardSubmission = {
    id: number;
    paperId: string;
    status: string;
    submittedAt: Date | null;
    updatedAt: Date | null;
    title: string;
    abstract: string;
    keywords: string;
    apcAmount: string | null;
    apcCurrency: string | null;
    paymentStatus: string | null;
    finalPdfUrl: string | null;
    doi: string | null;
    volumeNumber: number | null;
    issueNumber: number | null;
    issueYear: number | null;
};

export type AuthorSubmissionDetail = {
    id: number;
    paperId: string;
    status: string;
    submittedAt: Date | null;
    updatedAt: Date | null;
    versionId: number;
    versionNumber: number;
    title: string;
    abstract: string;
    keywords: string;
    subjectArea: string | null;
    changelog: string | null;
    files: (InferSelectModel<typeof submissionFiles>)[];
    authors: (InferSelectModel<typeof submissionAuthors>)[];
    reviewComments: Array<{
        commentsToAuthor: string | null;
        decision: string | null;
        submittedAt: Date | null;
        reviewRound: number;
        deadline: string | null;
    }>;
    payment: InferSelectModel<typeof payments> | null;
    publication: (InferSelectModel<typeof publications> & {
        issue?: InferSelectModel<typeof volumesIssues>;
    }) | null;
};

// 📬 Correspondence
export type ContactMessage = InferSelectModel<typeof contactMessages>;
export type Notification = InferSelectModel<typeof notifications>;

// 📜 System
export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type Setting = InferSelectModel<typeof settings>;

// 📰 UI / Public View Types
export type PublishedPaperUI = {
    id: number;
    paper_id: string;
    title: string;
    abstract: string;
    keywords: string;
    author_name: string;
    status: string;
    doi: string | null;
    file_path: string;
    pdf_url: string;
    start_page: number | null;
    end_page: number | null;
    page_range: string | null;
    published_at: string | Date | null;
    volume_number: number | null;
    issue_number: number | null;
    publication_year: number | null;
    month_range: string | null;
    co_authors: string | null;
    affiliation: string | null;
    author_email: string | null;
    updated_at: string | Date | null;
};

// 🧪 Common Return Types
export type ActionResponse<T = undefined> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};
