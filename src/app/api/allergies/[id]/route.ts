import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        const allergy = await prisma.allergy.findUnique({
            where: { id },
            include: {
                category: true,
                patient: { select: { id: true, name: true, email: true } },
            },
        });

        if (!allergy) {
            return sendError('Allergy not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && allergy.patientId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        return sendSuccess(allergy, 'Allergy retrieved successfully', 200);
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
        const { authenticated, orgId, userId, orgRole } = await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        const existing = await prisma.allergy.findUnique({ where: { id } });

        if (!existing) {
            return sendError('Allergy not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && existing.patientId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const body = await request.json();
        const updated = await prisma.allergy.update({
            where: { id },
            data: {
                allergen: body.allergen ?? existing.allergen,
                reaction: body.reaction !== undefined ? body.reaction : existing.reaction,
                categoryId: body.categoryId ?? existing.categoryId,
            },
            include: { category: true },
        });

        return sendSuccess(updated, 'Allergy updated successfully', 200);
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
        const { authenticated, orgId, userId, orgRole } = await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        const existing = await prisma.allergy.findUnique({ where: { id } });

        if (!existing) {
            return sendError('Allergy not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && existing.patientId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        await prisma.allergy.delete({ where: { id } });
        return sendSuccess(null, 'Allergy deleted successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
