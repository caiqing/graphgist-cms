/**
 *  neo4j domain functions
 *  these are mostly written in a functional style
 */


var _ = require('underscore');
var uuid = require('hat'); // generates uuids
var Cypher = require('../neo4j/cypher');
var Role = require('../models/neo4j/role');
var Domain = require('../models/neo4j/domain');
var async = require('async');
var randomName = require('random-name');


/*
 *  Utility Functions
 */

function _randomName () {
  return randomName.first() + ' ' + randomName.last();
}

function _randomNames (n) {
  return _.times(n, _randomName);
}


/**
 *  Result Functions
 *  to be combined with queries using _.partial()
 */

// return a single domain
var _singleDomain = function (results, callback) {
  if (results.length) {
    var domain = new Domain(results[0].domain);
    domain.gists = results[0].gist;
    domain.related = results[0].related;
    callback(null, domain);
  } else {
    callback(null, null);
  }
};

// return many domains
var _manyDomains = function (results, callback) {
  var domains = _.map(results, function (result) {
    return new Domain(result.domain);
  });

  callback(null, domains);
};

var _manyRoles = function (results, callback) {
  var roles = _.map(results, function (result) {
    return new Role(result);
  });

  callback(null, roles);
}

// return a count
var _singleCount = function (results, callback) {
  if (results.length) {
    callback(null, {
      count: results[0].c || 0
    });
  } else {
    callback(null, null);
  }
};


/**
 *  Query Functions
 *  to be combined with result functions using _.partial()
 */


var _matchBy = function (keys, params, options, callback) {
  var cypher_params = _.pick(params, keys);

  var query = [
    'MATCH (node)',
    'WHERE node:Domain OR node:UseCase',
    'WITH node',
    'MATCH (node)',
    Cypher.where('node', keys),
    'RETURN node as domain'
  ].join('\n');

  callback(null, query, cypher_params);
};



var _getAuthorByGist = function (params, options, callback) {
  var cypher_params = {
    title: params.title
  };

  var query = [
    'MATCH (gist:Gist {title: {title}})',
    'MATCH (domain)<-[:HAS_USECASE]-(gist)', 
    'RETURN DISTINCT domain'
  ].join('\n');

  callback(null, query, cypher_params);
};

// var _getCoActorsByDomain = function (params, options, callback) {
//   var cypher_params = {
//     name: params.name
//   };

//   var query = [
//     'MATCH (actor:Domain {name: {name}})',
//     'MATCH (actor)-[:ACTED_IN]->(m)',
//     'WITH m, actor',
//     'MATCH (m)<-[:ACTED_IN]-(domain:Domain)',
//     'WHERE actor <> domain', 
//     'RETURN domain'
//   ].join('\n');

//   callback(null, query, cypher_params);
// };

// var _getRolesByGist = function (params, options, callback) {
//   var cypher_params = {
//     title: params.title
//   };

//   var query = [
//     'MATCH (gist:Gist {title: {title}})',
//     'MATCH (domains:Domain)-[relatedTo]-(gist)', 
//     'RETURN { gisttitle: gist.title, name: domains.name, roletype: type(relatedTo) } as role'
//   ].join('\n');

//   callback(null, query, cypher_params);
// };

var _getViewByName = function (params, options, callback) {
  var cypher_params = {
    name: params.name
  };

  var query = [
    // 'MATCH (node)', 
    // 'WHERE node:Domain OR node:UseCase AND node.name= {name}',
    // 'WITH node',
    'MATCH (tag:Tag {name: {name}})-[relatedTo]-(gists:Gist)',  
    'OPTIONAL MATCH (tag)<-[:HAS_USECASE|HAS_DOMAIN]-(gist)-[:HAS_USECASE|HAS_DOMAIN]->(tags)',
    'WITH DISTINCT { name: tags.name, poster_image: tags.poster_image } as related, count(DISTINCT gists) as weight, gist, tag',
    'ORDER BY weight DESC',
    'RETURN collect(DISTINCT { title: gist.title, poster_image: gist.poster_image }) as gist, collect(DISTINCT { related: related, weight: weight }) as related, tag as domain'
  ].join('\n');

  callback(null, query, cypher_params);
};



// var _matchByUUID = _.partial(_matchBy, ['id']);
var _matchAll = _.partial(_matchBy, []);

// gets n random domains
var _getRandom = function (params, options, callback) {
  var cypher_params = {
    n: parseInt(params.n || 1)
  };

  var query = [
    'MATCH (node)',
    'WHERE node:Domain OR node:UseCase',
    'RETURN node, rand() as rnd',
    'ORDER BY rnd',
    'LIMIT {n}'
  ].join('\n');

  callback(null, query, cypher_params);
};

