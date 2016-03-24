var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = exphbs.create({defaultLayout: 'main'});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var index = require('./routes/index');
app.get('/', index.home);
app.get('/start', index.GETstart);
app.get('/step', index.GETstep);
app.post('/nextstep', index.POSTnextstep);
app.get('/solve', index.GETsolve);
app.get('/check', index.GETcheck);

app.listen(3000);