import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

interface SendEmailProps {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailProps) {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'IJITEST Editor'}" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("--- SMTP Error Diagnosis ---");
        console.error("Host:", process.env.SMTP_HOST);
        console.error("User:", process.env.SMTP_USER);
        const err = error as Error & { code?: string, response?: unknown };
        console.error("Error Code:", err?.code);
        console.error("SMTP Response:", err?.response);
        console.error("---------------------------");
        return { success: false, error: err instanceof Error ? err.message : String(error) };
    }
}

// --- 📋 JOURNAL GLOBAL SETTINGS (Extracted from u116573049_ijitest_db.sql) ---
const JOURNAL = {
    name: 'International Journal of Innovative Trends in Engineering Science and Technology',
    shortName: 'IJITEST',
    supportEmail: 'support@ijitest.org',
    address: 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India',
    publisher: 'Felix Academic Publications',
    logo: '/logo.png', // Reaches public folder
    primaryColor: '#6d0202',
    secondaryColor: '#1a1a1a',
    accentColor: '#f8fafc'
};

/**
 * Common layout wrapper for all Automated Emails
 * Ensures consistent branding, typography, and professional aesthetics.
 */
const mailLayout = (content: string, cta?: { text: string, url: string }) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
    const logoUrl = `${baseUrl}${JOURNAL.logo}`;

    return `
        <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, serif; color: #334155; max-width: 600px; margin: 0 auto; background-color: ${JOURNAL.accentColor}; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; line-height: 1.6;">
            <!-- 🏛️ Header -->
            <div style="background-color: white; padding: 30px; text-align: center; border-bottom: 3px solid ${JOURNAL.primaryColor};">
                <img src="${logoUrl}" alt="${JOURNAL.shortName}" style="height: 60px; margin-bottom: 15px;" />
                <h1 style="color: ${JOURNAL.primaryColor}; margin: 0; font-size: 20px; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">${JOURNAL.shortName}</h1>
                <p style="color: #64748b; font-size: 11px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">${JOURNAL.name}</p>
            </div>

            <!-- 📄 Body -->
            <div style="padding: 40px; background-color: white;">
                ${content}

                ${cta ? `
                    <div style="text-align: center; margin-top: 40px; margin-bottom: 20px;">
                        <a href="${cta.url}" style="background-color: ${JOURNAL.primaryColor}; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 15px; box-shadow: 0 4px 12px rgba(109, 2, 2, 0.25);">
                            ${cta.text}
                        </a>
                    </div>
                ` : ''}
            </div>

            <!-- 📍 Footer -->
            <div style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
                <p style="margin: 0; font-weight: bold; color: ${JOURNAL.secondaryColor};">${JOURNAL.name}</p>
                <p style="margin: 5px 0 15px 0;">Published by <strong>${JOURNAL.publisher}</strong></p>
                
                <div style="margin: 15px 0; color: #94a3b8;">
                    <p style="margin: 2px 0;">${JOURNAL.address}</p>
                    <p style="margin: 2px 0;">Support: <a href="mailto:${JOURNAL.supportEmail}" style="color: ${JOURNAL.primaryColor}; text-decoration: none;">${JOURNAL.supportEmail}</a> | <a href="${baseUrl}" style="color: ${JOURNAL.primaryColor}; text-decoration: none;">Official Website</a></p>
                </div>

                <div style="margin-top: 25px; pt: 20px; border-top: 1px solid #e2e8f0; font-size: 10px; opacity: 0.7;">
                    <p>This is an automated notification from the Editorial Management System. Please do not reply directly to this email.</p>
                    <p>&copy; ${new Date().getFullYear()} ${JOURNAL.publisher}. All rights reserved.</p>
                </div>
            </div>
        </div>
    `;
};

