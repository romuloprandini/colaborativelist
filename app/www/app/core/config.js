(function() {
    'use strict';

    var databaseSettings = {
        url: 'http://ec2-54-165-112-168.compute-1.amazonaws.com',
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
        onReplicateStart: 'data.onReplicateStart',
        onReplicateComplete: 'data.onReplicateComplete',
        onSyncronizeStart: 'data.onSyncronizeStart',
        onSyncronizeStop: 'data.onSyncronizeStop',
        onDataChanged: 'data.onDataChanged',
        onDatabaseConfigurated: 'data.configurationComplete'
    }
    
    var config = {
        url: 'http://ec2-54-165-112-168.compute-1.amazonaws.com',
        events: events,
        imageSettings: imageSettings,
        version: '1.0.0',
        guestName: 'guest',
        database: databaseSettings
    }
    
    angular
        .module('colaborativelist.core')
        .constant('config', config)
        .config(configure)
        .factory('configureService', configureService);
        
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
            routeCfg.config.resolve = 'list';
        }
    }
  
  configureService.$inject = ['$state', '$rootScope', 'common', 'database', 'userData', 'listData', 'productData'];
  function configureService($state, $rootScope, common, database, userData, listData, productData) {
    
    return {
      configure: function() {
        console.log('entrou configureService');  
        var defered = common.$q.defer();
        var interval = setInterval(function(){ 
            if(translation.LANGUAGE !== undefined) {
            console.log('configureService - pegou o idioma');
            defered.resolve(true);
            clearInterval(interval);
            }
        }, 100);
        var promiseLanguage = defered.promise;
        
        return common.$q.all([
            promiseLanguage, 
            userData.ready().then(function(data) { console.log('entrou userData'); return true; }), 
            listData.ready().then(function(data) { console.log('entrou listData'); return true; }),
            productData.ready().then(function(data) { console.log('entrou productData'); return true; })
            ])
        .then(function (promisses) {
            console.log('configureService - completou as configurações');
            if(navigator.splashscreen) {
                navigator.splashscreen.hide();
            }
            return true;
        });
      }
    }
  }

})();