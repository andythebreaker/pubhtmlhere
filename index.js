#!/usr/bin/env node
var connect = require('connect');var dirlist = require('dirlist');var cors = require('cors');var base = '.';var host ='0.0.0.0';var port = 48489;connect(cors(),connect.favicon(),dirlist(base),connect.static(base)).listen(port, host);console.log('Server running at http://' + host + ':' + port + '/');
