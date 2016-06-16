(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('configureDatabase', configureDatabase);
        
        configureDatabase.$inject = ['$q', 'config'];
    
        function configureDatabase($q, config) {
            var vm = this,
            configurationDB = PouchDB('configuration'),
            service = {
                configure: configure
            }
            
            return service;
            
            //FUNCTIONS
            function configure() {
                configurationDB
            }
            
        }

})();