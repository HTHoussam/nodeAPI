const { MongoClient } = require('mongodb');
const { default: mongoose } = require('mongoose');

// connect
const connectionURI =
	'mongodb+srv://ecomsite:ecomsite1234@cluster0.egli65r.mongodb.net/task_managment?retryWrites=true&w=majority';
async function connect() {
	const client = new MongoClient(connectionURI);

	try {
		// Connect to the MongoDB cluster
		await client.connect();
		console.log('Connected to the database');
		return client;
	} catch (e) {
		console.error(e);
	}
}
async function createCollection(collectionName) {
	const connectionURI =
		'mongodb+srv://ecomsite:ecomsite1234@cluster0.egli65r.mongodb.net/ecomsite-database?retryWrites=true&w=majority';

	const client = new MongoClient(connectionURI);
	client.db().createCollection(collectionName, {});
}
async function connectMongoose() {
	try {
		const connection = await mongoose.connect(connectionURI);
		return connection;
	} catch (error) {
		throw error;
	}
}
module.exports = { connect, createCollection, connectMongoose };
