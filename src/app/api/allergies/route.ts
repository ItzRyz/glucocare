import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const DOCTOR_MENU_PATH = '/records';
const PATIENT_MENU_PATH = '/records/history';
const LEGACY_MENU_PATH = '/dashboard/medical-records';

function hasAllergyReadAccess(
    permissions: Awaited<ReturnType<typeof getOrgPermissions>>['permissions']
) {
    return permissions.some(
        (p) =>
            (p.menu.path === DOCTOR_MENU_PATH ||
                p.menu.path === PATIENT_MENU_PATH ||
                p.menu.path === LEGACY_MENU_PATH ||
                p.menu.path === '/dashboard') &&
            p.canRead
    );
}

function hasAllergyWriteAccess(
    permissions: Awaited<ReturnType<typeof getOrgPermissions>>['permissions'],
    action: 'canCreate' | 'canUpdate' | 'canDelete'
) {
    return permissions.some(
        (p) =>
            (p.menu.path === DOCTOR_MENU_PATH ||
                p.menu.path === LEGACY_MENU_PATH ||
                p.menu.path === '/dashboard') &&
            p[action]
    );
}

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        if (!hasAllergyReadAccess(permissions)) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        const allergies = await prisma.allergy.findMany({
            where: isStaff
                ? patientId
                    ? { patientId }
                    : undefined
                : { patientId: userId },
            include: {
                category: true,
                patient: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return sendSuccess(allergies, 'Allergies retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';
        if (!isStaff && !hasAllergyWriteAccess(permissions, 'canCreate')) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const body = await request.json();
        const { allergen, reaction, categoryId, patientId: bodyPatientId } = body;

        if (!allergen || !categoryId) {
            return sendError('allergen and categoryId are required', 400, 'BAD_REQUEST');
        }

        const patientId =
            isStaff && bodyPatientId ? bodyPatientId : userId;

        const allergy = await prisma.allergy.create({
            data: {
                patientId,
                allergen,
                reaction: reaction ?? null,
                categoryId,
            },
            include: { category: true },
        });

        return sendSuccess(allergy, 'Allergy created successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
