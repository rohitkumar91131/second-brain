import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────
export const RegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

// ─── Task ────────────────────────────────────────────────────────────────────
export const TaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    status: z.enum(['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold']).optional().default('Not Started'),
    priority: z.enum(['High', 'Medium', 'Low']).optional().default('Medium'),
    tags: z.array(z.string().max(50)).optional().default([]),
    dueDate: z.string().optional().default(''),
    completed: z.boolean().optional().default(false),
    projectId: z.string().nullable().optional().default(null),
    notes: z.string().max(5000).optional().default(''),
})

export const TaskUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500).optional(),
    status: z.enum(['Not Started', 'In Progress', 'Done', 'Blocked', 'On Hold']).optional(),
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    tags: z.array(z.string().max(50)).optional(),
    dueDate: z.string().optional(),
    completed: z.boolean().optional(),
    projectId: z.string().nullable().optional(),
    notes: z.string().max(5000).optional(),
    toggleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in yyyy-MM-dd format').optional(),
})

// ─── Project ─────────────────────────────────────────────────────────────────
export const ProjectSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    status: z.enum(['Not Started', 'In Progress', 'Active', 'Done', 'On Hold', 'Blocked']).optional().default('Active'),
    tags: z.array(z.string().max(50)).optional().default([]),
    dueDate: z.string().optional().default(''),
    progress: z.number().min(0).max(100).optional().default(0),
    areaId: z.string().nullable().optional().default(null),
    parentProjectId: z.string().nullable().optional().default(null),
    description: z.string().max(5000).optional().default(''),
})

export const ProjectUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500).optional(),
    status: z.enum(['Not Started', 'In Progress', 'Active', 'Done', 'On Hold', 'Blocked']).optional(),
    tags: z.array(z.string().max(50)).optional(),
    dueDate: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    areaId: z.string().nullable().optional(),
    parentProjectId: z.string().nullable().optional(),
    description: z.string().max(5000).optional(),
})

// ─── Goal ────────────────────────────────────────────────────────────────────
export const GoalSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    status: z.enum(['Not Started', 'Active', 'Done', 'On Hold', 'Blocked']).optional().default('Active'),
    tags: z.array(z.string().max(50)).optional().default([]),
    dueDate: z.string().optional().default(''),
    progress: z.number().min(0).max(100).optional().default(0),
    areaId: z.string().nullable().optional().default(null),
    metric: z.string().max(200).optional().default(''),
})

export const GoalUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500).optional(),
    status: z.enum(['Not Started', 'Active', 'Done', 'On Hold', 'Blocked']).optional(),
    tags: z.array(z.string().max(50)).optional(),
    dueDate: z.string().optional(),
    progress: z.number().min(0).max(100).optional(),
    areaId: z.string().nullable().optional(),
    metric: z.string().max(200).optional(),
})

// ─── Block (for Note/Journal content) ────────────────────────────────────────
// FIXED: Added 'link', 'todo', 'note_reference' to all block enums below
const BlockItemSchema = z.object({
    id: z.string(),
    type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'toggle', 'divider', 'callout', 'image', 'video', 'table', 'numbered', 'audio', 'link', 'todo', 'note_reference']),
    content: z.string().max(100000).optional().default(''),
    children: z.string().max(10000).optional().default(''),
})

export const BlockSchema = z.object({
    entityId: z.string(),
    entityType: z.enum(['Note', 'JournalEntry']),
    type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'toggle', 'divider', 'callout', 'image', 'video', 'table', 'numbered', 'audio', 'link', 'todo', 'note_reference']),
    content: z.string().max(100000).optional().default(''),
    order: z.number(),
    parentId: z.string().nullable().optional(),
})

export const BlockUpdateSchema = z.object({
    entityId: z.string().optional(),
    entityType: z.enum(['Note', 'JournalEntry']).optional(),
    type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'toggle', 'divider', 'callout', 'image', 'video', 'table', 'numbered', 'audio', 'link', 'todo', 'note_reference']).optional(),
    content: z.string().max(100000).optional(),
    order: z.number().optional(),
    parentId: z.string().nullable().optional(),
})

export const BlockBulkUpdateSchema = z.array(z.object({
    id: z.string(),
    type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'toggle', 'divider', 'callout', 'image', 'video', 'table', 'numbered', 'audio', 'link', 'todo', 'note_reference']).optional(),
    content: z.string().max(100000).optional(),
    order: z.number().optional(),
    parentId: z.string().nullable().optional(),
}))

// ─── Note ────────────────────────────────────────────────────────────────────
export const NoteSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    tags: z.array(z.string().max(50)).optional().default([]),
    areaId: z.string().nullable().optional().default(null),
    projectIds: z.array(z.string()).optional().default([]),
    preview: z.string().optional().default(''),
})

export const NoteUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500).optional(),
    tags: z.array(z.string().max(50)).optional(),
    areaId: z.string().nullable().optional(),
    projectIds: z.array(z.string()).optional(),
    preview: z.string().optional(),
    isArchived: z.boolean().optional(),
    deletedAt: z.string().nullable().optional(),
})

// ─── Journal Entry ────────────────────────────────────────────────────────────
export const JournalEntrySchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in yyyy-MM-dd format'),
    mood: z.enum(['Amazing', 'Good', 'Okay', 'Tough', 'Bad']).optional().default('Good'),
    preview: z.string().optional(),
})

export const JournalEntryUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in yyyy-MM-dd format').optional(),
    mood: z.enum(['Amazing', 'Good', 'Okay', 'Tough', 'Bad']).optional(),
    preview: z.string().optional(),
})

// ─── Resource ─────────────────────────────────────────────────────────────────
export const ResourceSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    type: z.enum(['Book', 'Article', 'Website', 'Video', 'Course', 'Podcast', 'Tool', 'Other']).optional().default('Other'),
    url: z.string().url('Must be a valid URL').optional().or(z.literal('')).default(''),
    tags: z.array(z.string().max(50)).optional().default([]),
    status: z.enum(['To Read', 'Reading', 'Completed', 'Active']).optional().default('To Read'),
    areaId: z.string().nullable().optional().default(null),
    notes: z.string().max(5000).optional().default(''),
})

export const ResourceUpdateSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500).optional(),
    type: z.enum(['Book', 'Article', 'Website', 'Video', 'Course', 'Podcast', 'Tool', 'Other']).optional(),
    url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    tags: z.array(z.string().max(50)).optional(),
    status: z.enum(['To Read', 'Reading', 'Completed', 'Active']).optional(),
    areaId: z.string().nullable().optional(),
    notes: z.string().max(5000).optional(),
})

// ─── User Profile ─────────────────────────────────────────────────────────────
export const ProfileUpdateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    image: z.string().url().optional().or(z.literal('')),
    viewPreferences: z.record(z.string()).optional(),
})

// ─── Helper: parse and return errors ─────────────────────────────────────────
export function validateBody(schema, data) {
    if (!schema || typeof schema.safeParse !== 'function') {
        return {
            success: false,
            errors: [{ field: 'schema', message: 'Internal validation error' }]
        }
    }

    const result = schema.safeParse(data || {})

    if (!result.success) {
        const zodIssues = result.error?.issues || result.error?.errors || []

        const errors = zodIssues.map(issue => ({
            field: Array.isArray(issue.path) ? issue.path.join('.') : 'unknown',
            message: issue.message || 'Invalid value'
        }))

        return { success: false, errors }
    }

    return { success: true, data: result.data }
}