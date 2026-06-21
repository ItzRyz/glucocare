import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { id } = await params;
        const prediction = await prisma.diagnosisPrediction.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (!prediction) {
            return sendError('Diagnosis prediction not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && prediction.userId !== userId) {
            return sendError('Forbidden: You can only view your own predictions.', 403, 'FORBIDDEN');
        }

        return sendSuccess(prediction, 'Diagnosis prediction retrieved successfully', 200);
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
        const prediction = await prisma.diagnosisPrediction.findUnique({ where: { id } });

        if (!prediction) {
            return sendError('Diagnosis prediction not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && prediction.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        await prisma.diagnosisPrediction.delete({ where: { id } });
        return sendSuccess(null, 'Diagnosis prediction deleted successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
