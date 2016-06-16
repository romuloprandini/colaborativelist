(function() {
    'use strict';
    
    angular
        .module('blocks.logger')
        .factory('logger', logger);
        
        logger.$inject = ['$log', 'toastr'];
        
        function logger($log, toastr) {
            var service = {
                showToasts: true,
                error: error,
                info: info,
                warning: warning,
                success: success,
                
                log: $log.log
            };
            
            return service;
            
            //FUNCTIONS
            
            function error(message, data, title) {
                $log.error('Error: ' + message, data);
                toastr.error(message, title);
            }
            function info(message, data, title) {
                $log.info('Info: ' + message, data);
                toastr.info(message, title);
            }
            function warning(message, data, title) {
                $log.warn('Warning: ' + message, data);
                toastr.warning(message, title);
            }
            function success(message, data, title) {
                $log.info('Success: ' + message, data);
                toastr.success(message, title);
            }
        }

})();