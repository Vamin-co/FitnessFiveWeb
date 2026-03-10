const FALLBACK_INTERNAL_PATH = '/dashboard';

export function sanitizeInternalPath(
    value: string | null | undefined,
    fallback: string = FALLBACK_INTERNAL_PATH
): string {
    if (!value) {
        return fallback;
    }

    if (!value.startsWith('/')) {
        return fallback;
    }

    if (value.startsWith('//')) {
        return fallback;
    }

    try {
        const parsed = new URL(value, 'http://fitnessfive.local');
        if (parsed.origin !== 'http://fitnessfive.local') {
            return fallback;
        }

        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return fallback;
    }
}
