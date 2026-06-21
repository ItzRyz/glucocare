import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/dashboard';

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        if (isStaff && !access?.canRead) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const assessments = await prisma.weeklyAssessment.findMany({
            where: isStaff && targetUserId ? { userId: targetUserId } : { userId },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(assessments, 'Weekly assessments retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId, permissions } = await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canCreate) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const body = await request.json();
        const { exercise, diet, symptoms } = body;

        if (exercise === undefined || diet === undefined) {
            return sendError('exercise and diet are required', 400, 'BAD_REQUEST');
        }

        const assessment = await prisma.weeklyAssessment.create({
            data: {
                userId,
                exercise: Boolean(exercise),
                diet: Boolean(diet),
                symptoms: symptoms ?? null,
            },
        });

        return sendSuccess(assessment, 'Weekly assessment submitted successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
