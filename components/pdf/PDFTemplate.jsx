import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path } from '@react-pdf/renderer';

// Register fonts if needed, but for now we'll use standard ones
// Font.register({ family: 'Inter', src: '...' });

const styles = (theme) => StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: theme === 'dark' ? '#191919' : '#ffffff',
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#333333' : '#eeeeee',
        paddingBottom: 15,
    },
    brand: {
        fontSize: 18,
        fontWeight: 'extrabold',
        color: theme === 'dark' ? '#ffffff' : '#37352f',
        letterSpacing: -0.5,
    },
    engineInfo: {
        fontSize: 8,
        color: theme === 'dark' ? '#888888' : '#999999',
        textAlign: 'right',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#ffffff' : '#37352f',
        marginBottom: 20,
        marginTop: 10,
    },
    blockContainer: {
        marginBottom: 8,
        flexDirection: 'row',
    },
    paragraph: {
        fontSize: 11,
        lineHeight: 1.6,
        color: theme === 'dark' ? '#cccccc' : '#37352f',
        flexShrink: 1,
    },
    heading1: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#ffffff' : '#37352f',
        marginTop: 20,
        marginBottom: 10,
    },
    heading2: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#ffffff' : '#37352f',
        marginTop: 15,
        marginBottom: 8,
    },
    heading3: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme === 'dark' ? '#ffffff' : '#37352f',
        marginTop: 10,
        marginBottom: 5,
    },
    bullet: {
        width: 15,
        fontSize: 14,
        color: theme === 'dark' ? '#888888' : '#999999',
    },
    numbered: {
        width: 25,
        fontSize: 11,
        color: theme === 'dark' ? '#888888' : '#999999',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#333333' : '#eeeeee',
        marginVertical: 15,
    },
    callout: {
        padding: 15,
        backgroundColor: theme === 'dark' ? '#252525' : '#f1f1ef',
        borderRadius: 8,
        marginVertical: 10,
        flexDirection: 'row',
        gap: 10,
    },
    calloutText: {
        fontSize: 11,
        color: theme === 'dark' ? '#cccccc' : '#37352f',
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? '#333333' : '#eeeeee',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
        color: '#888888',
    },
    table: {
        width: '100%',
        marginVertical: 15,
        borderWidth: 1,
        borderColor: theme === 'dark' ? '#333333' : '#eeeeee',
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? '#333333' : '#eeeeee',
    },
    tableCell: {
        padding: 8,
        flex: 1,
        borderRightWidth: 1,
        borderRightColor: theme === 'dark' ? '#333333' : '#eeeeee',
    },
    tableHeader: {
        backgroundColor: theme === 'dark' ? '#222222' : '#f9f9f8',
        fontWeight: 'bold',
    },
    image: {
        marginVertical: 10,
        borderRadius: 8,
        maxWidth: '100%',
    },
    brandIcon: {
        width: 18,
        height: 18,
        backgroundColor: '#0066cc',
        borderRadius: 5,
        marginRight: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandIconText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Helvetica-Bold',
    }
});

