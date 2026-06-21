import { sendSuccess } from '@/lib/api-response';

export async function GET() {
    return sendSuccess({ status: 'ok', service: 'glucocare-api' }, 'Service is healthy', 200);
}
