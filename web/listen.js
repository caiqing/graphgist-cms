var port = process.env.PORT || 5000;
var api_port = 3000;

var app = require('./app')(require('express')(), api_port);

app.listen(port, function() {
  console.log("Listening on " + port);
});