const PDFTemplate = ({ title, blocks, theme = 'bright' }) => {
    const s = styles(theme);

    return (
        <Document>
            <Page size="A4" style={s.page}>
                {/* Header Branded Section */}
                <View style={s.header} fixed>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={s.brandIcon}>
                            <Svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 5.862 3 3 0 1 0 5.232 2.243c.414.004.83.004 1.25 0a3 3 0 1 0 5.232-2.243 4 4 0 0 0 .52-5.862 4 4 0 0 0-2.526-5.77A3 3 0 1 0 12 5Z" />
                                <Path d="M9 14c1.5-1 4-1 5 0" />
                                <Path d="M12 9v4" />
                            </Svg>
                        </View>
                        <Text style={s.brand}>SecondBrain</Text>
                    </View>
                    <View>
                        <Text style={s.engineInfo}>Intelligence Engine 1.0</Text>
                        <Text style={[s.engineInfo, { marginTop: 2 }]}>Generated {new Date().toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Primary Content */}
                <Text style={s.title}>{title}</Text>

                {blocks.map((block, idx) => {
                    // Logic for numbered lists
                    let listNum = 0;
                    if (block.type === 'numbered') {
                        let count = 0;
                        for (let i = idx; i >= 0; i--) {
                            if (blocks[i].type === 'numbered') count++;
                            else break;
                        }
                        listNum = count;
                    }

                    if (block.type === 'divider') return <View key={block.id || idx} style={s.divider} />;

                    if (block.type === 'table') {
                        let rows = [];
                        try {
                            rows = JSON.parse(block.content);
                        } catch (e) { return null; }

                        return (
                            <View key={block.id || idx} style={s.table}>
                                {rows.map((row, rIdx) => (
                                    <View key={rIdx} style={[s.tableRow, rIdx === 0 && s.tableHeader]}>
                                        {row.map((cell, cIdx) => (
                                            <View key={cIdx} style={[s.tableCell, cIdx === row.length - 1 && { borderRightWidth: 0 }]}>
                                                <Text style={[s.paragraph, rIdx === 0 && { fontWeight: 'bold' }]}>{cell}</Text>
                                            </View>
                                        ))}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    if (block.type === 'callout') {
                        return (
                            <View key={block.id || idx} style={s.callout}>
                                <Text style={{ fontSize: 14 }}>💡</Text>
                                <Text style={s.calloutText}>{block.content}</Text>
                            </View>
                        );
                    }

                    if (block.type === 'task') {
                        let taskData = { checked: false, text: block.content };
                        try {
                            if (block.content.startsWith('{')) taskData = JSON.parse(block.content);
                        } catch (e) { }
                        return (
                            <View key={block.id || idx} style={s.blockContainer}>
                                <Text style={[s.paragraph, { marginRight: 8, color: '#999999' }]}>{taskData.checked ? '[x]' : '[ ]'}</Text>
                                <Text style={[s.paragraph, taskData.checked && { textDecoration: 'line-through', color: '#888888' }]}>{taskData.text || block.content}</Text>
                            </View>
                        );
                    }

                    if (block.type === 'link') {
                        let linkData = { url: '', title: block.content };
                        try {
                            if (block.content.startsWith('{')) linkData = JSON.parse(block.content);
                        } catch (e) { }
                        return (
                            <View key={block.id || idx} style={s.blockContainer}>
                                <Text style={[s.paragraph, { color: '#0066cc', textDecoration: 'underline' }]}>{linkData.title || linkData.url || 'Link'}</Text>
                            </View>
                        );
                    }

                    if (block.type === 'image') {
                        if (!block.content) return null;

                        // Handle potential JSON content or direct URL
                        let imageUrl = block.content;
                        try {
                            if (block.content.startsWith('{')) {
                                const parsed = JSON.parse(block.content);
                                imageUrl = parsed.url || parsed.src || imageUrl;
                            }
                        } catch (e) { }

                        // @react-pdf is very strict about extensions.
                        // We need to ensure the URL ends with a known extension.
                        const validExts = ['jpg', 'jpeg', 'png', 'webp'];
                        const urlParts = imageUrl.split('?');
                        const urlWithoutQuery = urlParts[0].toLowerCase();
                        const hasValidExt = validExts.some(ext => urlWithoutQuery.endsWith(`.${ext}`));

                        if (!hasValidExt) {
                            if (imageUrl.includes('cloudinary.com')) {
                                // Cloudinary handles extensions at the end of the public ID path
                                imageUrl = imageUrl.includes('?')
                                    ? imageUrl.replace('?', '.png?')
                                    : `${imageUrl}.png`;
                            } else {
                                // If no valid extension and not Cloudinary, skip to avoid "Not valid image extension" crash
                                return (
                                    <View key={block.id || idx} style={[s.callout, { backgroundColor: theme === 'dark' ? '#222222' : '#f9f9f9', py: 10, px: 15, borderStyle: 'dashed', borderWidth: 1 }]}>
                                        <Text style={[s.calloutText, { color: '#888888', fontSize: 10 }]}>[ Image requires .jpg/.png extension to export ]</Text>
                                    </View>
                                );
                            }
                        }

                        // Skip GIFs as they are still unsupported and crash rendering
                        if (urlWithoutQuery.endsWith('.gif')) {
                            return (
                                <View key={block.id || idx} style={[s.callout, { backgroundColor: theme === 'dark' ? '#222222' : '#f9f9f9', borderStyle: 'dashed', borderWidth: 1 }]}>
                                    <Text style={s.calloutText}>[ GIF Preview: {block.caption || 'Animated Content'} ]</Text>
                                </View>
                            );
                        }

                        return (
                            <View key={block.id || idx} break={false}>
                                <Image
                                    src={imageUrl}
                                    style={s.image}
                                    alt=""
                                />
                                {block.caption && (
                                    <Text style={[s.engineInfo, { textAlign: 'center', marginTop: 4 }]}>{block.caption}</Text>
                                )}
                            </View>
                        );
                    }

                    if (['video', 'audio'].includes(block.type)) {
                        return (
                            <View key={block.id || idx} style={[s.callout, { backgroundColor: theme === 'dark' ? '#222222' : '#f9f9f9', borderStyle: 'dashed', borderWidth: 1 }]}>
                                <Text style={s.calloutText}>[ Media: {block.type.toUpperCase()} content ]</Text>
                            </View>
                        );
                    }

                    let textStyle = s.paragraph;
                    if (block.type === 'heading1') textStyle = s.heading1;
                    if (block.type === 'heading2') textStyle = s.heading2;
                    if (block.type === 'heading3') textStyle = s.heading3;

                    return (
                        <View key={block.id || idx} style={s.blockContainer} wrap={false}>
                            {block.type === 'bullet' && <Text style={s.bullet}>•</Text>}
                            {block.type === 'numbered' && <Text style={s.numbered}>{listNum}.</Text>}
                            <Text style={textStyle}>{block.content}</Text>
                        </View>
                    );
                })}

                {/* Optional Footer */}
                <View style={s.footer} fixed>
                    <Text>© 2026 SecondBrain Tracker</Text>
                    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                </View>
            </Page>
        </Document>
    );
};

export default PDFTemplate;
