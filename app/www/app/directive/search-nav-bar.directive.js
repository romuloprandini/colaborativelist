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
        require: '^^ionNavBar',
        templateUrl: 'app/directive/search-nav-bar-directive.html',
        controller: SearchNavBarController,
        controllerAs: 'vm',
        bindToController: true
    };
    
    return directive;
    
    function link(scope, element, attrs, NavBarController) {
        scope.NavBarController = NavBarController;
        scope.focusSearch = focusSearch;
        
        function focusSearch() {
        $timeout(function() {
            element.find('input')[0].focus();
        }, 100);
    }
        }
}

SearchNavBarController.$inject = ['$scope', '$timeout'];

function SearchNavBarController($scope, $timeout) {
    var vm = this;
    vm.translation = translation;
    vm.clear = clear;
    vm.hide = hide;
    
    init();
    
    function init() {
        $scope.$watch('vm.visibility', function(newValue, oldValue) {
          $scope.NavBarController.showBar(!newValue);
        if(newValue) {
          $scope.focusSearch();
          $scope.$parent.$hasHeader = true;
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