const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
let MONGODB_URI = '';

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const lines = envFile.split('\n');
    for (const line of lines) {
        if (line.startsWith('MONGODB_URI=')) {
            MONGODB_URI = line.substring(line.indexOf('=') + 1).trim();
            // Remove quotes if present
            MONGODB_URI = MONGODB_URI.replace(/^["']|["']$/g, '');
            break;
        }
    }
}

const OldNoteSchema = new mongoose.Schema({
    content: Array,
    title: String
}, { strict: false });

const BlockSchema = new mongoose.Schema({
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    entityType: { type: String, required: true, enum: ['Note', 'JournalEntry'], index: true },
    type: { type: String, required: true },
    content: { type: String, default: '' },
    order: { type: Number, required: true, index: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, default: null }
}, { timestamps: true });

function generatePreview(blocks) {
    if (!blocks || !Array.isArray(blocks)) return '';
    return blocks
        .filter(b => ['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'numbered', 'callout'].includes(b.type))
        .map(b => b.content)
        .filter(Boolean)
        .join(' ')
        .substring(0, 200);
}

async function runMigration() {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env.local');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully');

        const OldNote = mongoose.models.OldNote || mongoose.model('OldNote', OldNoteSchema, 'notes');
        const OldJournal = mongoose.models.OldJournal || mongoose.model('OldJournal', OldNoteSchema, 'journalentries');
        const Block = mongoose.models.Block || mongoose.model('Block', BlockSchema);

        const notes = await OldNote.find({ content: { $exists: true, $not: { $size: 0 } } });
        const journals = await OldJournal.find({ content: { $exists: true, $not: { $size: 0 } } });

        console.log(`Found ${notes.length} notes and ${journals.length} journal entries with content to migrate.`);

        if (notes.length === 0 && journals.length === 0) {
            console.log('No content to migrate');
            await mongoose.disconnect();
            return;
        }

        const blockOperations = [];
        const updateOperations = [];

        const processItems = (items, type, collectionName) => {
            for (const item of items) {
                let currentOrder = 100;
                const previewText = generatePreview(item.content);

                for (const blockData of item.content) {
                    blockOperations.push({
                        insertOne: {
                            document: {
                                entityId: item._id,
                                entityType: type,
                                type: blockData.type,
                                content: blockData.content,
                                order: currentOrder,
                                createdAt: item.createdAt || new Date(),
                                updatedAt: item.updatedAt || new Date()
                            }
                        }
                    });
                    currentOrder += 100;
                }
                updateOperations.push({
                    collection: collectionName,
                    filter: { _id: item._id },
                    update: { $set: { preview: previewText }, $unset: { content: "" } }
                });
            }
        };

        processItems(notes, 'Note', 'notes');
        processItems(journals, 'JournalEntry', 'journalentries');

        if (blockOperations.length > 0) {
            console.log(`Migrating ${blockOperations.length} blocks...`);
            await Block.bulkWrite(blockOperations);
        }

        if (updateOperations.length > 0) {
            console.log(`Updating ${updateOperations.length} parent documents with previews and removing content array...`);
            const db = mongoose.connection.db;
            for (const op of updateOperations) {
                await db.collection(op.collection).updateOne(op.filter, op.update);
            }
        }

        console.log('Migration completed successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Migration failed:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
}

runMigration();
