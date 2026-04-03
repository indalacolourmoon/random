import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
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
    } catch (error: any) {
        console.error("--- SMTP Error Diagnosis ---");
        console.error("Host:", process.env.SMTP_HOST);
        console.error("User:", process.env.SMTP_USER);
        console.error("Error Code:", error?.code);
        console.error("SMTP Response:", error?.response);
        console.error("---------------------------");
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

// Helper templates
export const emailTemplates = {
    submissionReceived: (authorName: string, paperTitle: string, paperId: string, setupUrl?: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        return {
            subject: `Submission Received: ${paperId}`,
            html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>Thank you for submitting your manuscript to the <strong>International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</strong>.</p>
                <div style="background: #fdf2f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">Paper ID: ${paperId}</p>
                    <p style="margin: 5px 0 0 0;">Title: ${paperTitle}</p>
                </div>
                
                ${setupUrl ? `
                    <div style="background: #fff8f1; padding: 25px; border-radius: 15px; border: 1px solid #ffedd5; margin: 25px 0; text-align: center;">
                        <p style="margin-top: 0; font-weight: bold; color: #9a3412;">Set Up Your Author Account</p>
                        <p style="font-size: 14px; color: #9a3412; margin-bottom: 20px;">To track your submission, receive reviewer feedback, and manage revisions, please secure your account:</p>
                        <a href="${setupUrl}" style="background: #6d0202; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Secure My Account</a>
                    </div>
                ` : `
                    <p>Your submission is currently under initial screening. You can track its live progress anytime in our author portal:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${baseUrl}/track" style="background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Track Manuscript Status</a>
                    </div>
                `}
                
                <p>Warm regards,<br>Editorial Office, IJITEST</p>
            </div>
        `
        }
    },
    statusUpdate: (authorName: string, paperTitle: string, status: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        const isAccepted = status === 'accepted';

        return {
            subject: `Manuscript Status Update: ${status.toUpperCase()}`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                    <p>Dear <strong>${authorName}</strong>,</p>
                    <p>The status of your manuscript "<em>${paperTitle}</em>" has been updated to:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <h2 style="color: ${isAccepted ? '#16a34a' : status === 'rejected' ? '#dc2626' : '#2563eb'}; text-transform: uppercase;">${status.replace('_', ' ')}</h2>
                    </div>

                    ${isAccepted ? `
                        <div style="background: #f0fdf4; padding: 30px; border-radius: 15px; text-align: center; border: 1px solid #dcfce7;">
                            <p style="margin-top: 0; font-weight: bold; color: #166534;">Congratulations on your acceptance!</p>
                            <p style="font-size: 14px; color: #166534; margin-bottom: 25px;">To finalize the publication process, please complete the Article Processing Charge (APC) payment.</p>
                            <a href="${baseUrl}/payment/${paperId}" style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Proceed to Payment & Publish</a>
                        </div>
                    ` : `
                        <p>Please log in to the portal or check your records for more details.</p>
                    `}

                    <p style="margin-top: 30px;">Warm regards,<br>Editor-in-Chief, IJITEST</p>
                </div>
            `
        };
    },
    reviewAssignment: (reviewerName: string, paperTitle: string, deadline: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        return {
            subject: `New Peer Review Assignment: ${paperId}`,
            html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${reviewerName}</strong>,</p>
                <p>You have been assigned as a peer reviewer for the following manuscript:</p>
                <div style="background: #fdf2f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="margin: 0; font-weight: bold;">Paper ID: ${paperId}</p>
                    <p style="margin: 5px 0 0 0;">Title: ${paperTitle}</p>
                </div>
                <p><strong>Deadline for Feedback:</strong> ${new Date(deadline).toLocaleDateString()}</p>
                <p>Please review the document and upload your feedback securely via the reviewer portal:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseUrl}/reviewer" style="background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Access Reviewer Portal</a>
                </div>
                <p>Thank you for your contribution to technical excellence.<br>Editorial Board, IJITEST</p>
            </div>
        `
        }
    },
    manuscriptAcceptance: (authorName: string, paperTitle: string, paperId: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        return {
            subject: `MANUSCRIPT ACCEPTED: ${paperId}`,
            html: `
                <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                    <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                    <p>Dear <strong>${authorName}</strong>,</p>
                    <p>I am pleased to inform you that your manuscript, "<strong>${paperTitle}</strong>" (ID: ${paperId}), has been <strong>ACCEPTED</strong> for publication in the <em>International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</em>.</p>

                    <div style="background: #f0fdf4; padding: 30px; border-radius: 15px; text-align: center; border: 1px solid #dcfce7; margin: 30px 0;">
                        <p style="margin-top: 0; font-weight: bold; color: #166534; font-size: 18px;">Congratulations on your achievement!</p>
                        <p style="font-size: 14px; color: #166534; margin-bottom: 25px;">To finalize the publication and include your paper in the upcoming issue, please complete the Article Processing Charge (APC) payment.</p>
                        <a href="${baseUrl}/payment/${paperId}" style="background: #16a34a; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; display: inline-block;">Proceed to Payment & Publish</a>
                    </div>

                    <p>After payment, our technical team will reach out for the final camera-ready copy formatting.</p>
                    <p>Warm regards,<br><strong>Editor-in-Chief, IJITEST</strong></p>
                </div>
            `
        };
    },
    manuscriptRejection: (authorName: string, paperTitle: string, paperId: string, feedback: string) => ({
        subject: `MANUSCRIPT STATUS: ${paperId}`,
        html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>Thank you for submitting your manuscript, "<strong>${paperTitle}</strong>" (ID: ${paperId}), to IJITEST.</p>
                <p>After a thorough evaluation by our editorial board and peer reviewers, we regret to inform you that your manuscript has been <strong>REJECTED</strong> for publication in our journal.</p>

                <div style="background: #f9fafb; padding: 25px; border-radius: 15px; border: 1px solid #e5e7eb; margin: 30px 0;">
                    <p style="margin-top: 0; font-weight: bold; font-size: 10px; color: #6b7280; letter-spacing: 0.1em; text-transform: uppercase;">Reviewer Comments & Feedback</p>
                    <div style="color: #374151; line-height: 1.6;">
                        ${feedback || 'The submission did not meet the technical criteria for our current focus areas.'}
                    </div>
                </div>

                <p>We appreciate your interest in IJITEST and wish you the best for your future research endeavors.</p>
                <p>Sincerely,<br><strong>Editorial Board, IJITEST</strong></p>
            </div>
        `,
    }),
    reviewCompleted: (reviewerName: string, paperTitle: string, paperId: string) => ({
        subject: `Review Completed: ${paperId}`,
        html: `
            <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #6d0202;">Peer Review Completed</h2>
                <p>Reviewer <strong>${reviewerName}</strong> has submitted their final feedback for:</p>
                <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #6d0202;">
                    <strong>ID:</strong> ${paperId}<br>
                    <strong>Title:</strong> ${paperTitle}
                </p>
                <p>Please log in to the admin panel to evaluate the feedback and make a final decision.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/admin/submissions/${paperId}" style="background: #6d0202; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Submission & Feedback</a>
            </div>
        `,
    }),
    paymentVerified: (authorName: string, paperTitle: string, paperId: string) => ({
        subject: `Payment Verified: ${paperId}`,
        html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>Your payment for the Article Processing Charge (APC) for manuscript <strong>${paperId}</strong> has been successfully verified.</p>
                <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; border: 1px solid #dcfce7; margin: 20px 0;">
                    <p style="margin: 0; color: #166534;"><strong>Status:</strong> Paid & Verified</p>
                    <p style="margin: 5px 0 0 0; color: #166534;"><strong>Paper:</strong> ${paperTitle}</p>
                </div>
                <p>Your paper is now in the final publication queue and will be included in the upcoming issue. You will receive a final notification once it is live on our website.</p>
                <p>Thank you for choosing IJITEST.</p>
                <p>Warm regards,<br>Editorial Office, IJITEST</p>
            </div>
        `,
    }),
    manuscriptPublished: (authorName: string, paperTitle: string, paperId: string, volume: number, issue: number, year: number) => ({
        subject: `PAPER PUBLISHED: ${paperId}`,
        html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>We are delighted to inform you that your manuscript has been officially <strong>PUBLISHED</strong> in IJITEST.</p>
                <div style="background: #fdf2f2; padding: 25px; border-radius: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Title:</strong> ${paperTitle}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Publication:</strong> Volume ${volume}, Issue ${issue} (${year})</p>
                    <p style="margin: 5px 0 0 0;"><strong>Paper ID:</strong> ${paperId}</p>
                </div>
                <p>Your research is now available to the global scientific community on our archives page:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || ''}/archives" style="background: #6d0202; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">View in Archives</a>
                </div>
                <p>Congratulations once again on your contribution to the field.</p>
                <p>Highest regards,<br><strong>Editor-in-Chief, IJITEST</strong></p>
            </div>
        `,
    }),
    // Author Portal Invitation — sent at reviewer assignment (same token flow as editor/reviewer)
    authorInvitation: (authorName: string, paperTitle: string, paperId: string, setupUrl: string) => ({
        subject: `Your Paper Is Under Review — Set Up Your Author Portal | IJITEST`,
        html: `
        <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
            <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
            <p>Dear <strong>${authorName}</strong>,</p>
            <p>Great news — your manuscript <strong>"${paperTitle}"</strong> (Paper ID: <strong>${paperId}</strong>) has been accepted for peer review and assigned to our reviewer panel.</p>
            <p>To track your manuscript's progress, receive reviewer feedback, and resubmit if needed, please activate your <strong>Author Portal</strong> account:</p>
            <div style="text-align: center; margin: 40px 0;">
                <a href="${setupUrl}" style="background: #6d0202; color: white; padding: 18px 36px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 10px 20px -5px rgba(109,2,2,0.3);">Activate Author Portal</a>
            </div>
            <p style="color: #666; font-size: 12px;">This invitation link expires in 72 hours. If you did not submit to IJITEST, please ignore this email.</p>
            <div style="background: #fdf2f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold;">Paper ID: ${paperId}</p>
                <p style="margin: 5px 0 0 0;">Title: ${paperTitle}</p>
            </div>
            <p>Warm regards,<br><strong>Editorial Office, IJITEST</strong></p>
        </div>
        `
    }),

    // Resubmission request email template (no login link, includes optional editor/reviewer comments)
    resubmissionRequest: (authorName: string, paperTitle: string, paperId: string, comments?: string) => {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ijitest.com';
        return {
            subject: `Resubmission Requested: ${paperId}`,
            html: `
            <div style="font-family: serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 20px;">
                <h1 style="color: #6d0202; border-bottom: 2px solid #6d0202; padding-bottom: 10px;">IJITEST</h1>
                <p>Dear <strong>${authorName}</strong>,</p>
                <p>Your manuscript "${paperTitle}" (Paper ID: ${paperId}) has been marked for resubmission.</p>
                ${comments ? `<p><strong>Comments from editor/reviewer:</strong></p><blockquote style="border-left: 4px solid #6d0202; padding-left: 10px; margin: 10px 0;">${comments}</blockquote>` : ''}
                <p>Please submit a revised version using the author portal:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${baseUrl}/author/submissions" style="background: #1a1a1a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Author Portal</a>
                </div>
                <p>Warm regards,<br>Editorial Office, IJITEST</p>
            </div>
            `
        };
    }
};