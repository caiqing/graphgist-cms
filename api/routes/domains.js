// domains.js

var Domains = require('../models/domains');
var sw = require("swagger-node-express");
var param = sw.params;
var url = require("url");
var swe = sw.errors;
var _ = require('underscore');

/*
 *  Util Functions
 */

function writeResponse (res, response, start) {
  sw.setHeaders(res);
  res.header('Duration-ms', new Date() - start);
  if (response.neo4j) {
    res.header('Neo4j', JSON.stringify(response.neo4j));
  }
  res.send(JSON.stringify(response.results));
}

function parseUrl(req, key) {
  return url.parse(req.url,true).query[key];
}

function parseBool (req, key) {
  return 'true' == url.parse(req.url,true).query[key];
}


/*
 * API Specs and Functions
 */

exports.list = {
  'spec': {
    "description" : "List all domains",
    "path" : "/domains",
    "notes" : "Returns all domains",
    "summary" : "Find all domains",
    "method": "GET",
    "params" : [
      // param.query("friends", "Include friends", "boolean", false, false, "LIST[true, false]", "true")
    ],
    "responseClass" : "List[Domain]",
    "errorResponses" : [swe.notFound('domains')],
    "nickname" : "getDomains"
  },
  'action': function (req, res) {
    // var friends = parseBool(req, 'friends');
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    // if (friends) {
    //   Domains.getAllWithFriends(null, options, function (err, response) {
    //     if (err || !response.results) throw swe.notFound('domains');
    //     writeResponse(res, response, start);
    //   });
    // } else {
      Domains.getAll(null, options, function (err, response) {
        if (err || !response.results) throw swe.notFound('domains');
        writeResponse(res, response, start);
      });
    // }
  }
};

exports.findPersonByAuthoredGist = {
  'spec': {
    "description" : "Find a author",
    "path" : "/domains/author/gist/{title}",
    "notes" : "Returns a person who directed a gist",
    "summary" : "Find person who directed a gist by title",
    "method": "GET",
    "params" : [
      param.path("title", "Title of the gist that the person directed", "string")
    ],
    "responseClass" : "Domain",
    "errorResponses" : [swe.invalid('title'), swe.notFound('person')],
    "nickname" : "getPersonByAuthoredGist"
  },
  'action': function (req,res) {
    var title = req.params.title;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!title) throw swe.invalid('title');

    var params = {
      title: title
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('person');
      writeResponse(res, response, start);
    };


    Domains.getAuthorByGist(params, options, callback);

  }
};

exports.personCount = {
  'spec': {
    "description" : "Person count",
    "path" : "/domains/count",
    "notes" : "Person count",
    "summary" : "Person count",
    "method": "GET",
    "params" : [],
    "responseClass" : "Count",
    "errorResponses" : [swe.notFound('domains')],
    "nickname" : "personCount"
  },
  'action': function (req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();
    Domains.getAllCount(null, options, function (err, response) {
      // if (err || !response.results) throw swe.notFound('domains');
      writeResponse(res, response, start);
    });
  }
};

exports.addPerson = {
  'spec': {
    "path" : "/domains",
    "notes" : "adds a person to the graph",
    "summary" : "Add a new person to the graph",
    "method": "POST",
    "responseClass" : "List[Domain]",
    "params" : [
      param.query("name", "Person name, seperate multiple names by commas", "string", true, true)
    ],
    "errorResponses" : [swe.invalid('input')],
    "nickname" : "addPerson"
  },
  'action': function(req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();
    var names = _.invoke(parseUrl(req, 'name').split(','), 'trim');
    if (!names.length){
      throw swe.invalid('name');
    } else {
      Domains.createMany({
        names: names
      }, options, function (err, response) {
        if (err || !response.results) throw swe.invalid('input');
        writeResponse(res, response, start);
      });
    }
  }
};


exports.addRandomDomains = {
  'spec': {
    "path" : "/domains/random/{n}",
    "notes" : "adds many random domains to the graph",
    "summary" : "Add many random new domains to the graph",
    "method": "POST",
    "responseClass" : "List[Domain]",
    "params" : [
      param.path("n", "Number of random domains to be created", "integer", null, 1)
    ],
    "errorResponses" : [swe.invalid('input')],
    "nickname" : "addRandomDomains"
  },
  'action': function(req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();
    var n = parseInt(req.params.n, 10);
    if (!n){
      throw swe.invalid('input');
    } else {
      Domains.createRandom({n:n}, options, function (err, response) {
        if (err || !response.results) throw swe.invalid('input');
        writeResponse(res, response, start);
      });
    }
  }
};


exports.findByName = {
  'spec': {
    "description" : "find a domain",
    "path" : "/domains/name/{name}",
    "notes" : "Returns a domain based on name",
    "summary" : "Find domain by name",
    "method": "GET",
    "params" : [
      param.path("name", "Name of domain that needs to be fetched", "string")
    ],
    "responseClass" : "Domain",
    "errorResponses" : [swe.invalid('name'), swe.notFound('domain')],
    "nickname" : "getPersonByName"
  },
  'action': function (req,res) {
    var name = req.params.name;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!name) throw swe.invalid('name');

    var params = {
      name: name
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('domain');
      writeResponse(res, response, start);
    };

    Domains.getByName(params, options, callback);
  }
};

