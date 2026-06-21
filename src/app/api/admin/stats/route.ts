import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';
import { getFlaskBaseUrl } from '@/lib/flask-url';

export async function GET() {
    try {
        const { orgRole } = await getOrgPermissions();
        if (!orgRole) return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        if (orgRole !== 'org:admin') return sendError('Forbidden', 403, 'FORBIDDEN');

        const [
            userCount,
            roleCount,
            menuCount,
            appointmentCount,
            glucoseCount,
            predictionCount,
            appointmentsByStatus,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.role.count(),
            prisma.menu.count(),
            prisma.appointment.count(),
            prisma.glucoseRecord.count(),
            prisma.diagnosisPrediction.count(),
            prisma.appointment.groupBy({
                by: ['statusId'],
                _count: { id: true },
            }),
        ]);

        const statuses = await prisma.status.findMany({
            where: { module: 'APPOINTMENT' },
        });
        const statusMap = Object.fromEntries(statuses.map((s) => [s.id, s.name]));

        let mlService: { status: string; service?: string } = { status: 'unavailable' };
        try {
            const res = await fetch(`${getFlaskBaseUrl()}/health`, {
                next: { revalidate: 0 },
            });
            if (res.ok) {
                mlService = await res.json();
            }
        } catch {
            mlService = { status: 'unavailable' };
        }

        return sendSuccess(
            {
                userCount,
                roleCount,
                menuCount,
                appointmentCount,
                glucoseCount,
                predictionCount,
                appointmentsByStatus: appointmentsByStatus.map((row) => ({
                    status: statusMap[row.statusId] ?? 'Unknown',
                    count: row._count.id,
                })),
                mlService,
            },
            'Admin stats retrieved successfully',
            200
        );
    } catch (error) {
        return sendError(
            'Internal Server Error',
            500,
            'SERVER_ERROR',
            error instanceof Error ? error.message : null
        );
    }
}
