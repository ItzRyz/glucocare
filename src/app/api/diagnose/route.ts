import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';
import { predict } from '@/lib/ml-model';

const VALID_MODELS = ['randomforest', 'logisticregression'] as const;
type ModelName = (typeof VALID_MODELS)[number];

export async function GET(request: Request) {
    try {
        const { authenticated, orgId, userId, orgRole } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const { searchParams } = new URL(request.url);
        const targetUserId = searchParams.get('userId');
        const isStaff = orgRole === 'org:admin' || orgRole === 'org:doctor';

        const predictions = await prisma.diagnosisPrediction.findMany({
            where: isStaff && targetUserId ? { userId: targetUserId } : { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return sendSuccess(predictions, 'Diagnosis predictions retrieved successfully', 200);
    } catch (error) {
        console.error(error);
        return sendError('Internal Server Error', 500, 'SERVER_ERROR');
    }
}

export async function POST(request: Request) {
    try {
        const { authenticated, orgId, userId } = await getOrgPermissions();
        if (!authenticated || !orgId || !userId) {
            return sendError('Unauthorized', 401, 'UNAUTHORIZED');
        }

        const body = await request.json();
        const { model = 'randomforest', save = true, ...features } = body;

        if (!VALID_MODELS.includes(model as ModelName)) {
            return sendError(
                'model must be "randomforest" or "logisticregression"',
                400,
                'BAD_REQUEST'
            );
        }

        // Call the ML model directly — no HTTP roundtrip needed
        const result = predict(model as ModelName, features);

        let saved = null;
        if (save) {
            saved = await prisma.diagnosisPrediction.create({
                data: {
                    userId,
                    model: result.model ?? model,
                    features,
                    prediction: result.prediction,
                    probability: result.probability,
                },
            });
        }

        return sendSuccess(
            { ...result, id: saved?.id ?? null },
            'Diagnosis prediction completed',
            200
        );
    } catch (error) {
        console.error(error);
        return sendError(
            'Prediction failed. Please try again.',
            500,
            'PREDICTION_ERROR'
        );
    }
}
