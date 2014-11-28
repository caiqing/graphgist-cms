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
      when('/gists/about', {
        templateUrl: 'templates/gist-about'
      }).
      when('/gists/submit', {
        templateUrl: 'assets/partials/gist-submit.html',
        controller: 'GistSubmitCtrl'
      }).
      when('/gists/submit/thank_you', {
        templateUrl: 'assets/partials/gist-submit-thank-you.html'
      }).
      when('/gists/:gistId', {
        template : '<div id="gist" ng-include="getTemplateUrl()"></div>',
        controller: 'GistCtrl'
      }).
      when('/gists/:gistId/summary', {
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



