import { db } from "../lib/db";
import { users, userProfiles, settings } from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

async function seed() {
    console.log("🚀 Starting Seeding Restoration...");

    try {
        // 1. SEED SETTINGS
        console.log("📝 Seeding Journal Settings...");
        const journalSettings = [
            { settingKey: 'apc_description', settingValue: 'APC covers DOI assignment, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.' },
            { settingKey: 'apc_inr', settingValue: '0' },
            { settingKey: 'apc_usd', settingValue: '0' },
            { settingKey: 'copyright_url', settingValue: '/docs/copyright-form.docx' },
            { settingKey: 'is_promotion_active', settingValue: 'true' },
            { settingKey: 'issn_number', settingValue: 'XXXX-XXXX' },
            { settingKey: 'journal_name', settingValue: 'International Journal of Innovative Trends in Engineering Science and Technology' },
            { settingKey: 'journal_short_name', settingValue: 'IJITEST' },
            { settingKey: 'office_address', settingValue: 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India' },
            { settingKey: 'publisher_name', settingValue: 'Felix Academic Publications' },
            { settingKey: 'support_email', settingValue: 'support@ijitest.org' },
            { settingKey: 'support_phone', settingValue: '+91 8919643590' },
            { settingKey: 'template_url', settingValue: '/docs/template-url.docx' }
        ];

        for (const s of journalSettings) {
            await db.insert(settings).values(s).onDuplicateKeyUpdate({
                set: { settingValue: s.settingValue }
            });
        }
        console.log("✅ Settings Seeded.");

        // 2. SEED USERS & PROFILES
        console.log("👥 Seeding Core Users...");
        
        const coreUsers = [
            {
                email: 'editor@ijitest.org',
                passwordHash: '$2b$10$HpElpKNYCXaqdUpivIxWA.CLDniLlVW/GIb7VyiDv4Syl3WsKsdqy', // Old Admin Hash
                role: 'admin' as const,
                fullName: 'Dr. Ravi Babu T',
                designation: 'Associate Professor',
                institute: 'MES Group of Institution',
                phone: '+91 8919643590'
            },
            {
                email: 'indalamohankumar@gmail.com',
                passwordHash: '$2b$10$2nF2wRdIXIfGGFeFYJHYtOhuyufINNFC/pvZr/bAftSh6l4mql3H2',
                role: 'reviewer' as const,
                fullName: 'Mohan Kumar Indala',
                designation: '',
                institute: 'vignan',
                phone: '7780123277'
            }
        ];

        for (const u of coreUsers) {
            // Check if user exists
            let existing = await db.query.users.findFirst({
                where: eq(users.email, u.email)
            });

            let userId: string;
            if (!existing) {
                userId = crypto.randomUUID();
                await db.insert(users).values({
                    id: userId,
                    email: u.email,
                    passwordHash: u.passwordHash,
                    role: u.role,
                    isActive: true,
                    isEmailVerified: true
                });
                
                await db.insert(userProfiles).values({
                    userId: userId,
                    fullName: u.fullName,
                    designation: u.designation,
                    institute: u.institute,
                    phone: u.phone
                });
            }
        }

        // 3. SEED DUMMY AUTHORS (from Papers 13, 15, 18, 19)
        console.log("✍️ Seeding Dummy Author Accounts...");
        const dummyAuthors = [
            { email: 'gulshansribabu@gmail.com', name: 'THORLAPATI GULSHAN SRI BABU', affiliation: 'VIGNAN\'S INSTITUTE OF INFORMATION TECHNOLOGY' },
            { email: 'swapnachsp@gmail.com', name: 'Dr. CH. Swapna Priya', affiliation: 'Dept of Computer Science Engineering, Vigyan Institute of Technology, India' },
            { email: 'subbaraochappa@gmail.com', name: 'CH M V SUBBARAO', affiliation: 'DEPARTMENT OF ECE, JNTU GV' },
            { email: 'narlamahendracai@gpcet.ac.in', name: 'Mahendra', affiliation: 'Department of CAI, G. Pullaiah College of Engineering and Technology' }
        ];

        for (const a of dummyAuthors) {
            let existing = await db.query.users.findFirst({
                where: eq(users.email, a.email)
            });

            if (!existing) {
                const userId = crypto.randomUUID();
                await db.insert(users).values({
                    id: userId,
                    email: a.email,
                    role: 'author',
                    isActive: true,
                });
                
                await db.insert(userProfiles).values({
                    userId: userId,
                    fullName: a.name,
                    institute: a.affiliation
                });
            }
        }

        console.log("🏁 Restoration Seeding Finished Successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Failed:", error);
        process.exit(1);
    }
}

seed();
