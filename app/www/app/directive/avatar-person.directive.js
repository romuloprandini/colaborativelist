(function () {
    'use strict';

    angular
        .module('colaborativelist.directive')
        .directive('avatarPerson', avatarPerson);

    avatarPerson.$inject = ['config'];

    function avatarPerson (config) {
        //Usage:
        //<img data-cc-img-person="{{s.speaker.imageSource}}"/>
        var defaultImage = config.imageSettings.defaultImage;
        var directive = {
            link: link,
            restrict: 'A'
        };
        return directive;

        function link(scope, element, attrs) {
            attrs.$observe('avatarPerson', function (value) {
                value = (value || defaultImage);
                attrs.$set('src', value);
            });
        }
    }
})();