import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

const DEFAULT_SLOTS = [
    '09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '03:00 PM', '04:30 PM',
];

export async function GET(request: Request) {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        const doctorId = searchParams.get('doctorId');
        const date = searchParams.get('date');

        if (!doctorId || !date) {
            return sendError('doctorId and date query parameters are required', 400, 'BAD_REQUEST');
        }

        const booked = await prisma.appointment.findMany({
            where: {
                doctorId,
                date: new Date(date),
                status: { name: { not: 'Cancelled' } },
            },
            select: { timeSlot: true },
        });

        const bookedSlots = new Set(booked.map((a) => a.timeSlot));
        const available = DEFAULT_SLOTS.filter((slot) => !bookedSlots.has(slot));

        return sendSuccess(
            { all: DEFAULT_SLOTS, available, booked: [...bookedSlots] },
            'Time slots retrieved successfully',
            200
        );
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
