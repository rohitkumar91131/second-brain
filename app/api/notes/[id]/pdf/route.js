import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import connectDB from '@/lib/mongodb';
import Note from '@/lib/models/Note';
import Block from '@/lib/models/Block';
import { requireAuth, err, withErrorHandler } from '@/lib/apiHelpers';
import PDFTemplate from '@/components/pdf/PDFTemplate';

export const GET = withErrorHandler(async (request, { params }) => {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const theme = searchParams.get('theme') || 'bright';

    await connectDB();

    // 1. Fetch Note
    const note = await Note.findOne({ _id: params.id, userId: session.user.id }).lean();
    if (!note) return err('Note not found', 404);

    // 2. Fetch Blocks
    const blocks = await Block.find({ entityId: params.id, entityType: 'Note' })
        .sort({ order: 1 })
        .lean();

    // 3. Render PDF to Stream
    try {
        const stream = await renderToStream(
            React.createElement(PDFTemplate, {
                title: note.title || 'Untitled Note',
                blocks: blocks,
                theme: theme
            })
        );

        // Convert stream to buffer
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // 4. Return PDF Response
        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${note.title || 'Note'}.pdf"`,
            },
        });
    } catch (pdfErr) {
        console.error('PDF Generation Error:', pdfErr);
        return err('Failed to generate PDF', 500);
    }
});
