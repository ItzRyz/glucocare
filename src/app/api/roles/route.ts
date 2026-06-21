import prisma from '@/lib/prisma';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET() {
    try {
        const { orgRole } = await getOrgPermissions();

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const roles = await prisma.role.findMany();
        return sendSuccess(roles, "Successfully retrieved roles", 200);
    } catch (error: Error | unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export async function POST(request: Request) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const { name, clerkRoleSlug, description } = await request.json();

        if (!name || !clerkRoleSlug) {
            return sendError("Bad Request", 400, "BAD_REQUEST", "Missing required fields: name and clerkRoleSlug");
        }

        const newRole = await prisma.role.create({
            data: {
                name,
                clerkRoleSlug,
                description,
            }
        });

        return sendSuccess(newRole, "Successfully created role", 201);
    } catch (error: Error | unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}