'use strict';
//1.set up routes
/* App Module */

var contentApp = angular.module('contentApp', [
  'ngRoute',
  'ngResource',
  'contentappControllers'
]);

contentApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/gists', {
        templateUrl: 'assets/partials/home.html',
        controller: 'GistListCtrl'
      }).
      when('/gists/submit', {
        templateUrl: 'assets/partials/gist-submit.html',
        controller: 'GistSubmitCtrl'
      }).
      when('/gists/:gistId', {
        templateUrl: 'assets/partials/gist-detail.html',
        controller: 'GistItemCtrl'
      }).
      when('/domains/:domainsId', {
        templateUrl: 'assets/partials/domains-detail.html',
        controller: 'PeopleItemCtrl'
      }).

      otherwise({
        redirectTo: '/gists'
      });
  }]);



