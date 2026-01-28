import { z } from 'zod';

export const TickTickProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional(),
  sortOrder: z.number().optional(),
  kind: z.string().optional(),
  closed: z.boolean().optional(),
  groupId: z.string().optional(),
  viewMode: z.string().optional(),
  permission: z.string().optional(),
});

export const TickTickTaskSchema = z.object({
  id: z.string(),
  isAllDay: z.boolean().optional(),
  projectId: z.string(),
  title: z.string(),
  content: z.string().optional(),
  desc: z.string().optional(),
  timeZone: z.string().optional(),
  repeatFlag: z.string().optional(),
  startDate: z.union([z.string(), z.number()]).optional(),
  dueDate: z.union([z.string(), z.number()]).optional(),
  reminders: z.array(z.string()).optional(),
  priority: z.number().optional(),
  status: z.number(),
  completedTime: z.union([z.string(), z.number()]).optional(),
  sortOrder: z.number().optional(),
  items: z
    .array(
      z.object({
        id: z.string(),
        status: z.number(),
        title: z.string(),
        sortOrder: z.number().optional(),
        startDate: z.union([z.string(), z.number()]).optional(),
        isAllDay: z.boolean().optional(),
        timeZone: z.string().optional(),
        completedTime: z.union([z.string(), z.number()]).optional(),
      })
    )
    .optional(),
});

export const TickTickCheckListItemSchema = z.object({
  title: z.string().describe('Subtask item title'),
  startDate: z
    .union([z.string(), z.number()])
    .optional()
    .describe(`Subtask item start date in "yyyy-MM-dd'T'HH:mm:ssZ" format or Unix timestamp`),
  isAllDay: z.boolean().optional().describe('Is all day subtask item'),
  sortOrder: z.number().optional().describe('Subtask item sort order'),
  timeZone: z
    .string()
    .optional()
    .describe('Subtask item time zone. Example: "America/Los_Angeles"'),
  status: z
    .number()
    .optional()
    .describe('The completion status of subtask. Normal: 0, Completed: 1'),
  completedTime: z
    .union([z.string(), z.number()])
    .optional()
    .describe(`Subtask item completed time in "yyyy-MM-dd'T'HH:mm:ssZ" format`),
});
