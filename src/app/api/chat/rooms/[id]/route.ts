import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

async function getRoomAccess(roomId: string, userId: string, orgRole: string | null) {
    const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        include: {
            patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
            doctor: { select: { id: true, name: true, email: true, avatarUrl: true } },
            status: true,
        },
    });
    if (!room) return { room: null, allowed: false };

    if (orgRole === 'org:admin') return { room, allowed: true };
    if (room.patientId === userId || room.doctorId === userId) {
        return { room, allowed: true };
    }

    return { room, allowed: false };
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        const { id: roomId } = await params;

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canRead) {
            return sendError('Forbidden: Anda tidak memiliki akses Read', 403, 'FORBIDDEN');
        }

        const { room, allowed } = await getRoomAccess(roomId, userId, orgRole);
        if (!room) return sendError('Chat room not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden: Anda bukan peserta room ini', 403, 'FORBIDDEN');

        return sendSuccess(room, 'Chat room retrieved successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authenticated, orgId, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        const { id: roomId } = await params;
        const { statusName } = await req.json();

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canUpdate) {
            return sendError('Forbidden: Anda tidak memiliki akses Update', 403, 'FORBIDDEN');
        }

        const targetStatus = await prisma.status.findFirst({
            where: { name: statusName, module: 'CHAT' }
        });

        if (!targetStatus) return sendError('Status tidak valid', 400, 'BAD_REQUEST');

        const updatedRoom = await prisma.chatRoom.update({
            where: { id: roomId },
            data: { statusId: targetStatus.id }
        });

        return sendSuccess(updatedRoom, 'Room berhasil diperbarui', 200);
    } catch (error) {
        return sendError('Gagal memperbarui room', 500, 'SERVER_ERROR');
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { authenticated, orgId, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        const { id: roomId } = await params;

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canDelete) {
            return sendError('Forbidden: Anda tidak memiliki akses Delete', 403, 'FORBIDDEN');
        }

        await prisma.chatRoom.delete({
            where: { id: roomId }
        });

        return sendSuccess(null, 'Room dan riwayat pesan berhasil dihapus oleh Admin', 200);
    } catch (error) {
        return sendError('Gagal menghapus room', 500, 'SERVER_ERROR');
    }
}

