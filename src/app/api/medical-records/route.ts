import { getOrgPermissions } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId, permissions } = await getOrgPermissions();

        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const canCreateRecords = permissions.some(
            (p) => p.menu.path === '/dashboard/medical-records' && p.canCreate
        );

        if (!canCreateRecords) {
            return sendError(
                'Forbidden: Your organization role lacks write access for this module.',
                403,
                'FORBIDDEN'
            );
        }

        const body = await request.json();

        const newRecord = await prisma.medicalRecord.create({
            data: {
                patientId: body.patientId,
                doctorId: userId,
                statusId: body.statusId,
                subjective: body.subjective,
                objective: body.objective,
                assessment: body.assessment,
                plan: body.plan,
            }
        });

        return sendSuccess(newRecord, 'Medical record created successfully', 201);

    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}