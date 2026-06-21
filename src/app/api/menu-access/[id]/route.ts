import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        if (orgRole !== 'org:admin') return sendError('Forbidden', 403, 'FORBIDDEN');

        const { id } = await params;
        const existing = await prisma.menuAccess.findUnique({ where: { id } });
        if (!existing) return sendError('Menu access not found', 404, 'NOT_FOUND');

        await prisma.menuAccess.delete({ where: { id } });
        return sendSuccess(null, 'Menu access removed successfully', 200);
    } catch (error) {
        return sendError(
            'Internal Server Error',
            500,
            'SERVER_ERROR',
            error instanceof Error ? error.message : null
        );
    }
}
