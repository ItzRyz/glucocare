import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

async function getMessageAccess(messageId: string, userId: string, orgRole: string | null) {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: { room: true },
    });
    if (!message) return { message: null, allowed: false };

    if (orgRole === 'org:admin') return { message, allowed: true };
    if (message.room.patientId === userId || message.room.doctorId === userId) {
        return { message, allowed: true };
    }

    return { message, allowed: false };
}

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

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canRead) {
            return sendError('Forbidden: Anda tidak memiliki akses Read', 403, 'FORBIDDEN');
        }

        const { id } = await params;
        const { message, allowed } = await getMessageAccess(id, userId, orgRole);

        if (!message) return sendError('Message not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden: Anda bukan peserta room ini', 403, 'FORBIDDEN');

        const fullMessage = await prisma.message.findUnique({
            where: { id },
            include: {
                sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
                type: true,
            },
        });

        return sendSuccess(fullMessage, 'Message retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canUpdate) {
            return sendError('Forbidden: Anda tidak memiliki akses Update', 403, 'FORBIDDEN');
        }

        const { id } = await params;
        const { message, allowed } = await getMessageAccess(id, userId, orgRole);

        if (!message) return sendError('Message not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden: Anda bukan peserta room ini', 403, 'FORBIDDEN');

        const body = await request.json();
        const updated = await prisma.message.update({
            where: { id },
            data: {
                isRead: body.isRead ?? message.isRead,
                content: body.content ?? message.content,
            },
            include: {
                sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
                type: true,
            },
        });

        return sendSuccess(updated, 'Message updated successfully', 200);
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
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canDelete) {
            return sendError('Forbidden: Anda tidak memiliki akses Delete', 403, 'FORBIDDEN');
        }

        const { id } = await params;
        const { message, allowed } = await getMessageAccess(id, userId, orgRole);

        if (!message) return sendError('Message not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden', 403, 'FORBIDDEN');

        if (message.senderId !== userId && orgRole !== 'org:admin') {
            return sendError('Forbidden: Hanya pengirim atau admin yang dapat menghapus pesan', 403, 'FORBIDDEN');
        }

        await prisma.message.delete({ where: { id } });
        return sendSuccess(null, 'Message deleted successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
