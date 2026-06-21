import { NextResponse } from 'next/server';

type ApiResponseMeta = {
    timestamp: string;
    [key: string]: unknown; // Replaced 'any' with 'unknown' for safer arbitrary properties
};

export function sendSuccess<T>(
    data: T,
    message = 'Success',
    status = 200,
    extraMeta?: Record<string, unknown> // Replaced 'any' with 'unknown'
) {
    const meta: ApiResponseMeta = {
        timestamp: new Date().toISOString(),
        ...extraMeta,
    };

    return NextResponse.json(
        { success: true, message, data, meta },
        { status }
    );
}

export function sendError(
    message = 'Internal Server Error',
    status = 500,
    code = 'SERVER_ERROR',
    details: unknown = null // Replaced 'any' with 'unknown' as error details can be anything
) {
    const meta: ApiResponseMeta = {
        timestamp: new Date().toISOString(),
    };

    return NextResponse.json(
        {
            success: false,
            error: { code, message, details },
            meta,
        },
        { status }
    );
}