'use strict';

/* Controllers */

angular.module('SharedServices', [])
    .config(function ($httpProvider) {
        $httpProvider.responseInterceptors.push('myHttpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            // todo start the spinner here
            //alert('start spinner');
            $('#mydiv').show();
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    })
// register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('myHttpInterceptor', function ($q, $window) {
        return function (promise) {
            return promise.then(function (response) {
                // do something on success
                // todo hide the spinner
                //alert('stop spinner');
                $('#mydiv').hide();
                $('.hidden-content').removeClass('hidden-content');
                return response;

            }, function (response) {
                // do something on error
                // todo hide the spinner
                //alert('stop spinner');
                $('#mydiv').hide();
                $('.hidden-content').removeClass('hidden-content');
                return $q.reject(response);
            });
        };
    });

var contentappControllers = angular.module('contentappControllers', ['SharedServices']);

contentApp.directive('carousel', function() {
	var res = {
     restrict : 'A',
     link     : function (scope, element, attrs) {
           scope.$watch(attrs.carousel, function(gists) {  
           	if(scope.gists.length > 0)
           	{
           		gists = scope.gists;
           		var genre = element.attr('data-genre');
           		var html = '';
	            for (var i = 0; i < gists.length; i++) {
	            	if ($.inArray(genre, gists[i].genres) != -1) {
	            	var gistTitleLink = gists[i].poster_image || '/assets/img/posters/' + gists[i].title.replace('/', ' ') + '.jpg';
	                 html += '<div class="item">' +
                      '<a class="carousel-gists thumbnail" href="#/gists/' + gists[i].title.replace('/', '%252F') + '/summary" style="background-image: url('+ gistTitleLink +')"></a>' +
						          '<span><a href="#/gists/' + gists[i].title.replace('/', '%252F') + '/summary">' + gists[i].title + '</a></span>' +
						        '</div>';
						    };
	            }
            
            	element[0].innerHTML = html;

            	setTimeout(function() {
	            $(element).owlCarousel({
						items : 8,
						itemsDesktop : [1199,6],
						itemsDesktopSmall : [980,5],
						itemsTablet: [768,4],
						itemsMobile: [479, 2]
					});

            	$("#owl-example").owlCarousel({
					    items : 3,
					    itemsDesktop : [1199,3],
					    itemsDesktopSmall : [980,3],
					    itemsTablet: [768,2]
					});
	           }, 0);
			}
        	
        });
       }
   };
  return res;
});

contentApp.controller('GistListCtrl', ['$scope', '$http', '$templateCache', 
	function($scope, $http, $templateCache) {
	  	$scope.url = API_URL+'/api/v0/gists?api_key=special-key&neo4j=false';
	  	$scope.gists = [];

	  	var fetchGists = function()
	  	{
	  		$http({method: 'GET', url: $scope.url, cache: $templateCache}).
			    success(function(data, status, headers, config) {
			    	$scope.gists = data;
			    }).
			    error(function(data, status, headers, config) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			    });
	  	}

	  	fetchGists();
	}]);

contentApp.controller('GistSubmitCtrl', ['$scope', '$routeParams',
  function($scope, $routeParams) {
    var name, value;

    for (name in $routeParams) {
      value = $routeParams[name];

      $('[name="'+ name +'"]').val(value);
    }

      
    $scope.tshirt_sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

    $('[required="required"]').closest('.form-group').find('.label-text').append(' <span class="required-star">*</span>')
  }]);

contentApp.directive('carouselrelatedgists', function() {
	var res = {
     restrict : 'A',
     link     : function (scope, element, attrs) {
           scope.$watch(attrs.carouselrelatedgists, function(gist) {  
           	if(scope.gist != undefined ? scope.gist.related != undefined ? scope.gist.related.length > 0 : false : false)
           	{
           		gist = scope.gist;
           		var html = '';
	            for (var i = 0; i < gist.related.length; i++) {
					var relatedGistTitleLink = gist.related[i].related.poster_image || '/assets/img/posters/' + gist.related[i].related.title.replace('/', ' ') + '.jpg';
	                 html += '<div class="item">' +
                      '<a class="carousel-gists thumbnail" href="#/gists/' + gist.related[i].related.title.replace('/', '%252F') + '/summary" style="background-image: url('+ relatedGistTitleLink +')"></a>' +
						          '<span><a href="#/gists/' + gist.related[i].related.title.replace('/', '%252F')  + '/summary">' + gist.related[i].related.title + '</a></span>' +
						        '</div>';

	            }

            	element[0].innerHTML = html;

            	setTimeout(function() {
	            $(element).owlCarousel({
					items : 7,
					itemsDesktop : [1199,6],
					itemsDesktopSmall : [980,5],
					itemsTablet: [768,5],
					itemsMobile: [479, 3]
				});
				Holder.run();
	           }, 0);
			}
        	
        });
       }
   };
  return res;
});



