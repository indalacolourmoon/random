import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('--- Raw .env Content (First 10 lines) ---');
console.log(envContent.split('\n').filter(l => l.startsWith('SMTP_')).join('\n'));

// Simple manual parser to see what Node sees
const lines = envContent.split('\n');
const env: Record<string, string> = {};
for (const line of lines) {
    const [key, ...rest] = line.trim().split('=');
    if (key && rest.length > 0) {
        let val = rest.join('=');
        // Handle quotes
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[key] = val;
    }
}

const host = env['SMTP_HOST'];
const port = env['SMTP_PORT'];
const user = env['SMTP_USER'];
const pass = env['SMTP_PASS'];

console.log('\n--- Parsed SMTP Config ---');
console.log('Host:', host);
console.log('Port:', port);
console.log('User:', user);
console.log('Pass:', pass);

if (pass) {
    console.log('Pass Length:', pass.length);
    console.log('Pass Chars:', pass.split('').map(c => `${c} (${c.charCodeAt(0)})`).join(', '));
}

async function testConnection() {
    console.log('\n--- SMTP Connection Test ---');
    if (!host || !port || !user || !pass) {
        console.error('Missing credentials!');
        return;
    }

    const transporter = nodemailer.createTransport({
        host,
        port: parseInt(port),
        secure: true,
        auth: { user, pass },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('SUCCESS: Connection verified!');
    } catch (error: any) {
        console.error('FAILURE: Connection failed.');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
    }
}

testConnection();
