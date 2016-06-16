(function() {
    'use strict';
    
    angular
        .module('colaborativelist.core', [
            /*ionic and angular modules */
            'ionic',
            'ngResource', 
            'ngCordova',
            'ngAnimate',
            'ngSanitize',
            'ngRoute',
            
            /* Reusable modules */
            'blocks.logger',
            'blocks.exception',
            'blocks.router'
            
            /* 3rd parties modules */
        ]);

})();