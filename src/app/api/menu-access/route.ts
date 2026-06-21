import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

async function requireAdmin() {
    const { orgRole } = await getOrgPermissions();
    if (!orgRole) return { error: sendError('Unauthorized', 401, 'UNAUTHORIZED') };
    if (orgRole !== 'org:admin') return { error: sendError('Forbidden', 403, 'FORBIDDEN') };
    return { ok: true as const };
}

export async function GET(request: Request) {
    try {
        const auth = await requireAdmin();
        if ('error' in auth) return auth.error;

        const { searchParams } = new URL(request.url);
        const roleId = searchParams.get('roleId');

        const access = await prisma.menuAccess.findMany({
            where: roleId ? { roleId } : undefined,
            include: {
                role: { select: { id: true, name: true, clerkRoleSlug: true } },
                menu: { select: { id: true, name: true, path: true } },
            },
            orderBy: [{ roleId: 'asc' }, { menuId: 'asc' }],
        });

        return sendSuccess(access, 'Menu access retrieved successfully', 200);
    } catch (error) {
        return sendError(
            'Internal Server Error',
            500,
            'SERVER_ERROR',
            error instanceof Error ? error.message : null
        );
    }
}

export async function POST(request: Request) {
    try {
        const auth = await requireAdmin();
        if ('error' in auth) return auth.error;

        const { roleId, menuId, canCreate, canRead, canUpdate, canDelete } = await request.json();

        if (!roleId || !menuId) {
            return sendError('roleId and menuId are required', 400, 'BAD_REQUEST');
        }

        const access = await prisma.menuAccess.upsert({
            where: { roleId_menuId: { roleId, menuId } },
            create: {
                roleId,
                menuId,
                canCreate: canCreate ?? false,
                canRead: canRead ?? true,
                canUpdate: canUpdate ?? false,
                canDelete: canDelete ?? false,
            },
            update: {
                canCreate: canCreate ?? false,
                canRead: canRead ?? true,
                canUpdate: canUpdate ?? false,
                canDelete: canDelete ?? false,
            },
            include: {
                role: { select: { id: true, name: true } },
                menu: { select: { id: true, name: true, path: true } },
            },
        });

        return sendSuccess(access, 'Menu access saved successfully', 200);
    } catch (error) {
        return sendError(
            'Internal Server Error',
            500,
            'SERVER_ERROR',
            error instanceof Error ? error.message : null
        );
    }
}
