import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('--- Env Debug ---');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
const pass = process.env.SMTP_PASS;
if (pass) {
    console.log('SMTP_PASS Length:', pass.length);
    console.log('SMTP_PASS Chars:', pass.split('').map(c => `${c} (${c.charCodeAt(0)})`).join(', '));
} else {
    console.log('SMTP_PASS is UNDEFINED');
}
