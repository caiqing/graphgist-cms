var port = process.env.PORT || 3000;

var app = require('./app')(require('express')(), port);

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