var _getAllCount = function (params, options, callback) {
  var cypher_params = {};

  var query = [
    'MATCH (node)',
    'WHERE node:Domain OR node:UseCase',
    'RETURN COUNT(node) as c'
  ].join('\n');

  callback(null, query, cypher_params);
};

var _updateName = function (params, options, callback) {
  var cypher_params = {
    id : params.id,
    name : params.name
  };

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ id?
  var query = [
    'MATCH (node)',
    'WHERE node:Domain OR node:UseCase',
    'WITH node',
    'MATCH (node {id:{id}})',
    'SET node.name = {name}',
    'RETURN node as domain'
  ].join('\n');

  callback(null, query, cypher_params);
};

// creates the domain with cypher
var _create = function (params, options, callback) {
  var cypher_params = {
    id: params.id || uuid(),
    name: params.name
  };

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ id?
  var query = [
    'MERGE (node)',
    'WHERE node:Domain OR node:UseCase',
    'WITH node',
    'MERGE (node {name: {name}, id: {id}})',
    'ON CREATE',
    'SET node.created = timestamp()',
    'ON MATCH',
    'SET node.lastLogin = timestamp()',
    'RETURN node as domain'
  ].join('\n');

  callback(null, query, cypher_params);
};

// delete the domain and any relationships with cypher
var _delete = function (params, options, callback) {
  var cypher_params = {
    id: params.id
  };

//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ id?
  var query = [
    'MATCH (node)',
    'WHERE node:Domain OR node:UseCase',
    'WITH node',
    'MATCH (node {id:{id}})',
    'OPTIONAL MATCH (node)-[r]-()',
    'DELETE node, r',
  ].join('\n');
  callback(null, query, cypher_params);
};

// delete all domains
var _deleteAll = function (params, options, callback) {
  var cypher_params = {};

  var query = [
    'MATCH (node)',
    'OPTIONAL MATCH (node)-[r]-()',
    'WHERE node:Domain OR node:UseCase',
    'DELETE node, r',
  ].join('\n');
  callback(null, query, cypher_params);
};

// get a single domain by id
// var getById = Cypher(_matchByUUID, _singleDomain);

// get a single domain by name
var getByName = Cypher(_getViewByName, _singleDomain);

// Get a author of a gist
// var getAuthorByGist = Cypher(_getAuthorByGist, _singleDomain);

// get gist roles
// var getRolesByGist = Cypher(_getRolesByGist, _manyRoles);

// Get a author of a gist
// var getCoActorsByDomain = Cypher(_getCoActorsByDomain, _manyDomains);

// get n random domains
var getRandom = Cypher(_getRandom, _manyDomains);

// // get n random domains
// var getRandomWithFriends = Cypher(_getRandomWithFriends, _manyDomainsWithFriends);

// get a domain by id and update their name
var updateName = Cypher(_updateName, _singleDomain);

// create a new domain
var create = Cypher(_create, _singleDomain);

// create many new domains
var createMany = function (params, options, callback) {
  if (params.names && _.isArray(params.names)) {
    async.map(params.names, function (name, callback) {
      create({name: name}, options, callback);
    }, function (err, responses) {
      Cypher.mergeReponses(err, responses, callback);
    });
  } else if (params.domains && _.isArray(params.domains)) {
    async.map(params.domains, function (domain, callback) {
      create(_.pick(domain, 'name', 'id'), options, callback);
    }, function (err, responses) {
      Cypher.mergeReponses(err, responses, callback);
    });
  } else {
    callback(null, []);
  }
};

var createRandom = function (params, options, callback) {
  var names = _randomNames(params.n || 1);
  createMany({names: names}, options, callback);
};

// login a domain
var login = create;

// get all domains
var getAll = Cypher(_matchAll, _manyDomains);

// get all domains count
var getAllCount = Cypher(_getAllCount, _singleCount);

// delete a domain by id
var deleteDomain = Cypher(_delete);

// delete a domain by id
var deleteAllDomains = Cypher(_deleteAll);

// reset all domains
var resetDomains = function (params, options, callback) {
  deleteAllDomains(null, options, function (err, response) {
    if (err) return callback(err, response);
    createRandom(params, options, function (err, secondResponse) {
      if (err) return Cypher.mergeRaws(err, [response, secondResponse], callback);
      manyFriendships({
        domains: secondResponse.results,
        friendships: params.friendships
      }, options, function (err, finalResponse) {
        // this doesn't return all the domains, just the ones with friends
        Cypher.mergeRaws(err, [response, secondResponse, finalResponse], callback);
      });
    });
  });
};

// export exposed functions

module.exports = {
  getAll: getAll,
  // getById: getById,
  getByName: getByName,
  // getAuthorByGist: getAuthorByGist,
  // getCoActorsByDomain: getCoActorsByDomain,
  // getRolesByGist: getRolesByGist
};
