import { getOrgPermissions } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';

interface MenuItemNode {
    id: string;
    name: string;
    path: string;
    icon: string | null;
    parentId: string | null;
    children: MenuItemNode[];
    permissions: {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
    };
}

export async function GET() {
    try {
        const { permissions, orgRole } = await getOrgPermissions();

        if (!orgRole) {
            return sendError("Unauthorized", 401, "UNAUTHORIZED", "User does not have an organizational role");
        }

        if (orgRole !== 'org:admin') {
            return sendError("Forbidden", 403, "FORBIDDEN", "User is not an organization administrator");
        }

        const allowedReadPermissions = permissions.filter((p) => p.canRead);
        const allowedMenuIds = allowedReadPermissions.map((p) => p.menuId);

        const menus = await prisma.menu.findMany({
            where: {
                id: { in: allowedMenuIds },
            },
        });

        const menuMap = new Map<string, MenuItemNode>();

        menus.forEach((menu) => {
            const accessRule = allowedReadPermissions.find((p) => p.menuId === menu.id);

            menuMap.set(menu.id, {
                id: menu.id,
                name: menu.name,
                path: menu.path,
                icon: menu.icon,
                parentId: menu.parentId,
                children: [],
                permissions: {
                    canCreate: accessRule?.canCreate ?? false,
                    canUpdate: accessRule?.canUpdate ?? false,
                    canDelete: accessRule?.canDelete ?? false,
                },
            });
        });

        const menuTree: MenuItemNode[] = [];

        menuMap.forEach((node) => {
            if (node.parentId && menuMap.has(node.parentId)) {
                menuMap.get(node.parentId)!.children.push(node);
            } else {
                menuTree.push(node);
            }
        });

        return sendSuccess(menuTree, 'Admin Sidebar menu successfully retrivied', 200);
    } catch (error: unknown) {
        return sendError("Internal Server Error", 500, "SERVER", error instanceof Error ? error.message : "An unknown error occurred");
    }
}