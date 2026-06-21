import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const MENU_PATH = '/telemedicine';

async function getAppointmentAccess(
    appointmentId: string,
    userId: string,
    orgRole: string | null
) {
    const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
    });
    if (!appointment) return { appointment: null, allowed: false };

    if (orgRole === 'org:admin') return { appointment, allowed: true };
    if (appointment.patientId === userId || appointment.doctorId === userId) {
        return { appointment, allowed: true };
    }

    return { appointment, allowed: false };
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

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canRead) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const { id } = await params;
        const { appointment, allowed } = await getAppointmentAccess(id, userId, orgRole);

        if (!appointment) return sendError('Appointment not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden', 403, 'FORBIDDEN');

        const full = await prisma.appointment.findUnique({
            where: { id },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
                doctor: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });

        return sendSuccess(full, 'Appointment retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        if (!access?.canUpdate) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const { id } = await params;
        const { appointment, allowed } = await getAppointmentAccess(id, userId, orgRole);

        if (!appointment) return sendError('Appointment not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden', 403, 'FORBIDDEN');

        const body = await request.json();
        let statusId = appointment.statusId;

        if (body.statusName) {
            const status = await prisma.status.findFirst({
                where: { name: body.statusName, module: 'APPOINTMENT' },
            });
            if (!status) {
                return sendError('Invalid appointment status', 400, 'BAD_REQUEST');
            }
            statusId = status.id;
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                date: body.date ? new Date(body.date) : appointment.date,
                timeSlot: body.timeSlot ?? appointment.timeSlot,
                notes: body.notes !== undefined ? body.notes : appointment.notes,
                statusId,
            },
            include: {
                status: true,
                patient: { select: { id: true, name: true, email: true, avatarUrl: true } },
                doctor: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });

        return sendSuccess(updated, 'Appointment updated successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { authenticated, orgId, userId, orgRole, permissions } =
            await getOrgPermissions();

        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const access = permissions.find((p) => p.menu.path === MENU_PATH);
        const { id } = await params;
        const { appointment, allowed } = await getAppointmentAccess(id, userId, orgRole);

        if (!appointment) return sendError('Appointment not found', 404, 'NOT_FOUND');
        if (!allowed) return sendError('Forbidden', 403, 'FORBIDDEN');

        const isOwnPatientAppointment = appointment.patientId === userId;
        if (!access?.canDelete && !isOwnPatientAppointment) {
            return sendError('Forbidden', 403, 'FORBIDDEN');
        }

        const cancelledStatus = await prisma.status.findFirst({
            where: { name: 'Cancelled', module: 'APPOINTMENT' },
        });

        if (cancelledStatus) {
            await prisma.appointment.update({
                where: { id },
                data: { statusId: cancelledStatus.id },
            });
        } else {
            await prisma.appointment.delete({ where: { id } });
        }

        return sendSuccess(null, 'Appointment cancelled successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
