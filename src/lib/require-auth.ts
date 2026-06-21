import { getOrgPermissions } from '@/lib/rbac';
import { sendError } from '@/lib/api-response';

type OrgPermissions = Awaited<ReturnType<typeof getOrgPermissions>>;

export async function requireAuth() {
    const ctx = await getOrgPermissions();
    if (!ctx.authenticated || !ctx.orgId || !ctx.userId) {
        return { ok: false as const, response: sendError('Unauthorized', 401, 'UNAUTHORIZED') };
    }
    return { ok: true as const, ctx };
}

export async function requireAdmin() {
    const ctx = await getOrgPermissions();
    if (!ctx.orgRole) {
        return { ok: false as const, response: sendError('Unauthorized', 401, 'UNAUTHORIZED') };
    }
    if (ctx.orgRole !== 'org:admin') {
        return { ok: false as const, response: sendError('Forbidden', 403, 'FORBIDDEN') };
    }
    return { ok: true as const, ctx };
}

export function hasMenuAccess(
    permissions: OrgPermissions['permissions'],
    menuPath: string,
    action: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete' = 'canRead'
) {
    return permissions.some((p) => p.menu.path === menuPath && p[action]);
}

export function isStaff(orgRole: string | null) {
    return orgRole === 'org:admin' || orgRole === 'org:doctor';
}

export type AuthContext = Extract<Awaited<ReturnType<typeof requireAuth>>, { ok: true }>['ctx'];
