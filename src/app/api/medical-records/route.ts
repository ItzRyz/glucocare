import { getOrgPermissions } from '@/lib/rbac';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';

const DOCTOR_MENU_PATH = '/records';
const PATIENT_MENU_PATH = '/records/history';
const LEGACY_MENU_PATH = '/dashboard/medical-records';

function hasRecordReadAccess(
    permissions: Awaited<ReturnType<typeof getOrgPermissions>>['permissions']
) {
    return permissions.some(
        (p) =>
            (p.menu.path === DOCTOR_MENU_PATH ||
                p.menu.path === PATIENT_MENU_PATH ||
                p.menu.path === LEGACY_MENU_PATH) &&
            p.canRead
    );
}

function hasRecordCreateAccess(
    permissions: Awaited<ReturnType<typeof getOrgPermissions>>['permissions']
) {
    return permissions.some(
        (p) =>
            (p.menu.path === DOCTOR_MENU_PATH ||
                p.menu.path === LEGACY_MENU_PATH) &&
            p.canCreate
    );
}

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if (!hasRecordReadAccess(permissions)) {
            return sendError(
                'Forbidden: Your organization role lacks read access for this module.',
                403,
                'FORBIDDEN'
            );
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        const records = await prisma.medicalRecord.findMany({
            where: isStaff
                ? patientId
                    ? { patientId }
                    : undefined
                : { patientId: userId },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true } },
                doctor: { select: { id: true, name: true, email: true } },
                diagnoses: true,
                vitalSigns: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(records, 'Medical records retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId, permissions } = await getOrgPermissions();

        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if (!hasRecordCreateAccess(permissions)) {
            return sendError(
                'Forbidden: Your organization role lacks write access for this module.',
                403,
                'FORBIDDEN'
            );
        }

        const body = await request.json();

        if (!body.patientId || !body.statusId) {
            return sendError('patientId and statusId are required', 400, 'BAD_REQUEST');
        }

        if (!body.subjective || !body.objective || !body.assessment || !body.plan) {
            return sendError(
                'subjective, objective, assessment, and plan are required',
                400,
                'BAD_REQUEST'
            );
        }

        const newRecord = await prisma.medicalRecord.create({
            data: {
                patientId: body.patientId,
                doctorId: userId,
                statusId: body.statusId,
                chatRoomId: body.chatRoomId ?? null,
                subjective: body.subjective,
                objective: body.objective,
                assessment: body.assessment,
                plan: body.plan,
                diagnoses: body.diagnoses?.length
                    ? { create: body.diagnoses }
                    : undefined,
                vitalSigns: body.vitalSigns
                    ? { create: body.vitalSigns }
                    : undefined,
                labResults: body.labResults?.length
                    ? { create: body.labResults }
                    : undefined,
                prescriptions: body.prescriptionItems?.length
                    ? {
                          create: {
                              items: { create: body.prescriptionItems },
                          },
                      }
                    : undefined,
            },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true } },
                doctor: { select: { id: true, name: true, email: true } },
                diagnoses: true,
                vitalSigns: true,
                labResults: true,
                prescriptions: { include: { items: true } },
            },
        });

        return sendSuccess(newRecord, 'Medical record created successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
