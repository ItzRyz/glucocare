import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

async function getRoomAccess(roomId: string, userId: string, orgRole: string | null) {
    const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
    if (!room) return { room: null, allowed: false };

    if (orgRole === 'org:admin') return { room, allowed: true };
    if (room.patientId === userId || room.doctorId === userId) {
        return { room, allowed: true };
    }

    return { room, allowed: false };
}

export async function GET(request: Request) {
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

        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        if (!roomId) {
            return sendError('roomId query parameter is required', 400, 'BAD_REQUEST');
        }

        const { room, allowed } = await getRoomAccess(roomId, userId, orgRole);
        if (!room) return sendError('Chat room not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden: Anda bukan peserta room ini', 403, 'FORBIDDEN');

        const messages = await prisma.message.findMany({
            where: { roomId },
            include: {
                sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
                type: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        return sendSuccess(messages, 'Messages retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canCreate) {
            return sendError('Forbidden: Anda tidak memiliki akses Create', 403, 'FORBIDDEN');
        }

        const body = await request.json();
        const { roomId, content, typeId } = body;

        if (!roomId || !content?.trim()) {
            return sendError('roomId and content are required', 400, 'BAD_REQUEST');
        }

        const { room, allowed } = await getRoomAccess(roomId, userId, orgRole);
        if (!room) return sendError('Chat room not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden: Anda bukan peserta room ini', 403, 'FORBIDDEN');

        let messageTypeId = typeId;
        if (!messageTypeId) {
            const textType = await prisma.type.findFirst({
                where: { name: 'Text', module: 'MESSAGE' },
            });
            if (!textType) {
                return sendError('Message type master belum di-seed', 500, 'SERVER_ERROR');
            }
            messageTypeId = textType.id;
        }

        const [message] = await prisma.$transaction([
            prisma.message.create({
                data: {
                    roomId,
                    senderId: userId,
                    content: content.trim(),
                    typeId: messageTypeId,
                },
                include: {
                    sender: { select: { id: true, name: true, email: true, avatarUrl: true } },
                    type: true,
                },
            }),
            prisma.chatRoom.update({
                where: { id: roomId },
                data: { updatedAt: new Date() },
            }),
        ]);

        return sendSuccess(message, 'Message sent successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError('Gagal mengirim pesan', 500, 'SERVER_ERROR');
    }
}
