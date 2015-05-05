============================
Neo4j GraphGist Browser
============================

This repository is a GraphGist content browser powered by Neo4j. All GraphGist content is consumed from a Neo4j REST API endpoint built using Neo4j Swagger.

* Neo4j: http://www.neo4j.org/download/
* Swagger: http://neo4j-swagger.tinj.com/
* Node.js: http://nodejs.org/
* Bootstrap: http://getbootstrap.com/
* Angular.js: http://angularjs.org/

<a href="http://graphgist.herokuapp.com/">![Neo4j GraphGist Template](http://i.imgur.com/2QkbDh2.png?1)</a>

## Prerequisites

* An instance of Neo4j (`>=2.0.3`) running locally - [http://www.neo4j.org/download](http://neo4j.com/download/)
* Installed `node.js` and `npm` on your machine

## Usage

Follow the directions below for each component of the platform.

### Database

* Extract the Neo4j store files located in `database/graph.db.zip` to your Neo4j data directory `neo4j/data`
* Start the Neo4j server (either at `http://localhost:7474` or use the `NEO4J_URL` environment variable)

### GraphGist API

* From the terminal, go to the `graphgist-cms` project directory and run `npm install`.  After `node_modules` are installed, run `node listen`. The GraphGist web site will be started at `http://localhost:5000`

### Development

#### Codeship

This project is deployed via Codeship to Heroku.  To deploy, do NOT push to Heroku directly, but rather simply push to Github and Codeship will deploy (if the specs pass)

#### Client-side Javascript

The client side is minified and concatenated using gulp.js.  If you make any changes to client-side javascripts you need to run this process for your changes to take effect.  This can be done with the command:

    gulp scripts

You may need to either add `./node_modules/.bin` to your `$PATH` or run `./node_modules/.bin/gulp scripts`

#### Specs

This application has some tests written with mocha.js under the `test/` directory.  

To run the specs:

    npm test

Also, since some of these specs connect to various internet sites (to test the downloading of graphgists), the `sepia` package is used to record these HTTP interactions as test fixtures.  Consult the `sepia` package for details

