/**
 * Converts a Google Drive share/view link to a direct image URL.
 * If the URL is already a direct link or not a Drive link, returns it as-is.
 *
 * Supported formats:
 *  - https://drive.google.com/file/d/FILE_ID/view?usp=...
 *  - https://drive.google.com/open?id=FILE_ID
 *  - https://drive.google.com/uc?id=FILE_ID&export=view
 */
export function toDirectAvatarUrl(url: string | undefined): string {
  if (!url) return '';

  // Match: /file/d/FILE_ID/...
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (fileMatch) {
    return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`;
  }

  // Match: ?id=FILE_ID (for /open?id=... or /uc?id=...)
  const idMatch = url.match(/drive\.google\.com\/(?:open|uc)\?.*id=([^&]+)/);
  if (idMatch) {
    return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  }

  // Not a Drive link — return as-is
  return url;
}
