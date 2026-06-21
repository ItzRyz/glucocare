import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { clerkClient } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { verifyClerkWebhook } from '@/lib/clerk-webhook';

const DEFAULT_ROLE = process.env.NEXT_PUBLIC_DEFAULT_ROLE_PATIENT_KEY as string;
export async function POST(req: NextRequest) {
    let evt;

    try {
        evt = await verifyClerkWebhook(req);
    } catch (err) {
        console.error('Webhook verification failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Invalid webhook signature';
        return sendError(errorMessage, 400, 'BAD_REQUEST');
    }

    try {
        const type = evt.type;

        if (type === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            const email = email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim();

            const defaultRole = await prisma.role.findUnique({
                where: { clerkRoleSlug: DEFAULT_ROLE }
            });

            if (!defaultRole) {
                return sendError('Default role not found', 500, 'ROLE_NOT_FOUND');
            }

            await prisma.user.create({
                data: {
                    id: id,
                    email: email,
                    name: name || 'Glucocare User',
                    avatarUrl: image_url,
                    roleId: defaultRole.id,
                },
            });

            const targetOrgId = process.env.NEXT_PUBLIC_CLERK_DEFAULT_ORG_ID;

            if (targetOrgId) {
                try {
                    const clerk = await clerkClient();

                    await clerk.organizations.createOrganizationMembership({
                        organizationId: targetOrgId,
                        userId: id,
                        role: DEFAULT_ROLE,
                    });
                } catch (clerkError) {
                    console.error('Failed to add user to Clerk organization:', clerkError);
                }
            } else {
                console.warn('Warning: NEXT_PUBLIC_CLERK_DEFAULT_ORG_ID is not defined in env variables.');
            }

            return sendSuccess(null, 'User synced and added to organization successfully', 201);
        }

        if (type === 'user.updated') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            const email = email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim();

            await prisma.user.update({
                where: { id: id },
                data: {
                    email: email,
                    name: name || 'Glucocare User',
                    avatarUrl: image_url,
                },
            });

            return sendSuccess(null, 'User updated successfully', 200);
        }

        if (type === 'user.deleted') {
            const { id } = evt.data;
            try {
                await prisma.user.delete({ where: { id } });
            } catch {
                // User may not exist in DB yet
            }
            return sendSuccess(null, 'User deleted successfully', 200);
        }

        if (type === 'organizationMembership.created') {
            const { organization, public_user_data, role } = evt.data;
            const userId = public_user_data.user_id;

            const dbRole = await prisma.role.findUnique({
                where: { clerkRoleSlug: role },
            });

            if (dbRole && organization?.id && userId) {
                await prisma.organization.upsert({
                    where: { id: organization.id },
                    update: { name: organization.name, slug: organization.slug },
                    create: {
                        id: organization.id,
                        name: organization.name,
                        slug: organization.slug,
                    },
                });

                await prisma.organizationMembership.upsert({
                    where: {
                        userId_organizationId: {
                            userId,
                            organizationId: organization.id,
                        },
                    },
                    update: { roleId: dbRole.id },
                    create: {
                        userId,
                        organizationId: organization.id,
                        roleId: dbRole.id,
                    },
                });
            }

            return sendSuccess(null, 'Organization membership synced', 200);
        }

        return sendSuccess(null, 'Webhook received and ignored', 200);
    } catch (error: unknown) {
        return sendError(
            "Internal Server Error",
            500,
            "SERVER",
            error instanceof Error ? error.message : "An unknown error occurred"
        );
    }
}