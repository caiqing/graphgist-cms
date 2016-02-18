var express = require('express'),
    http = require('http'),
    asciidoctor = require('asciidoctor.js')(),
    opal = asciidoctor.Opal,
    asciidoctor_processor = asciidoctor.Asciidoctor(true),
    load_gist = require("./helpers/load_gist.js"),
    Gists = require('../api/models/gists'),
    compression = require('compression'),
    rollbar = require('rollbar');
    util = require('util');

module.exports = function (app, api_port) {
  app.use(compression());
  app.use(express.logger());
  app.use(rollbar.errorHandler(process.env.ROLLBAR_SERVER_TOKEN));

  // var http_handler = express.static(__dirname + '/');

  app.set('view engine', 'jade')

  app.locals.load_cache = { };

  app.get('/*',function(req,res,next){
    res.header('X-Robots-Tag' , 'noindex, noarchive' );
    next(); // http://expressjs.com/guide.html#passing-route control
  });

  app.all(/.*/, function(req, res, next) {
    if (process.env.REDIRECT_TO_PRODUCTION == 'true') {
      var host = req.header('host');
      if (host !== 'graphgist.neo4j.com') {
        res.redirect(301, 'http://graphgist.neo4j.com' + req.path);
      } else {
        next();
      }
    } else {
      next()
    }

  });


  app.configure(function(){
    app.get('/', function (req, res) {
      api_url = (app.settings.env == 'development') ? ('http://localhost:'+ api_port) : ''

      var gist;

      var render = function (err, data) {
        if (err) {
          console.log("Error loading graphgist", err);
          res.send(404,"Error loading graphgist: "+ err)
        } else {
          res.render(__dirname + '/dist/index.html.jade', {api_port: api_port,
                                                           api_url: api_url,
                                                           gist: data,
                                                           environment: process.env.NODE_ENV,
                                                           rollbar_token: process.env.ROLLBAR_CLIENT_TOKEN,
                                                           git_head_sha: process.env.GIT_HEAD_SHA});
        }
      }

      if (typeof(req.query._escaped_fragment_) === 'string' &&
          (match = req.query._escaped_fragment_.toString().match(/^\/gists\/([^\/]+)/))) {

          if (match[1] == 'all') {
            res.redirect(301, 'http://neo4j.com/graphgists/');
          } else if (match[1] == 'about') {
            res.render(__dirname + '/dist/about-escaped-fragment.html.jade');
          } else {
            var gist;
            var id = match[1];
            var cache = req.query.skip_cache ? {} : app.locals.load_cache;

            load_gist.get_gist(id, function(data) {
              gist = data;

              res.redirect(301, 'http://neo4j.com/graphgist/'+ gist.graphgist_id);
              return;

              load_gist.load_gist(id, cache, {}, function(err, data, from_db) {
                if (err) {
                    console.log("Error loading graphgist", id, err);
                    res.send(404,"Error loading graphgist from: "+ id +" "+ err)
                } else {
                    console.log("finding gist with id: " + id);
                    var item = load_gist.findGist(app.locals, id);
                    res.set('Content-Type', 'text/html');

                    var options = opal.hash2([], {})
                    if (!from_db) {
                      var options = opal.hash2(
                          ['attributes'],
                          {attributes: ['showtitle', 'env-graphgist']});
                    }

                    if (gist === null) gist = {}

                    gist.html = asciidoctor_processor.$convert(load_gist.preProcessHTML(data), options)
                    res.render(__dirname + '/dist/gist-escaped-fragment.html.jade', {gist: gist});
                }
              });
            });
          }
      } else {
        render(null, {});
      }

    });

    app.get('/error', function (req, res) {
      throw 'unhandled!'
    });

    short_urls = {
      '/submit': '/#!/gists/submit',
      '/about': '/#!/gists/about',
      '/challenge': '/#!/gists/challenge'
    }

    app_redirect = function(app, source, target) {
      app.get(source, function (req, res) {
        res.redirect(301, target);
      });
    }

    for ( var source in short_urls ) {
      var target = short_urls[source];
      app_redirect(app, source, short_urls[source]);
    }

    app.get('/templates/:template', function (req, res) {
      if (!req.params.template.match(/[a-z0-9\-_]/i)) throw 'Invalid template'

      res.render(__dirname + '/dist/assets/partials/'+ req.params.template +'.html.jade', {});
    });

    app.get('/gists/:id.:format?',function (req, res) {
        var id = req.params.id;

        if ( req.params.format !== 'html' ) {
          id = id + '.' + req.params.format;
          req.params.format = null;
        }

        var cache = req.query.skip_cache ? {} : app.locals.load_cache;

        var http_headers = {};
        if (req.headers['authorization']) http_headers['Authorization'] = req.headers['authorization']
        load_gist.load_gist(id, cache, {http_headers: http_headers}, function(err, data, from_db) {
            if (err) {
                if (err.statusCode === 401) {
                  res.statusCode = 401;
                  res.setHeader('WWW-Authenticate', 'Basic realm="GraphGist Portal"');
                  res.send('');
                } else {
                  console.log("Error loading graphgist", id, err);
                  res.send(404,"Error loading graphgist from: "+ id +" "+ err)
                }
            } else {
                var item = load_gist.findGist(app.locals, id);

                res.set('Content-Type', 'text/plain');
                if (item) {
                    function setHeader(key,prop) {
                        if (item[prop]) res.set("GraphGist-" + key,item[prop]);
                    }
                    setHeader("Title","title");
                    setHeader("Author","name");
                    setHeader("Twitter","twitter");
                    setHeader("Description","introText");
                    setHeader("Image","img");
                    setHeader("Category","Category");
                    res.set("Url","http://graphgist.neo4j.com/#!/gists/"+ id);
                }

                if (req.params.format === 'html') {
                  var options = opal.hash2([], {})
                  if (!from_db) {
                    var options = opal.hash2(
                        ['attributes'],
                        {attributes: ['showtitle', 'env-graphgist']});
                  }
                                    
                  data = asciidoctor_processor.$convert(load_gist.preProcessHTML(data), options)
                }

                res.send(200,data);
            }
        });
    });

    var expiry = require('static-expiry');
    var path = require('path');
    app.use(expiry(app, { dir: path.join(__dirname, '/dist/assets') }));
    app.use(express.static(__dirname + '/dist/assets'));

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
