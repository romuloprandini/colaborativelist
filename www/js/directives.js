angular.module('colaborativelist.directives', ['ionic'])

.directive('scroll', function ($parse) {
    return function(scope, element, attrs) {
        angular.element(element).bind('scroll', function() {
          $parse(attrs.scroll).assign(scope, true);
            scope.$apply();
        });
    };
})

.directive('focusMe', function($timeout) {
    return {
        link: function(scope, element, attrs) {
                $timeout(function() {
                    element[0].focus();
                });
        }
    };
})
.directive('compile', ['$compile', function ($compile) {
      return function(scope, element, attrs) {
          var ensureCompileRunsOnce = scope.$watch(
            function(scope) {
               // watch the 'compile' expression for changes
              return scope.$eval(attrs.compile);
            },
            function(value) {
              // when the 'compile' expression changes
              // assign it into the current DOM
              element.html(value);

              // compile the new DOM and link it to the current
              // scope.
              // NOTE: we only compile .childNodes so that
              // we don't get into infinite loop compiling ourselves
              $compile(element.contents())(scope);
                
              // Use Angular's un-watch feature to ensure compilation only happens once.
              ensureCompileRunsOnce();
            }
        );
    }
}])

.directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;
    
    
            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });
    
    
            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber));
                return plainNumber;
            });
        }
    }
}])
.directive('search', ['$timeout',function ($timeout) {
    function link(scope, element, attrs) {
       
        scope.focusSearch = function() {
            var input = element.find('input')[0];
            $timeout(function() {
                input.focus();
            }, 200);
        }
        
        scope.clear = function() {
            scope.filter = '';
            scope.focusSearch();
        }
        
        scope.hide = function(show) {
            scope.filter = '';
            scope.visibility = show;
        }
        
        scope.$watch('visibility', function(newValue, oldValue) {
          if(newValue) {
              scope.focusSearch();
          }
       });
    }
    return {
        link: link,
        scope: {
            visibility: '=showSearch',
            filter: '=filter',
            translation: "=translation"
        },
        restrict: 'E',
        templateUrl: 'templates/search.html'
    };
}])
.directive('product', function(){
  return {
    restrict:'E',
    templateUrl: 'templates/product.html'
  }
})
;