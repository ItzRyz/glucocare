import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

/**
 * Validate webhook incoming request from Clerk.
 * @param req Raw Object Request from Route Handler.
 * @returns Promise<WebhookEvent> Verified Payload and safe type.
 */
export async function verifyClerkWebhook(req: NextRequest): Promise<WebhookEvent> {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET in environment variables.');
        throw new Error('Webhook configuration error');
    }

    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        throw new Error('Missing svix headers');
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    const evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    }) as WebhookEvent;

    return evt;
}