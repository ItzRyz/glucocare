import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';
import { evaluateGlucoseLevel, type GlucoseTestType } from '@/lib/glucose-evaluate';

export async function POST(request: Request) {
    try {
        const { authenticated, orgId } = await getOrgPermissions();
        if (!authenticated || !orgId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const body = await request.json();
        const { level, testType = 'fasting' } = body;

        const parsedLevel = Number(level);
        if (Number.isNaN(parsedLevel) || parsedLevel < 0) {
            return sendError('level must be a valid non-negative number', 400, 'BAD_REQUEST');
        }

        if (testType !== 'fasting' && testType !== 'post-meal') {
            return sendError('testType must be "fasting" or "post-meal"', 400, 'BAD_REQUEST');
        }

        const evaluation = evaluateGlucoseLevel(parsedLevel, testType as GlucoseTestType);

        return sendSuccess(
            { level: parsedLevel, testType, ...evaluation },
            'Blood sugar evaluation completed',
            200
        );
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}
