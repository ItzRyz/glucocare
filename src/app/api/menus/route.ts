import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET() {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

        const menus = await prisma.menu.findMany({
            include: {
                children: true,
            },
        });

        return sendSuccess(menus, 'Menus retrieved successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

        const allowedMenuIds = permissions
            .filter((p) => p.canCreate)
            .map((p) => p.menuId);

        const allowedMenus = await prisma.menu.findMany({
            where: {
                id: { in: allowedMenuIds }
            },
            include: {
                children: true,
            },
        });

        return sendSuccess(allowedMenus, 'Allowed menus retrieved successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
