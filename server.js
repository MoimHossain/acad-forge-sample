

var url = require('url')
var fs = require('fs');
var express = require('express');
var net = require('net');
var http = require('http');
var https = require('https');
var bp = require('body-parser');
var escape = require('escape-html');
var cors = require('cors');
var authService = require('./services/authService');
var blobService = require('./services/blobService');
var forgeService = require('./services/forgeService');
var app = express();
var router = express.Router();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

process.env.SERVICE_ROOT = (process.env.SERVICE_ROOT || '/bim/');

process.env.SERVER_PORT = (process.env.SERVER_PORT || 8005);
process.env.STACC_NAME = process.env.STACC_NAME || '';
process.env.STACC_KEY = process.env.STACC_KEY || '';


var whitelist = ['http://example1.com', 'http://example2.com']
var corsOptions = {
    origin: function (origin, callback) {
        //if (whitelist.indexOf(origin) !== -1) {
        if (true) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
router.all('*', cors(corsOptions));
app.use(process.env.SERVICE_ROOT + 'pages/', express.static('statics'));
app.use(process.env.SERVICE_ROOT + 'api/', router);

blobService.configureRoutes(app, router);
authService.configureRoutes(app, router);
forgeService.configureRoutes(app, router);

var defaultErrorHandlerFunc = function(err) { console.error(err); }
app.get(process.env.SERVICE_ROOT, function (req, res) {    
    res.send("Hello from container running.");
});
var server = app.listen(process.env.SERVER_PORT, function () {
    console.log('Service is listening at port ' + process.env.SERVER_PORT + '!');
});
