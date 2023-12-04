const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const { connect, connectMongoose } = require('./connect');
var compose = require('compose-middleware').compose;
const { OneTaskSchema, TasksSchema } = require('./validation');
const User = require('./model/user');
var jwt = require('jsonwebtoken');

const {
	errorHandlingMiddleWare,
	loggerMiddleWare,
	jsonParser,
	validate,
} = require('./middlewares');
const { createCollection } = require('./model/user');

const app = express();
const port = 3000;

app.use(compose([errorHandlingMiddleWare, loggerMiddleWare, cookieParser()]));

app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

app.get('/tasks', async (req, res) => {
	const client = await connect();
	try {
		const database = client.db('task_managment');
		const tasks = await database.collection('tasks').find({}).toArray();
		// console.log('tasks', tasks);
		return res.json(tasks);
	} catch (error) {
		console.log('error', error);
		throw error;
	} finally {
		await client.close();
	}
});

// GetById
app.get('/task/:id', async (req, res) => {
	const client = await connect();
	const paramId = req.params['id'];
	console.log("req.params['id']", paramId);
	try {
		const database = client.db('task_managment');
		const task = await database.collection('tasks').findOne({
			_id: {
				equals: paramId,
			},
		});
		return res.json(task);
	} catch (error) {
		console.log('error', error);
		throw error;
	} finally {
		await client.close();
	}
});
// POST
app.post('/task', [jsonParser, validate(OneTaskSchema)], async (req, res) => {
	const client = await connect();
	const inputTask = await req.body;
	try {
		const database = client.db('task_managment');
		const r = await database.collection('tasks').insertOne({
			...inputTask,
		});
		if (r.insertedId.id.length > 0)
			return res.status(200).json({ message: 'done' });
	} catch (error) {
		console.log('ERrro', error);
		throw error;
	} finally {
		await client.close();
	}
});
app.post('/tasks', [jsonParser, validate(TasksSchema)], async (req, res) => {
	const client = await connect();
	const inputTasks = await req.body;
	try {
		const database = client.db('task_managment');
		const r = await database.collection('tasks').insertMany(inputTasks);
		if (r.insertedCount)
			return res.status(200).json({ message: 'done', count: r.insertedCount });
	} catch (error) {
		throw error;
	} finally {
		await client.close();
	}
});
// Search endpoint
app.post(
	'/search/tasks',
	[jsonParser, validate(OneTaskSchema)],
	async (req, res) => {
		const client = await connect();
		const { id, name, status, duration } = await req.body;
		try {
			const database = client.db('task_managment');
			const tasks = await database
				.collection('tasks')
				.find({
					$and: [
						id ? { _id: id } : {},
						duration ? { duration: duration } : {},
						status ? { status: status } : {},
						name ? { name: { $regex: new RegExp(name, 'i') } } : {},
					],
				})
				.toArray();
			return res.status(200).json({ data: tasks });
		} catch (error) {
			throw error;
		} finally {
			await client.close();
		}
	}
);
app.post('/register/user', [jsonParser], async (req, res) => {
	// const client = await connect();
	const { first_name, last_name, email, password } = req.body;

	if (!(email && password && first_name && last_name)) {
		res.status(400).send('All input is required');
	}
	const encryptedPassword = await bcrypt.hash(password, 10);
	debugger;
	try {
		const connection = await connectMongoose();
		const user = await User.create({
			first_name,
			last_name,
			email: email.toLowerCase(), // sanitize: convert email to lowercase
			password: encryptedPassword,
		});

		const token = jwt.sign(
			{ user_id: user._id, email },
			'e5d935271d92d30ec9526fd0d47a1daa171e5b5793faa4a3f6808e58b25f90df6e5a0163d7b756e193fd1f0abbc41cd9a7d63d40ebb146027df4990a00cac70037b42ed0f5c455c7a44272e5f8240536d3d476798e4c900b1cce245b3286d08be71f9945f5193f5de07e49f22b7323cb',
			{
				expiresIn: '24h',
			}
		);

		user.token = token;

		return res.status(200).json({ id: user.id });
	} catch (error) {
		throw error;
	}
});