// Helper templates
export const emailTemplates = {
    submissionReceived: (authorName: string, paperTitle: string, paperId: string, setupUrl?: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>Thank you for choosing <strong>${JOURNAL.shortName}</strong> for your research publication. We have successfully received your manuscript and it is currently undergoing initial screening.</p>
            
            <div style="background: #fdf2f2; border-left: 4px solid ${JOURNAL.primaryColor}; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-weight: bold; color: ${JOURNAL.primaryColor}; font-size: 13px; text-transform: uppercase;">Submission Details</p>
                <p style="margin: 10px 0 5px 0; font-size: 18px; font-weight: 800;">${paperId}</p>
                <p style="margin: 0; font-style: italic; color: #475569;">"${paperTitle}"</p>
            </div>
            
            <p>Our editorial team will carefully review your submission against our technical criteria. You will receive further updates as your manuscript moves through the peer-review stages.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Acknowledgment of Submission: ${paperId}`,
            html: mailLayout(content, setupUrl ? {
                text: 'Secure My Author Account',
                url: setupUrl
            } : {
                text: 'Track Manuscript Status',
                url: `${baseUrl}/track`
            })
        };
    },

    statusUpdate: (authorName: string, paperTitle: string, status: string, paperId: string, isFree: boolean = false) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const isAccepted = status === 'accepted';

        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>The status of your manuscript has been updated. Professional evaluation of your work has reached the following decision stage:</p>
            
            <div style="text-align: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; margin: 30px 0;">
                <p style="margin: 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Current Status</p>
                <h2 style="color: ${isAccepted ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#2563eb'}; font-size: 28px; margin: 10px 0; text-transform: uppercase; border: none;">${status.replace('_', ' ')}</h2>
            </div>

            <p style="margin-bottom: 10px;"><strong>Manuscript Info:</strong></p>
            <p style="color: #475569; margin-top: 0;">${paperId} | "${paperTitle}"</p>

            ${isAccepted ? `
                <p style="color: #166534; font-weight: bold; margin-top: 25px;">Congratulations on the successful acceptance of your paper!</p>
                <p>${isFree ? 'Your paper will now proceed to the final publication queue.' : 'To proceed with inclusion in the upcoming issue, please finalize the Article Processing Charge (APC) via the portal.'}</p>
            ` : ''}
        `;

        return {
            subject: `[${JOURNAL.shortName}] Status Update: ${paperId} [${status.toUpperCase()}]`,
            html: mailLayout(content, {
                text: isAccepted && !isFree ? 'Proceed to Payment & Publish' : 'Access Author Dashboard',
                url: isAccepted && !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`
            })
        };
    },

    reviewAssignment: (reviewerName: string, paperTitle: string, deadline: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${reviewerName}</strong>,</p>
            <p>Based on your expertise, you have been invited to serve as a peer reviewer for a new manuscript submission.</p>
            
            <div style="background: #fdf2f2; border-left: 4px solid ${JOURNAL.primaryColor}; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-weight: bold; color: ${JOURNAL.primaryColor}; font-size: 13px; text-transform: uppercase;">Review Assignment</p>
                <p style="margin: 10px 0 5px 0; font-size: 16px; font-weight: 800;">ID: ${paperId}</p>
                <p style="margin: 0; font-style: italic; color: #475569;">"${paperTitle}"</p>
            </div>

            <p style="color: ${JOURNAL.primaryColor}; font-weight: bold;">Submit Feedback By: ${new Date(deadline).toLocaleDateString()}</p>
            <p>Your technical evaluation is critical to maintaining the high standards of our journal. You can access the manuscript and review guidelines in your dashboard.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] New Peer Review Invitation: ${paperId}`,
            html: mailLayout(content, {
                text: 'Access Reviewer Portal',
                url: `${baseUrl}/reviewer`
            })
        };
    },

    manuscriptAcceptance: (authorName: string, paperTitle: string, paperId: string, isFree: boolean = false) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>I am pleased to inform you that your manuscript has been <strong>ACCEPTED</strong> for publication in the <em>${JOURNAL.name}</em>.</p>

            <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 30px; border-radius: 15px; text-align: center; margin: 30px 0;">
                <h3 style="margin-top: 0; font-weight: bold; color: #166534; font-size: 20px;">Congratulations!</h3>
                <p style="color: #166534; font-size: 14px;">Manuscript ID: <strong>${paperId}</strong></p>
                <p style="color: #166534; font-size: 14px; font-style: italic; margin-top: 10px;">"${paperTitle}"</p>
            </div>

            <p>The editorial board found your research to be significant and well-aligned with our technical scopes. ${isFree ? 'Our technical team will now begin the final formatting of your paper.' : 'To enable immediate publication and indexing registration, please finalize the Article Processing Charge (APC).'}</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] MANUSCRIPT ACCEPTANCE: ${paperId}`,
            html: mailLayout(content, {
                text: !isFree ? 'Proceed to Payment & Publish' : 'View Author Portal',
                url: !isFree ? `${baseUrl}/payment/${paperId}` : `${baseUrl}/author`
            })
        };
    },

    manuscriptRejection: (authorName: string, paperTitle: string, paperId: string, feedback: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>Thank you for giving us the opportunity to evaluate your manuscript <strong>(ID: ${paperId})</strong>.</p>
            <p>After a rigorous evaluation by our reviewers and the editorial board, we regret to inform you that your manuscript was not accepted for publication at this time.</p>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <p style="margin: 0; font-weight: bold; font-size: 11px; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase;">Editorial Feedback</p>
                <div style="margin-top: 15px; color: #475569; font-size: 14px; white-space: pre-wrap;">${feedback || 'The submission did not sufficiently fulfill the technical requirements of the journal in its current form.'}</div>
            </div>

            <p>We appreciate your interest in <strong>${JOURNAL.shortName}</strong> and wish you success with your future research work.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Editorial Decision: ${paperId}`,
            html: mailLayout(content)
        };
    },

    reviewCompleted: (reviewerName: string, paperTitle: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Hello Admin,</p>
            <p>Reviewer <strong>${reviewerName}</strong> has submitted their final evaluation for manuscript <strong>${paperId}</strong>.</p>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-weight: bold;">${paperTitle}</p>
            </div>
            
            <p>Please review the feedback and move the submission to the next decision stage.</p>
        `;

        return {
            subject: `[SYSTEM] Review Completed: ${paperId}`,
            html: mailLayout(content, {
                text: 'Evaluate Feedback',
                url: `${baseUrl}/admin/submissions/${paperId}`
            })
        };
    },

    paymentVerified: (authorName: string, paperTitle: string, paperId: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>We are pleased to confirm that the Article Processing Charge (APC) for your manuscript <strong>${paperId}</strong> has been successfully verified.</p>
            
            <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <p style="color: #065f46; font-weight: bold; margin: 0; font-size: 16px;">Payment Status: Verified & Recorded</p>
                <p style="color: #065f46; margin-top: 5px; font-size: 13px;">${paperTitle}</p>
            </div>

            <p>Your paper is now in the final publication queue and will be assigned to the next available issue. You will receive a final confirmation once the paper is live.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Payment Confirmation & Recording`,
            html: mailLayout(content)
        };
    },

    manuscriptPublished: (authorName: string, paperTitle: string, paperId: string, volume: number, issue: number, year: number) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>We are delighted to inform you that your manuscript is now officially <strong>PUBLISHED</strong> and indexed in the latest issue of ${JOURNAL.shortName}.</p>
            
            <div style="background: #fdf2f2; border: 1px solid ${JOURNAL.primaryColor}33; padding: 30px; border-radius: 12px; margin: 30px 0;">
                <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Publication Metadata</p>
                <p style="margin: 10px 0; font-size: 16px; font-weight: 800; color: ${JOURNAL.secondaryColor};">${paperTitle}</p>
                <p style="margin: 0; font-size: 14px;"><strong>Location:</strong> Volume ${volume}, Issue ${issue} (${year})</p>
                <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>Manuscript ID:</strong> ${paperId}</p>
            </div>

            <p>Your contribution to the research community is now available in our global archives. Congratulations on your achievement.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] OFFICIAL PUBLICATION: ${paperId}`,
            html: mailLayout(content, {
                text: 'View in Archives',
                url: `${baseUrl}/archives`
            })
        };
    },

    authorInvitation: (authorName: string, paperTitle: string, paperId: string, setupUrl: string) => {
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>Your manuscript has been successfully screened and is now being assigned to our expert reviewer panel.</p>
            <p>To enable live tracking of your manuscript's progress, receive reviewer feedback, and manage your publication lifecycle, please secure your official <strong>Author Portal</strong> account:</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; margin: 30px 0;">
                <p style="margin: 0; color: #475569; font-size: 14px;">Manuscript: <strong>${paperId}</strong></p>
                <p style="margin: 5px 0 0 0; color: #475569; font-size: 14px; font-style: italic;">"${paperTitle}"</p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; font-style: italic;">Note: This invitation link will expire in 72 hours for security purposes.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Portal Activation for Manuscript ${paperId}`,
            html: mailLayout(content, {
                text: 'Activate Author Portal',
                url: setupUrl
            })
        };
    },

    resubmissionRequest: (authorName: string, paperTitle: string, paperId: string, comments?: string, subId?: number) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const resubmitLink = subId ? `${baseUrl}/author/submissions/${subId}/resubmit` : `${baseUrl}/author/submissions`;
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${authorName}</strong>,</p>
            <p>The peer-review process for your manuscript <strong>(ID: ${paperId})</strong> has been completed. The reviewers have requested revisions before a final decision can be made.</p>
            
            <div style="background: #fff8f1; border-left: 4px solid #f97316; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0; font-weight: bold; color: #c2410c; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Reviewer & Editor Requirements</p>
                <div style="margin-top: 15px; color: #475569; font-size: 14px; white-space: pre-wrap;">${comments || 'Please address the detailed reviewer comments available in the portal.'}</div>
            </div>

            <p>Please submit your revised version within 15 days to remain in the current publication cycle.</p>
        `;

        return {
            subject: `[${JOURNAL.shortName}] Revision Requested: ${paperId}`,
            html: mailLayout(content, {
                text: 'Submit Revised Manuscript',
                url: resubmitLink
            })
        };
    },

    resubmissionReceived: (authorName: string, paperTitle: string, paperId: string, subId: number, role: 'admin' | 'editor' = 'admin') => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const dashboardLink = role === 'admin' ? `${baseUrl}/admin/submissions/${subId}` : `${baseUrl}/editor/submissions/${subId}`;
        const content = `
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p>A revised manuscript from <strong>${authorName}</strong> has been uploaded to the system.</p>
            
            <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; font-size: 12px; color: #64748b;">Revised Manuscript ID</p>
                <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${paperId}</p>
                <p style="margin: 5px 0 0 0; font-style: italic; color: #475569;">"${paperTitle}"</p>
            </div>
            
            <p>Please verify the revisions and changelog to proceed with the next editorial step.</p>
        `;

        return {
            subject: `[SYSTEM] Revision Received: ${paperId} (by ${authorName})`,
            html: mailLayout(content, {
                text: 'View Revised Submission',
                url: dashboardLink
            })
        };
    }
};
