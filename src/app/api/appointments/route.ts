import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canRead) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get('doctorId');
        const date = searchParams.get('date');
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        const appointments = await prisma.appointment.findMany({
            where: {
                ...(isStaff
                    ? doctorId
                        ? { doctorId }
                        : orgRole === 'org:doctor'
                          ? { doctorId: userId }
                          : {}
                    : { patientId: userId }),
                ...(date ? { date: new Date(date) } : {}),
            },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
                doctor: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
            orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        });

        return sendSuccess(appointments, 'Appointments retrieved successfully', 200);
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

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canCreate) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const body = await request.json();
        const { doctorId, date, timeSlot, notes, patientId: bodyPatientId } = body;

        if (!doctorId || !date || !timeSlot) {
            return sendError('doctorId, date, and timeSlot are required', 400, 'BAD_REQUEST');
        }

        const pendingStatus = await prisma.status.findFirst({
            where: { name: 'Scheduled', module: 'APPOINTMENT' },
        });

        if (!pendingStatus) {
            return sendError('Appointment status master belum di-seed', 500, 'SERVER_ERROR');
        }

        const patientId =
            orgRole === 'org:admin' && bodyPatientId ? bodyPatientId : userId;

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                date: new Date(date),
                timeSlot,
                notes: notes ?? null,
                statusId: pendingStatus.id,
            },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
                doctor: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });

        return sendSuccess(appointment, 'Appointment booked successfully', 201);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
