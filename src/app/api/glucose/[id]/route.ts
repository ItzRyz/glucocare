import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/dashboard';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        const record = await prisma.glucoseRecord.findUnique({
            where: { id },
            include: {
                type: true,
                category: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (!record) {
            return sendError('Glucose record not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && record.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        return sendSuccess(record, 'Glucose record retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        const { id } = await params;
        const existing = await prisma.glucoseRecord.findUnique({ where: { id } });

        if (!existing) {
            return sendError('Glucose record not found', 404, 'NOT_FOUND');
        }

        if (!isStaff && existing.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        if (isStaff && !access?.canUpdate && existing.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const body = await request.json();
        const updated = await prisma.glucoseRecord.update({
            where: { id },
            data: {
                level: body.level !== undefined ? Number(body.level) : existing.level,
                notes: body.notes !== undefined ? body.notes : existing.notes,
                typeId: body.typeId ?? existing.typeId,
                categoryId: body.categoryId ?? existing.categoryId,
            },
            include: { type: true, category: true },
        });

        return sendSuccess(updated, 'Glucose record updated successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        const { id } = await params;
        const existing = await prisma.glucoseRecord.findUnique({ where: { id } });

        if (!existing) {
            return sendError('Glucose record not found', 404, 'NOT_FOUND');
        }

        if (!isStaff && existing.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        if (isStaff && !access?.canDelete && existing.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        await prisma.glucoseRecord.delete({ where: { id } });
        return sendSuccess(null, 'Glucose record deleted successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
