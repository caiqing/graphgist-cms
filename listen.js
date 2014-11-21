var app = require('express')();

var port = process.env.PORT || 5000;
var API_PORT = port;

web_app = require('./web/app')(app)
api_app = require('./api/app')(app, API_PORT)

app.listen(port, function() {
  console.log("Listening on " + port);
});

