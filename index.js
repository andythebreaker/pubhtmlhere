#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cmd = require('node-cmd');
const connect = require('connect');
const cors = require('cors');
const dirlist = require('connect-dirlist');
const favicon = require('serve-favicon');
const yargs = require('yargs');

const argv = yargs
    .option('port', {
        alias: 'p',
        description: 'Port to run the server on',
        type: 'number'
    })
    .option('python', {
        alias: 't',
        description: 'use python3, not nodejs',
        type: 'boolean'
    })
    .help()
    .alias('help', 'h')
    .argv;

const host = '127.0.0.1';
let port = 8080;
const base = __dirname;

// Middleware to decode URL paths
function decodeUrlMiddleware(req, res, next) {
    req.url = decodeURIComponent(req.url);
    next();
}

if (argv._.includes('up')) {
    port = parseInt(argv.port, 10) || port;
    if (argv.python) {
        console.log("using python -m http.server on " + String(port));
        const syncClone = cmd.runSync('python3 -m http.server ' + String(port));
        console.log(syncClone);
    } else {
        connect(cors(), favicon(), decodeUrlMiddleware, dirlist(base), connect.static(base)).listen(port, host);
        console.log('Server running at http://' + host + ':' + port + '/');
    }
} else {
    connect(cors(), favicon(), decodeUrlMiddleware, dirlist(base), connect.static(base)).listen(port, host);
    console.log('Server running at http://' + host + ':' + port + '/');
}
