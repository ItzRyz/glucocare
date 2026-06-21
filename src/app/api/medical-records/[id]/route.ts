import { sendError } from '@/lib/api-response';
import { getOrgPermissions } from '@/lib/rbac';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authenticated, orgId } = await getOrgPermissions();
    if (!authenticated || !orgId) return sendError('Unauthorized', 401, 'UNAUTHORIZED');

    return sendError('Not implemented', 501, 'NOT_IMPLEMENTED');
  } catch (error) {
    return sendError('Internal Server Error', 500, 'SERVER_ERROR');
  }
}


