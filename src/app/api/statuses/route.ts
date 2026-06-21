import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET(request: Request) {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        const module = searchParams.get('module');

        const statuses = await prisma.status.findMany({
            where: module ? { module } : undefined,
            orderBy: { name: 'asc' },
        });

        return sendSuccess(statuses, 'Statuses retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
