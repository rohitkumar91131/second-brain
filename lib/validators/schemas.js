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

export const TaskUpdateSchema = TaskSchema.partial()

// ─── Project ─────────────────────────────────────────────────────────────────
export const ProjectSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    status: z.enum(['Not Started', 'In Progress', 'Active', 'Done', 'On Hold', 'Blocked']).optional().default('Active'),
    tags: z.array(z.string().max(50)).optional().default([]),
    dueDate: z.string().optional().default(''),
    progress: z.number().min(0).max(100).optional().default(0),
    areaId: z.string().nullable().optional().default(null),
    description: z.string().max(5000).optional().default(''),
})

export const ProjectUpdateSchema = ProjectSchema.partial()

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

export const GoalUpdateSchema = GoalSchema.partial()

// ─── Block (for Note/Journal content) ────────────────────────────────────────
const BlockSchema = z.object({
    id: z.string(),
    type: z.enum(['paragraph', 'heading1', 'heading2', 'heading3', 'bullet', 'toggle', 'divider', 'callout']),
    content: z.string().max(10000).optional().default(''),
    children: z.string().max(10000).optional().default(''),
})

// ─── Note ────────────────────────────────────────────────────────────────────
export const NoteSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    tags: z.array(z.string().max(50)).optional().default([]),
    areaId: z.string().nullable().optional().default(null),
    content: z.array(BlockSchema).optional().default([]),
})

export const NoteUpdateSchema = NoteSchema.partial()

// ─── Journal Entry ────────────────────────────────────────────────────────────
export const JournalEntrySchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in yyyy-MM-dd format'),
    mood: z.enum(['Amazing', 'Good', 'Okay', 'Tough', 'Bad']).optional().default('Good'),
    content: z.array(BlockSchema).optional().default([]),
})

export const JournalEntryUpdateSchema = JournalEntrySchema.partial()

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

export const ResourceUpdateSchema = ResourceSchema.partial()

// ─── User Profile ─────────────────────────────────────────────────────────────
export const ProfileUpdateSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    image: z.string().url().optional().or(z.literal('')),
    viewPreferences: z.record(z.string()).optional(),
})

// ─── Helper: parse and return errors ─────────────────────────────────────────
export function validateBody(schema, data) {
    const result = schema.safeParse(data)
    if (!result.success) {
        const errors = result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
        }))
        return { success: false, errors }
    }
    return { success: true, data: result.data }
}
