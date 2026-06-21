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
        const assessment = await prisma.weeklyAssessment.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        if (!assessment) {
            return sendError('Assessment not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && assessment.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        return sendSuccess(assessment, 'Assessment retrieved successfully', 200);
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
        const assessment = await prisma.weeklyAssessment.findUnique({ where: { id } });

        if (!assessment) {
            return sendError('Assessment not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && assessment.userId !== userId) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        await prisma.weeklyAssessment.delete({ where: { id } });
        return sendSuccess(null, 'Assessment deleted successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
