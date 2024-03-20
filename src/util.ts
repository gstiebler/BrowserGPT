
export function cleanText(text?: string | null): string {
    if (!text) {
        return '';
    }
    let localText = text.replaceAll('\n', ' ');
    while (localText.includes('  ')) {
        localText = localText.replace('  ', ' ');
    }
    return localText.trim();
}
