/**
 * Generates a text preview from an array of blocks.
 * @param {Array} blocks - Array of block objects
 * @param {number} maxLength - Maximum length of the preview string
 * @returns {string} - The generated preview text
 */
export function generatePreview(blocks, maxLength = 200) {
    if (!blocks || !Array.isArray(blocks)) return '';

    return blocks
        .filter(b => ['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'numbered', 'callout'].includes(b.type))
        .map(b => b.content)
        .filter(Boolean)
        .join(' ')
        .substring(0, maxLength);
}
