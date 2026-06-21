import { auth } from '@clerk/nextjs/server';
import prisma from './prisma';

export async function getOrgPermissions() {
    const { userId, orgId, orgRole } = await auth();

    if (!userId || !orgId || !orgRole) {
        return { authenticated: false, orgRole: null, permissions: [] };
    }

    const dbRole = await prisma.role.findUnique({
        where: { clerkRoleSlug: orgRole },
        include: {
            menuAccess: {
                include: {
                    menu: true
                }
            }
        }
    });

    return {
        authenticated: true,
        userId,
        orgId,
        orgRole,
        roleName: dbRole?.name || null,
        permissions: dbRole?.menuAccess || []
    };
}
