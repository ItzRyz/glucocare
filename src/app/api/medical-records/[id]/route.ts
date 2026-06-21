import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

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

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        const record = await prisma.medicalRecord.findUnique({
            where: { id },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
                doctor: { select: { id: true, name: true, email: true, avatarUrl: true } },
                chatRoom: { include: { status: true } },
                diagnoses: true,
                vitalSigns: true,
                labResults: { include: { category: true } },
                prescriptions: { include: { items: true } },
            },
        });

        if (!record) {
            return sendError('Medical record not found', 404, 'NOT_FOUND');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && record.patientId !== userId) {
            return sendError(
                'Forbidden: You can only view your own medical records.',
                403,
                'FORBIDDEN'
            );
        }

        return sendSuccess(record, 'Medical record retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

function hasRecordUpdateAccess(
    permissions: Awaited<ReturnType<typeof getOrgPermissions>>['permissions']
) {
    return permissions.some(
        (p) =>
            (p.menu.path === DOCTOR_MENU_PATH || p.menu.path === LEGACY_MENU_PATH) &&
            p.canUpdate
    );
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if (!hasRecordUpdateAccess(permissions)) {
            return sendError(
                'Forbidden: Your organization role lacks update access for this module.',
                403,
                'FORBIDDEN'
            );
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.medicalRecord.findUnique({ where: { id } });
        if (!existing) {
            return sendError('Medical record not found', 404, 'NOT_FOUND');
        }

        const updated = await prisma.medicalRecord.update({
            where: { id },
            data: {
                statusId: body.statusId ?? existing.statusId,
                subjective: body.subjective ?? existing.subjective,
                objective: body.objective ?? existing.objective,
                assessment: body.assessment ?? existing.assessment,
                plan: body.plan ?? existing.plan,
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

        if (body.vitalSigns) {
            await prisma.vitalSign.upsert({
                where: { medicalRecordId: id },
                update: body.vitalSigns,
                create: { medicalRecordId: id, ...body.vitalSigns },
            });
        }

        if (body.diagnoses?.length) {
            await prisma.medicalDiagnosis.deleteMany({ where: { medicalRecordId: id } });
            await prisma.medicalDiagnosis.createMany({
                data: body.diagnoses.map((d: { code: string; name: string; notes?: string }) => ({
                    medicalRecordId: id,
                    code: d.code,
                    name: d.name,
                    notes: d.notes ?? null,
                })),
            });
        }

        const result = await prisma.medicalRecord.findUnique({
            where: { id },
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

        return sendSuccess(result ?? updated, 'Medical record updated successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

function hasRecordDeleteAccess(
    permissions: Awaited<ReturnType<typeof getOrgPermissions>>['permissions']
) {
    return permissions.some(
        (p) =>
            (p.menu.path === DOCTOR_MENU_PATH || p.menu.path === LEGACY_MENU_PATH) &&
            p.canDelete
    );
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, permissions } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if (!hasRecordDeleteAccess(permissions)) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const { id } = await params;
        const existing = await prisma.medicalRecord.findUnique({ where: { id } });
        if (!existing) {
            return sendError('Medical record not found', 404, 'NOT_FOUND');
        }

        await prisma.medicalRecord.delete({ where: { id } });
        return sendSuccess(null, 'Medical record deleted successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
