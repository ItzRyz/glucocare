import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { clerkClient } from '@clerk/nextjs/server';
import { getOrgPermissions } from '@/lib/rbac';
import { NextRequest } from 'next/server';

const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_CLERK_DEFAULT_ORG_ID;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { orgRole } = await getOrgPermissions();

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id }
        })

        if (!user) {
            return sendError("Not Found", 404, "NOT_FOUND", "User not found");
        }

        return sendSuccess(user, "Successfully retrivied user", 200);
    } catch (error: unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { email, username, password, firstName, lastName, roleSlug } = await req.json();
        const { orgRole } = await getOrgPermissions();
        const { id } = await params;

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return sendError('User not found', 404, 'NOT_FOUND');
        }

        const role = roleSlug
            ? await prisma.role.findUnique({ where: { clerkRoleSlug: roleSlug } })
            : await prisma.role.findUnique({ where: { id: existingUser.roleId } });

        if (!role) {
            return sendError('Role not found', 500, 'ROLE_NOT_FOUND');
        }

        let updatedUser
        try {
            const clerk = await clerkClient();
            const clerkPayload: Record<string, unknown> = {};
            if (firstName !== undefined) clerkPayload.firstName = firstName;
            if (lastName !== undefined) clerkPayload.lastName = lastName;
            if (email) clerkPayload.emailAddress = [email];
            if (username) clerkPayload.username = username;
            if (password) clerkPayload.password = password;

            if (Object.keys(clerkPayload).length < 1 && !roleSlug) {
                return sendError("No fields to update", 400, "BAD_REQUEST");
            }

            const updatedClerkUser = Object.keys(clerkPayload).length > 0
                ? await clerk.users.updateUser(id, clerkPayload)
                : await clerk.users.getUser(id);

            const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();

            updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    email: email ?? existingUser.email,
                    name: fullName || existingUser.name || 'Glucocare User',
                    avatarUrl: updatedClerkUser.imageUrl,
                    roleId: role.id,
                },
                include: {
                    role: true,
                    organizationMemberships: true
                }
            });
        } catch (clerkError) {
            console.error('Clerk User Creation Failed:', clerkError);
            let message = 'Gagal mendaftarkan user ke auth system';

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
                await clerk.organizations.updateOrganizationMembership({
                    organizationId: DEFAULT_ORG_ID,
                    userId: updatedUser.id,
                    role: updatedUser.role.clerkRoleSlug
                })

                await prisma.organizationMembership.upsert({
                    where: {
                        userId_organizationId: {
                            userId: updatedUser.id,
                            organizationId: DEFAULT_ORG_ID
                        }
                    },
                    update: {
                        userId: updatedUser.id,
                        organizationId: DEFAULT_ORG_ID,
                        roleId: updatedUser.roleId
                    },
                    create: {
                        userId: updatedUser.id,
                        organizationId: DEFAULT_ORG_ID,
                        roleId: updatedUser.roleId
                    }
                })
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

        return sendSuccess(updatedUser, 'User successfully updated', 200);
    } catch (error: unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { orgRole } = await getOrgPermissions();
        const { id } = await params;

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const userExists = await prisma.user.findUnique({
            where: { id: id }
        });

        if (!userExists) {
            return sendError("User not found!", 404, "USER_NOT_FOUND");
        }

        try {
            const clerk = await clerkClient();
            await clerk.users.deleteUser(id);
        } catch (clerkError) {
            console.error('Clerk User deletion Failed:', clerkError);
            let message = 'Failed delete user!';

            if (clerkError && typeof clerkError === 'object' && 'errors' in clerkError) {
                const clerkObj = clerkError as { errors: Array<{ longMessage?: string }> };
                if (clerkObj.errors?.[0]?.longMessage) {
                    message = clerkObj.errors[0].longMessage;
                }
            } else if (clerkError instanceof Error) {
                message = clerkError.message;
            }

            return sendError(message, 400, 'CLERK_DELETE_ERROR');
        }

        await prisma.user.delete({
            where: { id: id }
        });

        return sendSuccess(null, 'User and Organization Memberships deleted successfully!', 200);
    } catch (error: unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}