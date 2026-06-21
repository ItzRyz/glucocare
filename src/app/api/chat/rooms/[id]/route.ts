import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

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
            where: { name: statusName, module: 'TELEMEDICINE' }
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
