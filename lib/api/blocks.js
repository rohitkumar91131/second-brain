import Block from '@/lib/models/Block'
import Note from '@/lib/models/Note'
import JournalEntry from '@/lib/models/JournalEntry'
import { generatePreview } from '@/lib/utils/preview'

/**
 * Updates the preview field of a Note or JournalEntry.
 * @param {string} entityId - The ID of the owner entity
 * @param {string} entityType - The type of the owner entity ('Note' or 'JournalEntry')
 */
export async function updateEntityPreview(entityId, entityType) {
    const blocks = await Block.find({ entityId, entityType }).sort({ order: 1 }).lean();
    const previewText = generatePreview(blocks);

    if (entityType === 'Note') {
        await Note.findByIdAndUpdate(entityId, { $set: { preview: previewText } });
    } else if (entityType === 'JournalEntry') {
        await JournalEntry.findByIdAndUpdate(entityId, { $set: { preview: previewText } });
    }
}
