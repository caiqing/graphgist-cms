console.log(11);
//var jsdom = require('jsdom');
var neo4j = require('neo4j');

var NEO4J_URL=process.env.NEO4J_URL || 'http://localhost:7474/';
var db = new neo4j.GraphDatabase(NEO4J_URL);

var phantom = require('node-phantom');

console.log('creating phantom');
phantom.create(function (err,ph) {
  console.log('creating page');
  ph.createPage(function (err,page) {
    console.log('querying');

    db.query('MATCH (gist:Gist) WHERE gist.poster_image IS NULL RETURN ID(gist) AS id, gist.tagline AS tagline LIMIT 3', {}, function (err, results) {

      for (var i = 0; i < results.length; i++) {
        var result = results[i]

        var url = result.tagline;

        console.log(url + ': opening...');
        page.onResourceError = function(resourceError) {
            page.reason = resourceError.errorString;
            page.reason_url = resourceError.url;
        };
        page.open(url, function (err, status) {
          console.log(url + ': page open / err: '+ err +' / status: ' + status);
          if (status !== 'success') {
            console.log(
              "Error opening url \"" + page.reason_url
              + "\": " + page.reason
            );
            ph.exit( 1 );
          } else {
//          page.onConsoleMessage(function (message) { console.log("CONSOLE: " + message) });

            page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js", function(err) {
              console.log('javascript load / err: ' + err);

              page.evaluate(function() {
                return($($("div#content img")[0]).attr('src'));
              }, function (image_url) {
                console.log({onImageUrl: image_url});

                if (image_url) {
                  db.query('MATCH (gist:Gist) WHERE ID(gist) = {gist_id} SET gist.poster_image = {image_url}',
                    {
                      gist_id: result.id, 
                      image_url: image_url
                    },
                    function (err, results) {
                      console.log(result.tagline + ': neo4j response: err: ' + err + ' / results: ' + results);

                      ph.exit();
  //                    ph._phantom.kill('SIGTERM');
                    }
                  );
                }

              });
            });
          }
        });


    //    jsdom.env(
    //      result.tagline,
    //      ["http://code.jquery.com/jquery.js"],
    //      function (errors, window) {
    //        setTimeout(function() {
    //
    //          var images = window.$("div#content img");
    //          console.log(result.tagline + ': ' + images.length + ' images');
    //          var image_url = window.$(images[0]).attr('src');
    //
    //          console.log(result.tagline + ': setting URL: ' + image_url);
    //          console.log({test: {
    //              gist_id: result.id, 
    //              image_url: image_url
    //            }});
    //          db.query('MATCH (gist:Gist) WHERE ID(gist) = {gist_id} SET gist.poster_image = {image_url}',
    //            {
    //              gist_id: result.id, 
    //              image_url: image_url
    //            },
    //            function (err, results) {
    //              console.log(result.tagline + ': err: ' + err + ' / results: ' + results);
    //            }
    //          );
    //        }, 10000);
    //
    //
    //      }
    //    );
      }

    });
  });
}, {parameters:{'ignore-ssl-errors':'yes'}});


