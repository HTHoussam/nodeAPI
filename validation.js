const { z } = require('zod');

const STATUS = ['IN PROGRESS', 'TODO', 'DONE', 'BLOCKED'];

const TaskSchema = z.object({
	name: z.string(),
	description: z.string(),
	duration: z.number().int(),
	id: z.string().optional(),
	// @ts-ignore
	status: z.enum(STATUS),
});
const OneTaskSchema = z.object({
	body: TaskSchema,
});
const TasksSchema = z.object({
	body: z.array(TaskSchema),
});
module.exports = { OneTaskSchema, TasksSchema };
