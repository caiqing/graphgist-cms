'use strict';

/* Controllers */

angular.module('SharedServices', [])
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.responseInterceptors.push('myHttpInterceptor');
        var spinnerFunction = function (data, headersGetter) {
            // todo start the spinner here
            //alert('start spinner');
            $('#mydiv').show();
            return data;
        };
        $httpProvider.defaults.transformRequest.push(spinnerFunction);
    }])
// register the interceptor as a service, intercepts ALL angular ajax http calls
    .factory('myHttpInterceptor', ['$q', '$window', function ($q, $window) {
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
    }]);

var contentappControllers = angular.module('contentappControllers', ['SharedServices']);

contentApp.controller('GistListCtrl', ['$scope', '$http', '$templateCache', 
	function($scope, $http, $templateCache) {
	  	$scope.url = API_URL+'/api/v0/gists?api_key=special-key&neo4j=false&featured=true';
	  	$scope.gists = [];

      $scope.domains =  ['Finance', 'Retail', 'Entertainment', 'Telecommunications', 'Mass Media']

      $http({method: 'GET', url: API_URL+'/api/v0/domains?front_page=true'}).
        success(function(data, status, headers, config) {
          $scope.domains = _(data).pluck('name').sort().value()
        }).
        error(function(data, status, headers, config) { });


      $scope.UTIL.fetchGists($scope.url, $http, $scope, $templateCache).success(function (data) {
        $scope.gists_by_domain = _(data).reduce(function (result, gist) {
          _(gist.genres).each(function (genre) {
            if (typeof(result[genre]) === 'undefined') result[genre] = []
            result[genre].push(gist);
          });
          return(result);
        }, {});

        // Reload foundation
        $(document).foundation()

        // Remove bullets when there's just one
        $(".orbit-container").each(function() {
            var orbitContainer = $(this);
            var numberOfPages = orbitContainer.find(".orbit-bullets li").size();
            console.log({numberOfPages: numberOfPages});
            if (numberOfPages === 1) {
                orbitContainer.find(".orbit-bullets li").css('visibility', 'hidden');
                //orbitContainer.find(".orbit-prev").hide();
                //orbitContainer.find(".orbit-next").hide();
            }
        });
      });
	}]);

contentApp.directive('afterRenderRepeat', function() {
  return function(scope, element, attrs) {
    if (scope.$last){
      $(document).foundation();
    }
 };
})

contentApp.controller('GistListAllCtrl', ['$scope', '$http',
    function ($scope, $http) {
	  	$scope.url = API_URL+'/api/v0/gists?api_key=special-key&neo4j=false';
	  	$scope.gists = [];

      $scope.UTIL.fetchGists($scope.url, $http, $scope).success(function (gists) {
        $scope.grouped_gists = _(gists).reduce(function (grouped_gists, gist) {

          add_gist_to_group = function (gist, group, grouped_gists) {
            if (typeof grouped_gists[group] === 'undefined') grouped_gists[group] = []
            grouped_gists[group].push(gist)
          }

          gist.usecases.forEach(function (usecase) { add_gist_to_group(gist, usecase, grouped_gists) });
          gist.genres.forEach(function (genre) { add_gist_to_group(gist, genre, grouped_gists) });
          
          return(grouped_gists);
        }, {});
      });

      $scope.chosen_group = null

      $scope.in_group = function (gist, group) {
        return((group === null) || (gist.usecases.indexOf(group) > -1) || (gist.genres.indexOf(group) > -1));
      }

      $scope.choose_group = function (group) {
        $scope.chosen_group = group;
      }
    }]);

