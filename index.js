#!/usr/bin/env node
var connect = require('connect');
var dirlist = require('dirlist');
const yargs = require('yargs');
var cors = require('cors');
var cmd=require('node-cmd');
var base = '.';
var host ='0.0.0.0';
var port = 48489;
const argv = yargs
	.command('up', 'Expose the current directory to a specific port. This is recursive. It will generate a static file server, and generate directory HTML at the "index.html" entry.', {
		port: {
			description: 'the port to listen on',
			alias: 'p',
			type: 'number'
		},
		python:{
			alias: 't',
			description: 'use python3, not noedjs',
			type: 'boolean'
		}
	})
//.option('time', {
//  alias: 't',
//  description: 'Tell the present Time',
//  type: 'boolean'
//})
	.help()
	.alias('help', 'h').argv;

//if (argv.time) {
//  console.log('The current time is: ', new Date().toLocaleTimeString());
//}

if (argv._.includes('up')) {
	port=parseInt(argv.port,10)||port;		
	if(argv.python){
		console.log("using python -m http.server on "+String(port));
		const syncClone=cmd.runSync('python3 -m http.server '+String(port));
		console.log(syncClone);
	}else{
		//const year = argv.year || new Date().getFullYear();
		//if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
		//  console.log(`${year} is a Leap Year`);
		//} else {
		//  console.log(`${year} is NOT a Leap Year`);
		//}
		port=parseInt(argv.port,10)||port;
		connect(cors(),connect.favicon(),dirlist(base),connect.static(base)).listen(port, host);
		console.log('Server running at http://' + host + ':' + port + '/');

	}	
}else{
	connect(cors(),connect.favicon(),dirlist(base),connect.static(base)).listen(port, host);
	console.log('Server running at http://' + host + ':' + port + '/');
}

