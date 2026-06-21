import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/dashboard';

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        if (isStaff && access?.canRead) {
            const records = await prisma.glucoseRecord.findMany({
                where: targetUserId ? { userId: targetUserId } : undefined,
                include: {
                    type: true,
                    category: true,
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
            return sendSuccess(records, 'Glucose records retrieved successfully', 200);
        }

        const records = await prisma.glucoseRecord.findMany({
            where: { userId },
            include: { type: true, category: true },
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(records, 'Glucose records retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const body = await request.json();
        const { level, notes, typeId, categoryId, userId: bodyUserId } = body;

        if (level === undefined || level === null || !typeId || !categoryId) {
            return sendError('level, typeId, and categoryId are required', 400, 'BAD_REQUEST');
        }

        const parsedLevel = Number(level);
        if (Number.isNaN(parsedLevel) || parsedLevel < 0) {
            return sendError('level must be a valid non-negative number', 400, 'BAD_REQUEST');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        const recordUserId =
            isStaff && access?.canCreate && bodyUserId ? bodyUserId : userId;

        const record = await prisma.glucoseRecord.create({
            data: {
                userId: recordUserId,
                level: parsedLevel,
                notes: notes ?? null,
                typeId,
                categoryId,
            },
            include: { type: true, category: true },
        });

        return sendSuccess(record, 'Glucose record created successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
