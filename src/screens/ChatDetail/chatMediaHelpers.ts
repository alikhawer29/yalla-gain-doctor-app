const CHAT_MEDIA_ORIGIN = 'https://custom-dev.onlinetestingserver.com';

const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|bmp|heic)(\?|$)/i;

export function resolveChatMediaUrl(url: string): string {
    const u = url.trim();
    if (!u) return u;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.startsWith('//')) return `https:${u}`;
    if (u.startsWith('/')) return `${CHAT_MEDIA_ORIGIN}${u}`;
    return `${CHAT_MEDIA_ORIGIN}/${u}`;
}

export function isLikelyImageMime(mime: string | null | undefined): boolean {
    return !!mime && /^image\//i.test(mime.trim());
}

export function looksLikeImageFromNameOrUrl(path: string | null | undefined): boolean {
    if (!path) return false;
    return IMAGE_EXT_RE.test(path.split('?')[0]);
}

export type RichFileDisplay = {
    url: string | null;
    displayUrl: string | null;
    label: string;
    isImage: boolean;
};

/** API may return `file` as string URLs or objects like `{ url, name, mime }`. */
export function fileEntryToRichDisplay(entry: unknown): RichFileDisplay | null {
    if (entry == null) return null;

    let mime: string | null = null;

    if (typeof entry === 'string') {
        const url = entry.trim();
        if (!url) return null;
        let label = 'File';
        try {
            label = decodeURIComponent((url.split('/').pop() || 'File').split('?')[0]);
        } catch {
            label = url.length > 40 ? `${url.slice(0, 40)}…` : url;
        }
        const displayUrl = resolveChatMediaUrl(url);
        const isImage = looksLikeImageFromNameOrUrl(url);
        return { url, displayUrl, label, isImage };
    }

    if (typeof entry === 'object') {
        const o = entry as Record<string, unknown>;
        if (typeof o.mime_type === 'string') mime = o.mime_type;
        else if (typeof o.mime === 'string') mime = o.mime;
        else if (typeof o.content_type === 'string') mime = o.content_type;
        else if (typeof o.type === 'string' && /^image\//i.test(o.type))
            mime = o.type;

        const urlRaw =
            typeof o.url === 'string'
                ? o.url
                : typeof o.file_url === 'string'
                  ? o.file_url
                  : typeof o.path === 'string'
                    ? o.path
                    : typeof o.file === 'string'
                      ? o.file
                      : null;
        const url = urlRaw?.trim() || null;
        const name =
            typeof o.name === 'string'
                ? o.name
                : typeof o.file_name === 'string'
                  ? o.file_name
                  : typeof o.original_name === 'string'
                    ? o.original_name
                    : null;
        if (!url && !name) return null;
        let label = name || 'File';
        if (url && !name) {
            try {
                label = decodeURIComponent((url.split('/').pop() || 'File').split('?')[0]);
            } catch {
                label = 'File';
            }
        }
        const displayUrl = url ? resolveChatMediaUrl(url) : null;
        const isImage =
            isLikelyImageMime(mime) ||
            (!!url && looksLikeImageFromNameOrUrl(url)) ||
            (!!name && looksLikeImageFromNameOrUrl(name));
        return { url, displayUrl, label, isImage };
    }

    return null;
}

export function pendingAttachmentIsImage(a: {
    uri: string;
    name: string;
    type: string;
}): boolean {
    return (
        isLikelyImageMime(a.type) ||
        looksLikeImageFromNameOrUrl(a.name) ||
        looksLikeImageFromNameOrUrl(a.uri)
    );
}
