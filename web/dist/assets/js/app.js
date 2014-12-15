'use strict';
//1.set up routes
/* App Module */
var contentApp = angular.module('contentApp', [
  'ngRoute',
  'ngResource',
  'contentappControllers'
]).run(function ($rootScope) {
  $rootScope.UTIL = {

    // Maybe not the best place for this.
    // Is there a way to get helpers that can load resources themselves?
    loadGist: function (url, $http, $scope, $templateCache) {
      $http({method: 'GET', url: url, cache: $templateCache}).
        success(function(data, status, headers, config) {
          if (_(data).size()) {
            $scope.gist = data;
            $scope.gist.poster_image = $scope.gist.poster_image || ($scope.gist.title ? '/assets/img/posters/' + $scope.gist.title.replace('/', ' ') + '.jpg' : '');
            $scope.gist.poster_image = $scope.gist.poster_image.replace("w185", "w300");
          } else {
            $scope.gist = $scope.gist || {};
          }
        }).
        error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        });
    },

    gistTemplate: function (gist) {
      var gistTitleLink = gist.poster_image || '/assets/img/posters/' + gist.title.replace('/', ' ') + '.jpg';

      var gistId = gist.id || encodeURIComponent(encodeURIComponent(gist.url));

      return('<div class="item">' +
        '<a class="carousel-gists thumbnail" href="#!/gists/' + gistId + '/summary" style="background-image: url('+ encodeURI(gistTitleLink) +')"></a>' +
        '<span><a href="#!/gists/'+ gistId +'/summary">' + gist.title + '</a></span>' +
      '</div>');
    }

  }
});

contentApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('!');

    $routeProvider.
      when('/gists', {
        templateUrl: 'assets/partials/home.html',
        controller: 'GistListCtrl'
      }).
      when('/gists/about', {
        templateUrl: 'templates/gist-about'
      }).
      when('/gists/challenge', {
        templateUrl: 'templates/gist-challenge'
      }).
      when('/gists/submit', {
        templateUrl: 'assets/partials/gist-submit.html',
        controller: 'GistSubmitCtrl'
      }).
      when('/gists/submit/thank_you', {
        templateUrl: 'assets/partials/gist-submit-thank-you.html'
      }).
      when('/gists/manage', {
        templateUrl: 'templates/gist-manage',
        controller: 'GistManageCtrl'
      }).
      when('/gists/manage/:id', {
        templateUrl: 'templates/gist-manage-gist',
        controller: 'GistManageGistCtrl'
      }).
      when('/gists/:gistId', {
        templateUrl : 'templates/gist',
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



