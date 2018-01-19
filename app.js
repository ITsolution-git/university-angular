
var express         = require('express');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
var expressSession  = require('express-session');

var app             = express();
var server          = require('http').Server(app);

app.use(cookieParser());
app.use(expressSession({
    'secret': "SECRET",
    'cookie': {
        'maxAge': 3600*1000*24
    }}));
// app.use(expressSession({'secret': config.SECRET}));
app.use(bodyParser.json({}));
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use('/', express.static(__dirname + '/'));

server.listen(8080);