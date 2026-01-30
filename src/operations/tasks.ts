import { z } from 'zod';
import { ticktickRequest } from '../common/utils.js';
import {
  TickTickCheckListItemSchema,
  TickTickTaskSchema,
} from '../common/types.js';

/**
 * Normalizes timestamp fields from numbers to ISO strings
 * TickTick API returns completedTime as Unix timestamp (number),
 * but we need ISO 8601 strings for consistent schema validation
 */
function normalizeTimestamps(data: any): any {
  if (!data) return data;

  const convertTimestamp = (value: any) => {
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    return value;
  };

  // Normalize task-level completedTime
  if (data.completedTime !== undefined) {
    data.completedTime = convertTimestamp(data.completedTime);
  }

  // Normalize completedTime in subtask items
  if (data.items && Array.isArray(data.items)) {
    data.items = data.items.map((item: any) => ({
      ...item,
      completedTime: item.completedTime !== undefined
        ? convertTimestamp(item.completedTime)
        : item.completedTime,
    }));
  }

  return data;
}

export const GetTaskByIdsOptionsSchema = z.object({
  projectId: z.string().describe('Project identifier'),
  taskId: z.string().describe('Task identifier'),
});

export const GetTaskByIdsResponseSchema = TickTickTaskSchema;

export const CreateTaskOptionsSchema = z.object({
  title: z.string().describe('Task title'),
  projectId: z.string().describe('Project id'),
  content: z.string().optional().describe('Task content'),
  desc: z.string().optional().describe('Task description'),
  isAllDay: z.boolean().optional().describe('Is all day task'),
  startDate: z
    .string()
    .optional()
    .describe(`Task start date in "yyyy-MM-dd'T'HH:mm:ssZ" format`),
  dueDate: z
    .string()
    .optional()
    .describe(`Task due date in "yyyy-MM-dd'T'HH:mm:ssZ" format`),
  timeZone: z
    .string()
    .optional()
    .describe('Task time zone. Example: "America/Los_Angeles"'),
  reminders: z
    .array(z.string())
    .optional()
    .describe(
      'List of reminder triggers in iCalendar (RFC 5545) format. Example: ["TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S"]'
    ),
  repeatFlag: z
    .string()
    .optional()
    .describe(
      'Task repeat flag in iCalendar (RFC 5545) format. Example: RRULE:FREQ=DAILY;INTERVAL=1'
    ),
  priority: z
    .number()
    .optional()
    .describe('Task priority None: 0, Low: 1, Medium: 3, High: 5'),
  sortOrder: z.string().optional().describe('Task sort order. Example: 12345'),
  items: z
    .array(TickTickCheckListItemSchema)
    .optional()
    .describe('The list of subtasks'),
});

export const UpdateTaskOptionsSchema = z.object({
  taskId: z.string().describe('Task identifier - Path'),
  id: z.string().describe('Task identifier - Body'),
  projectId: z.string().describe('Project id'),
  title: z.string().optional().describe('Task title'),
  content: z.string().optional().describe('Task content'),
  desc: z.string().optional().describe('Task description'),
  isAllDay: z.boolean().optional().describe('Is all day task'),
  startDate: z
    .string()
    .optional()
    .describe(`Task start date in "yyyy-MM-dd'T'HH:mm:ssZ" format`),
  dueDate: z
    .string()
    .optional()
    .describe(`Task due date in "yyyy-MM-dd'T'HH:mm:ssZ" format`),
  timeZone: z
    .string()
    .optional()
    .describe('Task time zone. Example: "America/Los_Angeles"'),
  reminders: z
    .array(z.string())
    .optional()
    .describe(
      'List of reminder triggers in iCalendar (RFC 5545) format. Example: ["TRIGGER:P0DT9H0M0S", "TRIGGER:PT0S"]'
    ),
  repeatFlag: z
    .string()
    .optional()
    .describe(
      'Task repeat flag in iCalendar (RFC 5545) format. Example: RRULE:FREQ=DAILY;INTERVAL=1'
    ),
  priority: z
    .number()
    .optional()
    .describe('Task priority None: 0, Low: 1, Medium: 3, High: 5'),
  sortOrder: z.string().optional().describe('Task sort order. Example: 12345'),
  items: z
    .array(TickTickCheckListItemSchema)
    .optional()
    .describe('The list of subtasks'),
});

export const TasksIdsOptionsSchema = z.object({
  taskId: z.string().describe('Task identifier'),
  projectId: z.string().describe('Project identifier'),
});

type GetTaskByIdsParams = z.infer<typeof GetTaskByIdsOptionsSchema>;

type CreateTaskParams = z.infer<typeof CreateTaskOptionsSchema>;

type UpdateTaskParams = z.infer<typeof UpdateTaskOptionsSchema>;

type TasksIdsParams = z.infer<typeof TasksIdsOptionsSchema>;

export async function getTaskByIds(
  params: GetTaskByIdsParams
): Promise<z.infer<typeof GetTaskByIdsResponseSchema>> {
  const { projectId, taskId } = GetTaskByIdsOptionsSchema.parse(params);

  const url = `https://api.ticktick.com/open/v1/project/${projectId}/task/${taskId}`;

  const response = await ticktickRequest(url);

  // Normalize timestamps before validation
  const normalizedResponse = normalizeTimestamps(response);

  return GetTaskByIdsResponseSchema.parse(normalizedResponse);
}

export async function createTask(
  params: CreateTaskParams
): Promise<z.infer<typeof TickTickTaskSchema>> {
  const url = `https://api.ticktick.com/open/v1/task`;

  const response = await ticktickRequest(url, {
    method: 'POST',
    body: {
      ...params,
    },
  });

  return TickTickTaskSchema.parse(response);
}

export async function updateTask(
  params: UpdateTaskParams
): Promise<z.infer<typeof TickTickTaskSchema>> {
  const { taskId, id, ...rest } = params;

  const url = `https://api.ticktick.com/open/v1/task/${taskId || id}`;

  const response = await ticktickRequest(url, {
    method: 'POST',
    body: {
      id: id || taskId,
      ...rest,
    },
  });

  return TickTickTaskSchema.parse(response);
}

export async function completeTask({
  taskId,
  projectId,
}: TasksIdsParams): Promise<void> {
  const url = `https://api.ticktick.com/open/v1/project/${projectId}/task/${taskId}/complete`;

  await ticktickRequest(url, {
    method: 'POST',
  });
}

export async function deleteTask({
  taskId,
  projectId,
}: TasksIdsParams): Promise<void> {
  const url = `https://api.ticktick.com/open/v1/project/${projectId}/task/${taskId}`;

  await ticktickRequest(url, {
    method: 'DELETE',
  });
}
