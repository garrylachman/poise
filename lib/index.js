//require('mochiscript');

//const HTTP = require('./http/index');
const TCP  = require('./tcp/index');

//module.exports.http = function () { return new HTTP() };
module.exports.tcp  = function () { return new TCP() };
