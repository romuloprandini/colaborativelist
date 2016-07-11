(function() {
    'use strict';

    angular
        .module('colaborativelist.directive')
        .directive('searchNavBar', searchNavBar);
     
    
    function searchNavBar($timeout) {
        var directive = {
        scope: {
            visibility: '=showSearch',
            filter: '='
        },
        link: link,
        restrict: 'E',
        templateUrl: 'app/directive/search-nav-bar-directive.html',
        controller: SearchNavBarController,
        controllerAs: 'vm',
        bindToController: true
    };
    
    return directive;
    
    function link(scope, element, attrs) {
        scope.focusSearch = focusSearch;
        
        function focusSearch() {
        $timeout(function() {
            element.find('input')[0].focus();
        }, 100);
    }
        }
}

SearchNavBarController.$inject = ['$scope', '$timeout', '$document'];

function SearchNavBarController($scope, $timeout, $document) {
    var vm = this;
    vm.translation = translation;
    vm.clear = clear;
    vm.hide = hide;
    vm.navbar = $document[0].body.querySelector('.nav-bar-container');
    
    init();
    
    function init() {
        $scope.$watch('vm.visibility', function(newValue, oldValue) {
        if(newValue) {
          vm.navbar.style.display = 'none';
          $scope.focusSearch();
         $scope.$parent.$hasHeader = true;
        } else {
            vm.navbar.style.display = '';
        }
      })
    }
    
    function clear() {
        vm.filter = '';
        $scope.focusSearch();
    }
        
    function hide(show) {
        vm.filter = '';
        vm.visibility = show;
    }
}
})();