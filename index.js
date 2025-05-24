#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cmd = require('node-cmd');
const connect = require('connect');
const cors = require('cors');
const dirlist = require('dirlist');
const yargs = require('yargs');
const serveStatic = require('serve-static');

const argv = yargs
	.option('port', {
		alias: 'p',
		description: 'Port to run the server on',
		type: 'number'
	})
	.option('python', {
		alias: 't',
		description: '[this function is currently not working] use python3, not nodejs',
		type: 'boolean'
	})
	.help()
	.alias('help', 'h')
	.argv;

const host = '0.0.0.0';
const port = parseInt(argv.port, 10) || 48489;
const base = '.';


function decodeUrlMiddleware(req, res, next) {
	req.url = decodeURIComponent(req.url);
	next();
}


function faviconMiddleware(faviconBuffer) {
	return function (req, res, next) {
		if (req.url === '/favicon.ico') {
			res.writeHead(200, { 'Content-Type': 'image/x-icon' });
			res.end(faviconBuffer);
		} else {
			next();
		}
	};
}


function dirlistErrorHandler(base) {
	const dirlistMiddleware = dirlist(base);
	return function (req, res, next) {
		// Check if path exists and is a directory before using dirlist
		const requestPath = path.join(base, req.url.substring(1));
		
		try {
			const stats = fs.statSync(requestPath);
			if (stats.isDirectory()) {
				dirlistMiddleware(req, res, function (err) {
					if (err) {
						next(err);
					}
				});
			} else {
				next();
			}
		} catch (error) {
			// If path doesn't exist, continue to next middleware
			next();
		}
	};
}



let staticErrorHandler;

staticErrorHandler = function (base) {
	const staticMiddleware = serveStatic(base, { fallthrough: false });
	return function (req, res, next) {
		staticMiddleware(req, res, function (err) {
			if (err) {
				// If file doesn't exist, let the request go to the next middleware
				if (err.statusCode === 404) {
					return next();
				}
				// Handle other errors
				res.statusCode = err.statusCode || 500;
				res.end(err.message);
			}
		});
	};
};


if (argv.python) {
	console.log("using python -m http.server on " + String(port));
	const syncClone = cmd.runSync(`python3 -m http.server ${port}`);
	console.log(syncClone);
} else {
	const faviconBase64 = 'data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAA...'; // truncated for brevity
	const faviconBuffer = Buffer.from(faviconBase64.split(',')[1], 'base64');

	const app = connect();
	app.use(cors());
	app.use(faviconMiddleware(faviconBuffer));
	app.use(decodeUrlMiddleware);
	app.use(staticErrorHandler(base));
	app.use(dirlistErrorHandler(base));
	
	// Final 404 handler if nothing matched
	app.use(function(req, res) {
		res.statusCode = 404;
		res.end('Not found');
	});

	app.listen(port, host);
	console.log('Server running at http://' + host + ':' + port + '/');
}
