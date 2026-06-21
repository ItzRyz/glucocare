import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

        const { id } = await params;
        const menu = await prisma.menu.findUnique({
            where: { id },
            include: { children: true, roles: { include: { role: true } } },
        });

        if (!menu) return sendError('Menu not found', 404, 'NOT_FOUND');
        return sendSuccess(menu, 'Menu retrieved successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        if (orgRole !== 'org:admin') return sendError('Forbidden', 403, 'FORBIDDEN');

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.menu.findUnique({ where: { id } });
        if (!existing) return sendError('Menu not found', 404, 'NOT_FOUND');

        const updated = await prisma.menu.update({
            where: { id },
            data: {
                name: body.name ?? existing.name,
                path: body.path ?? existing.path,
                icon: body.icon !== undefined ? body.icon : existing.icon,
                parentId: body.parentId !== undefined ? body.parentId : existing.parentId,
            },
            include: { children: true },
        });

        return sendSuccess(updated, 'Menu updated successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        if (orgRole !== 'org:admin') return sendError('Forbidden', 403, 'FORBIDDEN');

        const { id } = await params;
        const existing = await prisma.menu.findUnique({ where: { id } });
        if (!existing) return sendError('Menu not found', 404, 'NOT_FOUND');

        await prisma.menu.delete({ where: { id } });
        return sendSuccess(null, 'Menu deleted successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
