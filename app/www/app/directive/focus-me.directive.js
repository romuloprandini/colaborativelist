(function() {
    'use strict';

    angular
        .module('colaborativelist.directive')
        .directive('focusMe', focusMe);

    focusMe.$inject = ['$timeout'];

    function focusMe($timeout) {
        return {
            link: function(scope, element, attrs) {
                    $timeout(function() {
                        element[0].focus();
                    },200);
            }
        };
    }
})();