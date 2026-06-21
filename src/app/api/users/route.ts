import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { clerkClient } from '@clerk/nextjs/server';
import { getOrgPermissions } from '@/lib/rbac';
import { NextRequest } from 'next/server';

const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_CLERK_DEFAULT_ORG_ID;

export async function GET() {
    try {
        const { orgRole } = await getOrgPermissions();

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const users = await prisma.user.findMany({});
        return sendSuccess(users, "Users successfully retrivied", 200)
    } catch (error: unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred")
    }
}

export async function POST(req: NextRequest) {
    try {
        const { email, username, password, firstName, lastName, roleSlug } = await req.json();

        const { orgRole } = await getOrgPermissions();

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        if (!email || !password) {
            return sendError('Email and password must filled', 400, 'BAD_REQUEST');
        }

        const role = await prisma.role.findUnique({
            where: { clerkRoleSlug: roleSlug }
        });

        if (!role) {
            return sendError('Role not found', 500, 'ROLE_NOT_FOUND');
        }

        let newUser;
        try {
            const clerk = await clerkClient();
            const clerkUser = await clerk.users.createUser({
                emailAddress: [email],
                username: username,
                password: password,
                firstName: firstName || '',
                lastName: lastName || '',
                publicMetadata: {
                    role: roleSlug,
                }
            });

            const fullName = `${firstName || ''} ${lastName || ''}`.trim();
            newUser = await prisma.user.create({
                data: {
                    id: clerkUser.id,
                    email: email,
                    name: fullName || 'Glucocare User',
                    avatarUrl: clerkUser.imageUrl,
                    roleId: role.id,
                },
                include: {
                    role: true
                }
            });
        } catch (clerkError) {
            console.error('Clerk User Creation Failed:', clerkError);
            let message = 'Failed create user!';

            if (clerkError && typeof clerkError === 'object' && 'errors' in clerkError) {
                const clerkObj = clerkError as { errors: Array<{ longMessage?: string }> };
                if (clerkObj.errors?.[0]?.longMessage) {
                    message = clerkObj.errors[0].longMessage;
                }
            } else if (clerkError instanceof Error) {
                message = clerkError.message;
            }

            return sendError(message, 400, 'CLERK_AUTH_ERROR');
        }

        if (DEFAULT_ORG_ID) {
            try {
                const clerk = await clerkClient();
                const getOrg = await clerk.organizations.getOrganization({
                    organizationId: DEFAULT_ORG_ID
                })

                const defaultOrg = await prisma.organization.upsert({
                    where: { id: getOrg.id },
                    update: {},
                    create: {
                        id: getOrg.id,
                        name: getOrg.name,
                        slug: getOrg.slug
                    }
                });

                await clerk.organizations.createOrganizationMembership({
                    organizationId: DEFAULT_ORG_ID,
                    userId: newUser.id,
                    role: newUser.role.clerkRoleSlug,
                });

                await prisma.organizationMembership.create({
                    data: {
                        userId: newUser.id,
                        organizationId: defaultOrg.id,
                        roleId: newUser.roleId
                    }
                });
            } catch (orgError) {
                console.error('Gagal memasukkan user ke default organization:', orgError);
                let message = 'Failed add user to organization'

                if (orgError && typeof orgError === 'object' && 'errors' in orgError) {
                    const clerkObj = orgError as { errors: Array<{ longMessage?: string }> };
                    if (clerkObj.errors?.[0]?.longMessage) {
                        message = clerkObj.errors[0].longMessage;
                    }
                } else if (orgError instanceof Error) {
                    message = orgError.message;
                }

                return sendError(message, 400, 'CLERK_ORG_ERROR');
            }
        }

        return sendSuccess(newUser, 'User successfully created and synchronized', 201);
    } catch (error: unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}