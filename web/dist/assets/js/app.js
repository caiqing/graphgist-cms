'use strict';
//1.set up routes
/* App Module */
var contentApp = angular.module('contentApp', [
  'ngRoute',
  'ngResource',
  'contentappControllers',
  'ui.sortable'
]).run(['$rootScope', function ($rootScope) {
  $rootScope.UTIL = {

    // Maybe not the best place for this.
    // Is there a way to get helpers that can load resources themselves?
    loadGist: function (url, $http, $scope, $templateCache) {
      return($http({method: 'GET', url: url, cache: $templateCache}).
        success(function(data, status, headers, config) {
          if (_(data).size()) {
            $scope.gist = data;
            $scope.gist.poster_image = $scope.gist.poster_image || ($scope.gist.title ? '/assets/img/posters/' + $scope.gist.title.replace('/', ' ') + '.jpg' : '');
            $scope.gist.poster_image = $scope.gist.poster_image.replace("w185", "w300");
            if ($scope.gists) {
              $scope.gists.forEach(function (gist) {
                gist.categories = (gist.genres || []).concat(gist.usecases || [])
              });
            }
          } else {
            $scope.gist = $scope.gist || {};
          }
        }).
        error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        }));
    },

    gistTemplate: function (gist) {
      var gistTitleLink = gist.poster_image || '/assets/img/posters/' + gist.title.replace('/', ' ') + '.jpg';

      var gistId = gist.id || encodeURIComponent(encodeURIComponent(gist.url));

      return('<div class="item">' +
        '<a class="carousel-gists thumbnail" href="#!/gists/' + gistId + '/summary" style="background-image: url('+ encodeURI(gistTitleLink) +')"></a>' +
        '<span><a href="#!/gists/'+ gistId +'/summary">' + gist.title + '</a></span>' +
      '</div>');
    },

    fetchGists: function(url, $http, $scope, $templateCache)
    {
      return $http({method: 'GET', url: $scope.url, cache: $templateCache}).
        success(function(data, status, headers, config) {
          $scope.gists = data;
          $scope.gists.forEach(function (gist) {
            gist.categories = (gist.genres || []).concat(gist.usecases || [])
          });
        }).
        error(function(data, status, headers, config) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
        });
    }

  }
}]);

contentApp.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('!');

    $routeProvider.
      when('/gists', {
        templateUrl: 'assets/partials/home.html',
        controller: 'GistListCtrl'
      }).
      when('/gists/all', {
        templateUrl: 'assets/partials/gist-all.html',
        controller: 'GistListAllCtrl'
      }).
      when('/gists/about', {
        templateUrl: 'templates/gist-about'
      }).
      when('/gists/challenge', {
        templateUrl: 'templates/gist-challenge'
      }).
      when('/gists/check_submission_form', {
        templateUrl: 'assets/partials/gist-check-submission-form.html',
        controller: 'GistSubmitCtrl'
      }).
      when('/gists/submit', {
        templateUrl: 'templates/gist-submit',
        controller: 'GistSubmitCtrl'
      }).
      when('/gists/submit/thank_you', {
        templateUrl: 'assets/partials/gist-submit-thank-you.html'
      }).
      when('/gists/manage', {
        templateUrl: 'templates/gist-manage',
        controller: 'GistManageCtrl'
      }).
      when('/gists/manage/featured', {
        templateUrl: 'templates/gist-manage-featured',
        controller: 'GistManageFeaturedCtrl'
      }).
      when('/gists/manage/:id', {
        templateUrl: 'templates/gist-manage-gist',
        controller: 'GistManageGistCtrl'
      }).
      when('/gists/:gistId', {
        templateUrl: 'assets/partials/gist.html',
        controller: 'GistCtrl'
      }).
      when('/gists/:gistId/summary', {
        templateUrl: 'assets/partials/gist-detail.html',
        controller: 'GistItemCtrl'
      }).

      when('/domains/:domainsId', {
        templateUrl: 'templates/domains-detail',
        controller: 'DomainCtrl'
      }).

      otherwise({
        redirectTo: '/gists'
      });
  }]);



