import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET() {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });

        return sendSuccess(categories, 'Categories retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
