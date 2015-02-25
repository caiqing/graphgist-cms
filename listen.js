var rollbar = require('rollbar');

if (process.env.ROLLBAR_SERVER_TOKEN) {
  rollbar.init(process.env.ROLLBAR_SERVER_TOKEN, {
    environment: process.env.NODE_ENV
  })

  rollbar.handleUncaughtExceptions(process.env.ROLLBAR_SERVER_TOKEN, {
    exitOnUncaughtException: true
  });
}

var app = require('express')();

var port = process.env.PORT || 5000;
var api_port = port;

web_app = require('./web/app')(app, api_port)
api_app = require('./api/app')(app, api_port)

app.listen(port, function() {
  console.log("Listening on " + port);
});

