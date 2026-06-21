import prisma from '@/lib/prisma';
import { sendError, sendSuccess } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { orgRole } = await getOrgPermissions();

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const { id } = await params;

        const role = await prisma.role.findUnique({
            where: { id }
        });

        if (!role) {
            return sendError("Not Found", 404, "NOT_FOUND", "Role not found");
        }

        return sendSuccess(role, "Successfully retrieved role", 200);
    } catch (error: Error | unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const { id } = await params;
        const { name, clerkRoleSlug, description } = await request.json();

        if (!name || !clerkRoleSlug) {
            return sendError("Bad Request", 400, "BAD_REQUEST", "Missing required fields: name and clerkRoleSlug");
        }

        const updatedRole = await prisma.role.update({
            where: { id },
            data: {
                name,
                clerkRoleSlug,
                description
            }
        });

        return sendSuccess(updatedRole, "Successfully updated role", 200);
    } catch (error: Error | unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const { id } = await params;

        const deletedRole = await prisma.role.delete({
            where: { id }
        });

        return sendSuccess(deletedRole, "Successfully deleted role", 200);
    } catch (error: Error | unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}
