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
                    var html = '';
                    if(scope.gists.length > 0) {
                      gists = scope.gists;
                      var genre = element.attr('data-genre');
                      var applicable_gists = _(gists).select(function (gist) {
                        return(_(gist.genres).indexOf(genre) >= 0);
                      }).value();

                      if (applicable_gists.length) {
                        _(applicable_gists).each(function (gist) {
                          html += scope.UTIL.gistTemplate(gist)
                        });

                        setTimeout(function() {
                          $(element).owlCarousel({
                            items : 3,
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
                      } else {
                        $(element).parent('.owl-slider').hide();
                      }

                    } else {
                      html = 'No gists found';
                    }
                    element[0].innerHTML = html;
                  });
                }
  };
  return res;
});

contentApp.controller('GistListCtrl', ['$scope', '$http', '$templateCache', 
	function($scope, $http, $templateCache) {
	  	$scope.url = API_URL+'/api/v0/gists?api_key=special-key&neo4j=false';
	  	$scope.gists = [];

      $scope.domains =  ['Finance', 'Retail', 'Entertainment', 'Telecommunications', 'Mass Media']

      $http({method: 'GET', url: API_URL+'/api/v0/domains'}).
        success(function(data, status, headers, config) {
          $scope.domains = _(data).pluck('name').sort().value()
        }).
        error(function(data, status, headers, config) { });


      $scope.UTIL.fetchGists($scope.url, $http, $scope, $templateCache);
	}]);

contentApp.controller('GistListAllCtrl', ['$scope', '$http',
    function ($scope, $http) {
	  	$scope.url = API_URL+'/api/v0/gists?api_key=special-key&neo4j=false';
	  	$scope.gists = [];

      $scope.UTIL.fetchGists($scope.url, $http, $scope);
    }]);

contentApp.controller('GistSubmitCtrl', ['$scope', '$routeParams', '$location', '$http',
  function($scope, $routeParams, $location, $http) {
    var name, value;

    for (name in $routeParams) {
      value = $routeParams[name];

      $('[name="'+ name +'"]').val(value);
    }

    $scope.tshirt_sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

    // Default list
    $scope.domains = ['Education', 'Finance', 'Life Science', 'Manufacturing', 'Sports', 'Resources', 'Retail', 'Telecommunication', 'Transport', 'Advanced', 'Other']

    $http({method: 'GET', url: API_URL+'/api/v0/domains'}).
      success(function(data, status, headers, config) {
        $scope.domains = _(data).pluck('name').sort().value()
      }).
      error(function(data, status, headers, config) { });

    $('[required="required"]').closest('.form-group').find('.label-text').append(' <span class="required-star">*</span>')

    $scope.submit = function () {
      var form_data = {};

      $('form').serializeArray().forEach(function (input) {
        form_data[input.name] = input.value;
      });

      $.ajax({
        url: '/api/v0/gists?api_key=special-key&neo4j=true',
        type: 'POST',
        data: form_data
      }).done(function () {
        $location.path('/gists/submit/thank_you');
        $scope.$apply();
      }).error(function () {
        alert("There was an error submitting your gist");
      });
    };

  }]);

contentApp.filter('gistTitleLink', function() {
  return function(gist) {
    return(gist.poster_image || '/assets/img/actors/' + gist.title.replace('/', ' ') + '.jpg');
  };
});

contentApp.filter('encodeURI', function() {
  return function(string) {
    return(encodeURI(string));
  }
});

contentApp.filter('encodeURIComponent', function() {
  return function(string) {
    return(encodeURIComponent(string));
  }
});


contentApp.directive('carouselrelatedgists', function($timeout) {
	return {
     restrict : 'A',
     scope: {
       gists: '=gists'
     },
     templateUrl: 'templates/gist-thumbs',
     link: function (scope) {
       scope.$on('gistsLoaded', function() {
         $timeout(function () {
           if (scope.gists) {
             $('.owl-carousel').owlCarousel({
               items : 7,
               itemsDesktop : [1199,6],
               itemsDesktopSmall : [980,5],
               itemsTablet: [768,5],
               itemsMobile: [479, 3]
             });
             Holder.run();
           }
         });
       });
     },
   };
});



