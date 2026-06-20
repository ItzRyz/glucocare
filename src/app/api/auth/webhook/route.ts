import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { id, email_addresses, first_name, last_name, image_url } = payload.data;
        const type = payload.type;

        if (type === 'user.created') {
            const email = email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim();

            const defaultRole = await prisma.role.findUnique({ where: { name: 'PATIENT' } });

            if (!defaultRole) {
                return sendError('Default role not found', 500, 'ROLE_NOT_FOUND');
            }

            await prisma.user.create({
                data: {
                    id: id,
                    email: email,
                    name: name || 'Glucocare User',
                    avatarUrl: image_url,
                    roleId: defaultRole.id,
                },
            });

            return sendSuccess(null, 'User synced successfully', 201);
        }

        return sendSuccess(null, 'Webhook ignored', 200);
    } catch (error: any) {
        return sendError(error.message, 500, 'SERVER_ERROR');
    }
}