var express = require('express'),
    http = require('http'),
    asciidoctor = require('asciidoctor.js')().Asciidoctor(true),
    load_gist = require("./helpers/load_gist.js");

module.exports = function (app, api_port) {
  app.use(express.logger());

  // var http_handler = express.static(__dirname + '/');

  app.set('view engine', 'jade')

  app.locals.load_cache = { };

  app.configure(function(){
    app.get('/', function (req, res) {
      api_url = (app.settings.env == 'development') ? ('http://localhost:'+ api_port) : ''

      res.render(__dirname + '/dist/index.html.jade', {api_port: api_port, api_url: api_url});
    });

    app.get('/templates/:template', function (req, res) {
      if (!req.params.template.match(/[a-z0-9\-_]/i)) throw 'Invalid template'

      res.render(__dirname + '/dist/assets/partials/'+ req.params.template +'.html.jade', {});
    });

    app.get('/gists/:id.:format?',function (req, res) {
        var id = req.params.id;
        load_gist.load_gist(id, app.locals.load_cache, function(err, data) {
            if (err) {
                console.log("Error loading graphgist", id, err);
                res.send(404,"Error loading graphgist from: "+ id +" "+ err)
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
                    res.set("Url","http://neo4j.org/graphgist"+ id);
                }

                if (req.params.format === 'html')
                  data = asciidoctor.$convert(load_gist.preProcessHTML(data))

                res.send(200,data);
            }
        });
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