contentApp.controller('GistItemCtrl', ['$scope', '$routeParams', '$http', '$templateCache',
  function($scope, $routeParams, $http, $templateCache) {
  		$scope.url = API_URL+'/api/v0/gists/' + encodeURIComponent(decodeURI(decodeURI($routeParams.gistId))) + '?api_key=special-key&neo4j=false';

      $scope.UTIL.loadGist($scope.url, $http, $scope, $templateCache)
  }]);

contentApp.controller('GistCtrl', ['$scope', '$routeParams', '$interval', '$http', '$templateCache',
  function($scope, $routeParams, $interval, $http, $templateCache) {
    var gistId = decodeURIComponent($routeParams.gistId);

    $scope.url = API_URL+'/api/v0/gists/' + encodeURIComponent(encodeURIComponent(gistId)) + '?api_key=special-key&neo4j=false';

    $scope.UTIL.loadGist($scope.url, $http, $scope, $templateCache)

    $scope.$on('$viewContentLoaded', function () {

      $.ajax({
        url: '/gists/' + encodeURIComponent(gistId) + '.html',
        type: 'GET'
      }).done(function (content) {
//        var gist = new Gist($, content);
//        gist.getGistAndRenderPage(renderContent, DEFAULT_SOURCE);

        GraphGistRenderer.renderContent(content, '', '');
      }).fail(function (error) {
        console.log({error: arguments});
      });

      $('#gist-id').keydown($('#gist-id').readSourceId);
    });


    var gist_body_interval = $interval(function() {
      if ( $('#gist').html() ) {

        $interval.cancel(gist_body_interval);
      }
    }, 100);

  }]);

contentApp.controller('GistManageCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    
    $http({method: 'GET', url: '/api/v0/gists?status=candidate'}).
      success(function(data, status, headers, config) {
        $scope.gists = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error in loading gists!');
      });
  }]);

contentApp.controller('GistManageGistCtrl', ['$scope', '$routeParams', '$http',
  function($scope, $routeParams, $http) {
    $scope.status_options = ['live', 'candidate'];

    $http({method: 'GET', url: '/api/v0/gists/'+ $routeParams.id}).
      success(function(data, status, headers, config) {
        $scope.gist = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error in loading gist!');
      });

    $scope.submit = function () {
      $http({method: 'PUT', url: '/api/v0/gists/'+ $routeParams.id + '?api_key=special-key&neo4j=true', data: _($scope.gist).omit('updated').value()}).
        success(function(data, status, headers, config) {
          $scope.gist = data;
        }).
        error(function(data, status, headers, config) {
          alert('Error in update gist!');
        });

    }
  }]);

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
						            '<a href="#!/gists/' + domains.gists[i].id  + '/summary"><img src="' + relatedGistTitleLink +'"/></a>' +
						          '</div>' +
						          '<span><a href="#!/gists/' + domains.gists[i].id  + '/summary">' + domains.gists[i].title + '</a></span>' +
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

contentApp.directive('carouselrelateddomains', function($timeout) {
	var res = {
     restrict : 'A',
     scope: {gists: '='},
     link     : function (scope, element, attrs) {
       $timeout(function () {
           scope.$watch(attrs.carouselrelateddomains, function(domains) {  
           	if(scope.domains != undefined ? scope.domains.related != undefined ? scope.domains.related.length > 0 : false : false)
           	{
           		domains = scope.domains;
           		var html = '';
	            for (var i = 0; i < domains.related.length; i++) {
	                 html += '<div class="item">' +
						          '<div class="thumbnail">' +
						            '<a href="#!/domains/' + domains.related[i].related.name + '"><img src="' + actorTitleLink + '"/></a>' +
						          '</div>' +
						          '<span><a href="#!/domains/' + domains.related[i].related.name + '">' + domains.related[i].related.name + '</a></span>' +
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
       })
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
			    	$scope.domain = data;
			    	$scope.domain.poster_image = $scope.domain.poster_image || '/assets/img/actors/' + $scope.domain.name.replace('/', ' ') + '.jpg';
            $scope.$broadcast('gistsLoaded');
			    }).
			    error(function(data, status, headers, config) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			    });
	  	}

	  	fetchPeople();
  }]);

