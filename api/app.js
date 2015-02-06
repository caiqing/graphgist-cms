/**
 * Module dependencies.
 */
var express     = require('express')
  , url         = require("url")
  , swagger     = require("swagger-node-express")
  , routes      = require('./routes')
  , API_STRING  = '/api/v0'
  //'http://gistapi-neo4j.herokuapp.com' 
  , subpath     = express()
  , compression = require('compression');


module.exports = function (app, port) {
  app.use(compression());
  app.use(API_STRING, subpath);

  // configure /api/v0 subpath for api versioning
  subpath.configure(function () {
    // for using json for the api
    subpath.use(express.json());
    subpath.use(express.methodOverride());
    // For getting POST bodies
    subpath.use(express.bodyParser());
  });

  app.configure(function () {
    // all environments
    app.use(express.favicon());
    app.use(express.logger('dev'));
    // just using json for the api
    app.use(express.json());
    app.use(express.methodOverride());
    app.use(app.router);
    app.set('port', port);
    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }
  });


  // Set the main handler in swagger to the express subpath
  swagger.setAppHandler(subpath);

  swagger.configureSwaggerPaths("", "/api-docs", "");

  // This is a sample validator.  It simply says that for _all_ POST, DELETE, PUT
  // methods, the header `api_key` OR query param `api_key` must be equal
  // to the string literal `special-key`.  All other HTTP ops are A-OK
  swagger.addValidator(
    function validate(req, path, httpMethod) {
      //  example, only allow POST for api_key="special-key"
      if ("POST" == httpMethod || "DELETE" == httpMethod || "PUT" == httpMethod) {
        var apiKey = req.headers["api_key"];
        if (!apiKey) {
          apiKey = url.parse(req.url,true).query["api_key"]; }
        if ("special-key" == apiKey) {
          return true;
        }
        return false;
      }
      return true;
    }
  );


  var models = require("./models/swagger_models");

  // Add models and methods to swagger
  swagger.addModels(models)
  .addGet(routes.domains.list)
  .addGet(routes.gists.list)
  .addGet(routes.gists.gistCount)
  .addGet(routes.gists.findById)
  .addGet(routes.gists.findByTitle)
  .addGet(routes.gists.findGistsByDateRange)
  .addGet(routes.gists.findGistsByActor)
  .addGet(routes.gists.findByGenre)
  .addPost(routes.gists.createGist)
  .addPut(routes.gists.updateGist)
  .addGet(routes.domains.findPersonByAuthoredGist)
  .addGet(routes.domains.findByName);


  // Configures the app's base path and api version.
  var BASE_URL = process.env.BASE_URL || process.env.BASE_CALLBACK_URL || "http://localhost:"+ port

  console.log(BASE_URL+API_STRING);
  swagger.configure(BASE_URL+API_STRING, "0.0.10");


  // Routes

  // Serve up swagger ui at /docs via static route
  var docs_handler = express.static(__dirname + '/node_modules/neo4j-swagger-ui/dist/');
  app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
    if (req.url === '/docs') { 
      // express static barfs on root url w/o trailing slash
      res.writeHead(302, { 'Location' : req.url + '/' });
      res.end();
      return;
    }
    // take off leading /docs so that connect locates file correctly
    req.url = req.url.substr('/docs'.length);
    return docs_handler(req, res, next);
  });

  // redirect to /docs
  app.get('/', function(req, res) {
    res.redirect('./docs');
  });

  return(app);
}
