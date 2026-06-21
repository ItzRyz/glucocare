import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET() {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const doctorRole = await prisma.role.findUnique({
            where: { clerkRoleSlug: 'org:doctor' },
        });

        if (!doctorRole) {
            return sendError('Doctor role not found', 500, 'SERVER_ERROR');
        }

        const doctors = await prisma.user.findMany({
            where: { roleId: doctorRole.id },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                role: { select: { name: true } },
            },
            orderBy: { name: 'asc' },
        });

        return sendSuccess(doctors, 'Doctors retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
