var express = require('express');

module.exports = function (app, api_port) {
  app.use(express.logger());

  // var http_handler = express.static(__dirname + '/');

  app.set('view engine', 'jade')

  app.configure(function(){
    app.get('/', function (req, res) {
      api_url = (app.settings.env == 'development') ? ('http://localhost:'+ api_port) : ''

      res.render(__dirname + '/dist/index.html.jade', {api_port: api_port, api_url: api_url});
    });
    app.get('/index.html', function (req, res) {
      res.render(__dirname + '/dist/index.html.jade', {api_port: api_port});
    });
    app.use('/dist/assets', express.static(__dirname + '/dist/assets'));
    app.use(express.static(__dirname + '/dist'));
  });

  // app.get('/', function(req, res, next) {
  //   // if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
  //   //   res.writeHead(302, { 'Location' : req.url + '/' });
  //   //   res.end();
  //   //   return;
  //   // }
  //   // take off leading /docs so that connect locates file correctly
  //   // req.url = req.url.substr('/docs'.length);
  //   return http_handler(req, res, next);
  // });

  // // redirect to /docs
  // app.get('/', function(req, res) {
  //   res.redirect('./docs');
  // });


  return(app);
}