contentApp.controller('GistSubmitCtrl', ['$scope', '$routeParams', '$location', '$http',
  function($scope, $routeParams, $location, $http) {
    var name, value;

    var form = $('form#gist-submit-form');

    $('[name=url]').change(function () {
      var notice = $('#invalid-url-notice');
      var url = $('[name=url]').val();

      if ((typeof url !== 'undefined') && url.match(/graphgist\.neo4j\.com/)) {
        notice.show();
        form.attr('disabled', true);
      } else {
        notice.hide();
        form.attr('disabled', null);
      }
    });

    for (name in $routeParams) {
      value = $routeParams[name];

      $('[name="'+ name +'"]').val(value);
    }

    $scope.tshirt_sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

    $scope.categories = []

    // Default list
    $scope.domains = ['Education', 'Finance', 'Life Science', 'Manufacturing', 'Sports', 'Resources', 'Retail', 'Telecommunication', 'Transport', 'Advanced', 'Other']

    $http({method: 'GET', url: API_URL+'/api/v0/domains'}).
      success(function(data, status, headers, config) {
        $scope.domains = _(data).pluck('name').sort().value()
      }).
      error(function(data, status, headers, config) { });

    $scope.add_category = function () {
      $scope.categories.push($scope.category);
      $scope.domains = _($scope.domains).without($scope.category).value();
      $scope.category = null;
      $scope.categories.sort();
      $scope.domains.sort();
    }

    $scope.remove_category = function (category) {
      $scope.categories = _($scope.categories).without(category).value();
      $scope.domains.push(category);
      $scope.categories.sort();
      $scope.domains.sort();
    }


    $('[required="required"]').closest('.form-group').find('.label-text').append(' <span class="required-star">*</span> ')

    $scope.submit = function () {
      var form_data = {};

      if (form.attr('disabled')) {
        alert('There is an error in the form');
        return
      }

      form.serializeArray().forEach(function (input) {
        form_data[input.name] = input.value;
      });
      delete form_data.category;
      form_data.categories = $scope.categories;

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

contentApp.filter('posterImage', function() {
  return function(gist) {
    return(gist.poster_image || '/assets/img/posters/' + gist.title.replace('/', ' ') + '.jpg');
  }
});




contentApp.controller('GistItemCtrl', ['$scope', '$routeParams', '$http', '$templateCache',
  function($scope, $routeParams, $http, $templateCache) {
  		$scope.url = API_URL+'/api/v0/gists/' + encodeURIComponent(decodeURI(decodeURI($routeParams.gistId))) + '?api_key=special-key&neo4j=false';

      $scope.UTIL.loadGist($scope.url, $http, $scope, $templateCache)
  
      $scope.current_panel = 'panel1';
      $scope.set_panel = function (panel) { $scope.current_panel = panel; }
  }]);

contentApp.controller('GistCtrl', ['$scope', '$routeParams', '$interval', '$http', '$templateCache',
  function($scope, $routeParams, $interval, $http, $templateCache) {
    var gistId = decodeURIComponent($routeParams.gistId);

    $scope.gist = {};

    $scope.url = API_URL+'/api/v0/gists/' + encodeURIComponent(encodeURIComponent(gistId)) + '?api_key=special-key&neo4j=false';

    $scope.UTIL.loadGist($scope.url, $http, $scope, $templateCache)

    $scope.loading_message = 'Loading...';

    $scope.original_url = function () {
      return($routeParams.original_url || $scope.gist.original_url);
    }

    $scope.$on('$viewContentLoaded', function () {

      $.ajax({
        url: '/gists/' + encodeURIComponent(gistId) + '.html',
        type: 'GET'
      }).done(function (content) {
//        var gist = new Gist($, content);
//        gist.getGistAndRenderPage(renderContent, DEFAULT_SOURCE);

        GraphGistRenderer.renderContent(content, '', '');

        if ( !$scope.gist.title ) {
          var first_element = $('#content :first');
          if (first_element[0].tagName === 'H1') {
            $scope.gist.title = first_element.text();
            first_element.remove();
          }
        }

        // Why isn't this always working?
        document.title = $scope.gist.title + ' - Neo4j GraphGist';

      }).fail(function (error) {
        $scope.loading_message = 'There was an error loading the gist';
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
    
    $http({method: 'GET', url: '/api/v0/gists?status=all'}).
      success(function(data, status, headers, config) {
        $scope.gists_by_status = _(data).groupBy(function(gist) { return(gist.status) }).value();
      }).
      error(function(data, status, headers, config) {
        alert('Error in loading gists!');
      });
  }]);

contentApp.controller('GistManageFeaturedCtrl', ['$scope', '$http', '$timeout',
  function($scope, $http, $timeout) {
    
    $scope.gists = []

    var timeout;
    $scope.sortableOptions = {
      stop: function(e, ui) {
        $http.put('/api/v0/gists/featured_order?api_key=special-key', _($scope.gists).pluck('id').value()).
        success(function(data, status, headers, config) {
          $scope.message = 'Save successful';
          $timeout.cancel(timeout);
          timeout = $timeout(function () {
            $scope.message = null;
          }, 5000);
        }).
        error(function(data, status, headers, config) {
          alert('Error in saving featured gist order!');
        });

  
      },
    };

    $http({method: 'GET', url: '/api/v0/gists?api_key=special-key&neo4j=false&featured=true'}).
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

contentApp.controller('DomainCtrl', ['$scope', '$routeParams', '$http', '$templateCache',
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

contentApp.controller('GistSearchForm', ['$scope', '$http', '$timeout',
    function ($scope, $http, $timeout) {
      $scope.results = null;

      $scope.search_result_clicked = function () {
        $scope.query = '';
      }

      var current_timeout;

      $scope.$watch('query', function () {
        $scope.results = null;
        if (current_timeout) $timeout.cancel(current_timeout);

        current_timeout = $timeout(function () {
          $http({method: 'GET', url: '/api/v0/gists?api_key=special-key&neo4j=false&query=' + encodeURIComponent($scope.query)}).
            success(function (data, status, headers, config) {
              $scope.results = data;
            }).
            error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            });
        }, 300);
      });
    }]);
