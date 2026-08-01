import nodemailer from 'nodemailer';
import { env } from '@config/env';

export const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
        user: env.SMTP_USERNAME,
        pass: env.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: true,
    },
});

export async function testTransporter(): Promise<void> {
    try {
        await transporter.verify();
        console.info(`SMTP Transporter connection verification successful: ${env.SMTP_HOST}`);
    } catch (error: unknown) {
        console.error('SMTP Transporter connection verification failed: ', error);
    }
}
