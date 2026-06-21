import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';
import { getFlaskBaseUrl } from '@/lib/flask-url';
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

        const endpoint = `${getFlaskBaseUrl()}/${model}`;
        const flaskResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(features),
        });

        const result = await flaskResponse.json();

        if (!flaskResponse.ok) {
            return sendError(
                result.message ?? 'Prediction service error',
                flaskResponse.status,
                'PREDICTION_ERROR',
                result
            );
        }

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
            'Prediction service unavailable. Ensure the Flask server is running.',
            503,
            'SERVICE_UNAVAILABLE'
        );
    }
}
