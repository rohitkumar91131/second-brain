/**
 * Helper to process blocks for PDF generation.
 * Specifically handles images by pre-fetching them and converting to base64.
 */

export async function processBlocksForPDF(blocks) {
    const processedBlocks = await Promise.all(blocks.map(async (block) => {
        if (block.type === 'image' && block.content) {
            try {
                let imageUrl = block.content;

                // Handle JSON content if applicable
                try {
                    if (imageUrl.startsWith('{')) {
                        const parsed = JSON.parse(imageUrl);
                        imageUrl = parsed.url || parsed.src || imageUrl;
                    }
                } catch (e) { }

                // Robust Cloudinary extension handling:
                // Force PNG to ensure compatibility with @react-pdf/renderer
                if (imageUrl.includes('cloudinary.com')) {
                    const [baseUrl, query] = imageUrl.split('?');
                    let cleanUrl = baseUrl.replace(/\.(jpg|jpeg|png|webp|gif|avif|heic)$/i, '');
                    imageUrl = query ? `${cleanUrl}.png?${query}` : `${cleanUrl}.png`;
                }

                // Fetch the image
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    console.error(`Failed to fetch image: ${imageUrl} - Status: ${response.status}`);
                    return block;
                }

                const buffer = await response.arrayBuffer();
                const contentType = response.headers.get('content-type') || 'image/png';
                const base64 = Buffer.from(buffer).toString('base64');
                const dataUrl = `data:${contentType};base64,${base64}`;

                // Return updated block with base64 content
                return {
                    ...block,
                    content: dataUrl,
                    originalUrl: imageUrl // Keep for reference if needed
                };
            } catch (error) {
                console.error('Error processing image for PDF:', error);
                return block;
            }
        }
        return block;
    }));

    return processedBlocks;
}

/**
 * Fetches the app logo and returns it as a base64 Data URL.
 */
export async function getLogoBase64() {
    const logoUrl = "https://icon-to-image-convertor.vercel.app/api/generate-icon?library=lucide&iconName=Brain&size=256&color=%23818cf8&format=png";
    try {
        const response = await fetch(logoUrl);
        if (!response.ok) return logoUrl;
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        return `data:image/png;base64,${base64}`;
    } catch (e) {
        return logoUrl;
    }
}
