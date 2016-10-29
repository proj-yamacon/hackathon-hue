var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

var pollingHost = '133.242.233.24'
var pollingPort = 3000;
var pollingPath = '/zones/1'
var checkStatus = function(callback) {
  return http.get({
    host: pollingHost,
    port: pollingPort,
    path: pollingPath,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      var parsed = JSON.parse(body);
      console.log(parsed)
      var diff = parsed.target_temperature - parsed.current_temperature;

      if (diff < 1 && diff > -1) {
        console.log('good')
      } else if (diff > 1) {
        console.log('too cool')
      } else if (diff < -1) {
        console.log('too hot')
      }
      callback && callback();
    });
  })
}

setInterval(function() {
  console.log('setInterval');
  checkStatus();
// }, 5000)
}, 1000)

module.exports = app;
