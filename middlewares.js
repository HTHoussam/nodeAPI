const bodyParser = require('body-parser');

// MIDDLEWARES //
const METHOD = 'GET' || 'POST' || 'PUT' || 'DELETE';

const errorHandlingMiddleWare = (err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something went wrong!');
	next();
};

const loggerMiddleWare = function (req, res, next) {
	console.log('request params', JSON.stringify(req.params));
	console.log('req.method', req.method);
	next();
};

const validate = (schema) => (req, res, next) => {
	try {
		const r = schema.parse({
			body: req.body,
			query: req.query,
			params: req.params,
		});
		console.log('mdeodmeo', r);
		next();
	} catch (err) {
		return res.status(400).send(err.errors);
	}
};

// //

let jsonParser = bodyParser.json();

let urlencodedParser = bodyParser.urlencoded({ extended: false });

module.exports = {
	validate,
	loggerMiddleWare,
	errorHandlingMiddleWare,
	jsonParser,
	urlencodedParser,
};
