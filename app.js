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

var isGood = {}

var checkStatus = function(zoneId, lightId, callback) {
  var pollingHost = '133.242.233.24';
  var pollingPort = 3000;
  var pollingPath = '/zones/' + zoneId;
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
      var parsed = null;
      try {
        console.log(body);
        parsed = JSON.parse(body);
      }
      catch (e) {
        console.log('parse error');
        return;
      }
      var diff = parsed.target_temperature - parsed.current_temperature;
      console.log(zoneId + ' : diff : ' + diff);

      if (diff < 1 && diff > -1) {
        if (!isGood[zoneId]) {
          changeColor(25500, lightId);
          console.log('change color to good');
        };
        isGood[zoneId] = true;
        console.log(zoneId + 'good');
      } else {
        if (isGood[zoneId]) {
          console.log(isGood[zoneId]);
          changeColor(12750, lightId);
          console.log('change color to bad');
        };
        console.log(zoneId + 'bad');
        isGood[zoneId] = false;
      }
      callback && callback();
    });
  })
}

var changeColor = function(color, lightId) {
  var host = '192.168.2.249';
  var port = 80;
  var path = '/api/JaWHEMGTOY9QryJr1sS1xCI1rI5wKimUUNOPJNNP/lights/' + lightId + '/state';
  // curl -X PUT -H 'Accept:application/json' -d @d.json http://192.168.2.249/api/JaWHEMGTOY9QryJr1sS1xCI1rI5wKimUUNOPJNNP/lights/1/state
  var json = JSON.stringify({ on: true, sat: 254, bri: 254, hue: color });
  var req = http.request({
    method: 'PUT',
    host: host,
    port: port,
    path: path,
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
      var parsed = null;
      try {
        console.log(body);
        parsed = JSON.parse(body);
      }
      catch (e) {
        console.log('parse error');
        return;
      }
    });
  })
  req.end(json);
}

setInterval(function() {
  console.log('setInterval');
  checkStatus(1, 1);
// }, 5000)
}, 1000)

// changeColor(46920)
// changeColor(12750, 1);
// changeColor(25500, 1);

module.exports = app;
