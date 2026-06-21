import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';
import { predict } from '@/lib/ml-model';

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

        // ML model runs in-process (TypeScript) — always available
        let mlService: { status: string; service?: string } = { status: 'unavailable' };
        try {
            // Warm-up call: run a tiny dummy prediction to confirm the model is loaded
            predict('randomforest', {
                Age: '45', Gender: 'Male',
                Polyuria: 'No', Polydipsia: 'No', 'sudden weight loss': 'No',
                weakness: 'No', Polyphagia: 'No', 'Genital thrush': 'No',
                'visual blurring': 'No', Itching: 'No', Irritability: 'No',
                'delayed healing': 'No', 'partial paresis': 'No',
                'muscle stiffness': 'No', Alopecia: 'No', Obesity: 'No',
            });
            mlService = { status: 'ok', service: 'glucocare-ml' };
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
