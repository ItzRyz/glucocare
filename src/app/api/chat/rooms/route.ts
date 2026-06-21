import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

export async function GET() {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access || !access.canRead) {
            return sendError('Forbidden: Anda tidak memiliki akses Read', 403, 'FORBIDDEN');
        }

        if (orgRole === 'org:admin') {
            const allRooms = await prisma.chatRoom.findMany({
                include: { patient: true, doctor: true, status: true },
                orderBy: { updatedAt: 'desc' }
            });
            return sendSuccess(allRooms, 'Chat rooms retrieved successfully', 200);
        }

        const userRooms = await prisma.chatRoom.findMany({
            where: {
                OR: [
                    { patientId: userId },
                    { doctorId: userId }
                ]
            },
            include: { patient: true, doctor: true, status: true },
            orderBy: { updatedAt: 'desc' }
        });

        return sendSuccess(userRooms, 'Chat rooms retrieved successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(req: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access || !access.canCreate) {
            return sendError('Forbidden: Anda tidak memiliki akses Create', 403, 'FORBIDDEN');
        }

        const { patientId, doctorId } = await req.json();

        const activeStatus = await prisma.status.findFirst({
            where: { name: 'Active', module: 'CHAT' },
        });

        if (!activeStatus) return sendError('Status master Active belum di-seed', 500, 'SERVER_ERROR');

        const newRoom = await prisma.chatRoom.create({
            data: {
                patientId: orgRole === 'org:admin' ? patientId : userId,
                doctorId: doctorId,
                statusId: activeStatus.id,
            },
        });

        return sendSuccess(newRoom, 'Chat room created successfully', 201);
    } catch (error) {
        return sendError('Gagal membuat room chat', 500, 'SERVER_ERROR');
    }
}