contentApp.controller('GistItemCtrl', ['$scope', '$routeParams', '$http', '$templateCache',
  function($scope, $routeParams, $http, $templateCache) {
  		$scope.url = API_URL+'/api/v0/gists/title/' + encodeURIComponent(decodeURI(decodeURI($routeParams.gistId))) + '?api_key=special-key&neo4j=false';
	  	var fetchGist = function()
	  	{
	  		$http({method: 'GET', url: $scope.url, cache: $templateCache}).
			    success(function(data, status, headers, config) {
			    	$scope.gist = data;
			    	$scope.gist.poster_image = $scope.gist.poster_image || '/assets/img/posters/' + $scope.gist.title.replace('/', ' ') + '.jpg';
			    	$scope.gist.poster_image = $scope.gist.poster_image.replace("w185", "w300");
			    }).
			    error(function(data, status, headers, config) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			    });
	  	}

	  	fetchGist();
  }]);

contentApp.controller('GistCtrl', ['$scope', '$routeParams', '$timeout',
  function($scope, $routeParams, $timeout) {
    $scope.getTemplateUrl = function () {
      return('/gists/' + $routeParams.gistId + '.html');
    }
  }]);

var gist_body_interval = setInterval(function() {
  console.log('interval');
    if ( $('#gist-body').html() ) {
      renderGraphGist();
      clearInterval(gist_body_interval);
    }
  }, 100);

contentApp.directive('carouseldomainsgists', function() {
	var res = {
     restrict : 'A',
     link     : function (scope, element, attrs) {
           scope.$watch(attrs.carouseldomainsgists, function(domains) {  
           	if(scope.domains != undefined ? scope.domains.gists != undefined ? scope.domains.gists.length > 0 : false : false)
           	{
           		domains = scope.domains;
           		var html = '';
	            for (var i = 0; i < domains.gists.length; i++) {
	            	var relatedGistTitleLink = domains.gists[i].poster_image || '/assets/img/posters/' + domains.gists[i].title.replace('/', ' ') + '.jpg';
	                 html += '<div class="item">' +
						          '<div class="thumbnail">' +
						            '<a href="#/gists/' + domains.gists[i].title.replace('/', '%252F')  + '/summary"><img src="' + relatedGistTitleLink +'"/></a>' +
						          '</div>' +
						          '<span><a href="#/gists/' + domains.gists[i].title.replace('/', '%252F')  + '/summary">' + domains.gists[i].title + '</a></span>' +
						        '</div>';

	            }

            	element[0].innerHTML = html;

            	setTimeout(function() {
	            $(element).owlCarousel({
					items : 7,
					itemsDesktop : [1199,6],
					itemsDesktopSmall : [980,5],
					itemsTablet: [768,5],
					itemsMobile: [479, 3]
				});
				Holder.run();
	           }, 0);
			}
        	
        });
       }
   };
  return res;
});

contentApp.directive('carouselrelateddomains', function() {
	var res = {
     restrict : 'A',
     link     : function (scope, element, attrs) {
           scope.$watch(attrs.carouselrelateddomains, function(domains) {  
           	if(scope.domains != undefined ? scope.domains.related != undefined ? scope.domains.related.length > 0 : false : false)
           	{
           		domains = scope.domains;
           		var html = '';
	            for (var i = 0; i < domains.related.length; i++) {
					var actorTitleLink = domains.related[i].related.poster_image || '/assets/img/actors/' + domains.related[i].related.name.replace('/', ' ') + '.jpg';
	                 html += '<div class="item">' +
						          '<div class="thumbnail">' +
						            '<a href="#/domains/' + domains.related[i].related.name + '"><img src="' + actorTitleLink + '"/></a>' +
						          '</div>' +
						          '<span><a href="#/domains/' + domains.related[i].related.name + '">' + domains.related[i].related.name + '</a></span>' +
						        '</div>';

	            }
            //src="assets/img/actors/' + actorTitleLink + '.jpg"
            	element[0].innerHTML = html;

            	setTimeout(function() {
	            $(element).owlCarousel({
					items : 8,
					itemsDesktop : [1199,7],
					itemsDesktopSmall : [980,5],
					itemsTablet: [768,5],
					itemsMobile: [479, 3]
				});
				Holder.run();
	           }, 0);
			}
        	
        });
       }
   };
  return res;
});

contentApp.controller('PeopleItemCtrl', ['$scope', '$routeParams', '$http', '$templateCache',
  function($scope, $routeParams, $http, $templateCache) {
  		$scope.url = API_URL+'/api/v0/domains/name/' + encodeURIComponent(decodeURI(decodeURI($routeParams.domainsId))) + '?api_key=special-key&neo4j=false';
	  	var fetchPeople = function()
	  	{
	  		$http({method: 'GET', url: $scope.url, cache: $templateCache}).
			    success(function(data, status, headers, config) {
			    	$scope.domains = data;
			    	$scope.domains.poster_image = $scope.domains.poster_image || '/assets/img/actors/' + $scope.domains.name.replace('/', ' ') + '.jpg';
			    }).
			    error(function(data, status, headers, config) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			    });
	  	}

	  	fetchPeople();
  }]);

