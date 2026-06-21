import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

        const { searchParams } = new URL(request.url);
        const creatableOnly = searchParams.get('creatable') === 'true';

        if (creatableOnly) {
            const allowedMenuIds = permissions
                .filter((p) => p.canCreate)
                .map((p) => p.menuId);

            const allowedMenus = await prisma.menu.findMany({
                where: { id: { in: allowedMenuIds } },
                include: { children: true },
            });

            return sendSuccess(allowedMenus, 'Creatable menus retrieved successfully', 200);
        }

        const menus = await prisma.menu.findMany({
            include: { children: true },
            orderBy: { name: 'asc' },
        });

        return sendSuccess(menus, 'Menus retrieved successfully', 200);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        if (orgRole !== 'org:admin') return sendError('Forbidden', 403, 'FORBIDDEN');

        const { name, path, icon, parentId } = await request.json();

        if (!name || !path) {
            return sendError('name and path are required', 400, 'BAD_REQUEST');
        }

        const menu = await prisma.menu.create({
            data: {
                name,
                path,
                icon: icon ?? null,
                parentId: parentId ?? null,
            },
            include: { children: true },
        });

        return sendSuccess(menu, 'Menu created successfully', 201);
    } catch (error) {
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
