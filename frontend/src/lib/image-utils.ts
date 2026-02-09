export function getAbsoluteImageUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;

    // Use environment variable if set
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return `${process.env.NEXT_PUBLIC_BASE_URL}${url}`;
    }

    // Fallback based on environment
    // In development (local), return relative path since we have rewrites in next.config.mjs
    // and absolute localhost URLs might fail due to container networking or next/image optimization issues
    if (process.env.NODE_ENV === 'development') {
        return url;
    }

    // In production, assume mypaws.in
    return `https://mypaws.in${url}`;
}
