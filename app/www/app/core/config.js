(function() {
    'use strict';

    var databaseSettings = {
        url: 'http://ec2-52-90-241-128.compute-1.amazonaws.com',
        port: 5984,
        name: 'list'
        
    }
    var imageSettings = {
        defaultImage: 'content/img/avatar.png',
        imageSize: 150
    }
    
    var events = {
        onLogin: 'login.onLogin',
        onLogout: 'login.onLogout',
        onReplicateComplete: 'data.onReplicateComplete',
        onDataChanged: 'data.onDataChanged',
        onSyncronizeStop: 'data.onSyncronizeStop',
        onDatabaseConfigurated: 'data.configurationComplete'        
    }
    
    var config = {
        url: 'http://ec2-52-90-241-128.compute-1.amazonaws.com',
        events: events,
        imageSettings: imageSettings,
        version: '1.0.0',
        guestName: 'guest',
        database: databaseSettings
    }
    
    angular
        .module('colaborativelist.core')
        .constant('config', config)
        .config(configure);
        
    configure.$inject = ['$logProvider', '$stateProvider', '$urlRouterProvider', 'routehelperConfigProvider', 'toastr'];
    
    function configure($logProvider,  $stateProvider, $urlRouterProvider, routehelperConfigProvider, toastr) {
        
        configureToastr();
        configureLogging();
        configureRouting();
        
        function configureToastr() {
            toastr.options.timeOut = 5000;
            toastr.options.positionClass = 'toast-bottom-full-width';
            toastr.options.closeButton = true;
        }

        function configureLogging() {
            // turn debugging off/on (no info or warn)
            if ($logProvider.debugEnabled) {
                $logProvider.debugEnabled(true);
            }
        }

        function configureRouting() {
            var routeCfg = routehelperConfigProvider;
            routeCfg.config.$stateProvider = $stateProvider;
            routeCfg.config.$urlRouterProvider = $urlRouterProvider;
            routeCfg.config.docTitle = '';
            routeCfg.config.resolveAlways = { };
        }
    }

})();