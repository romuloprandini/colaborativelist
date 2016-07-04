(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('database', database);
    
    database.$inject = ['$rootScope', 'config', 'common'];
    
    function database($rootScope, config, common) { 
        var sv = this;
        
        init();
                
        return {
            createDesignDoc: createDesignDoc,
            list: list,
            get: get,
            filter: filter,
            save: save,
            saveAll: saveAll,
            remove: remove,
            replicate: replicate,
            syncronize: syncronize,
            getLocalDB: getLocalDB,
            getRemoteDB: getRemoteDB
        };
                
        //FUNCTIONS
        
        function init() {
            //PouchDB.debug.enable('*');
            PouchDB.debug.disable();
          sv.remoteDB = new PouchDB(config.database.url+':'+config.database.port+'/'+config.database.name, {skipSetup: true} );
          sv.localDB = new PouchDB(config.database.name);
          sv.sync;
        }
        
        function createDesignDoc(name, views, filters) {
            var ddoc = {
                _id: '_design/' + name,
                language: 'javascript'
            };
            if(views) {
                ddoc.views = views;
            }
            if(filters) {
                ddoc.filters = filters;
            }
            return sv.localDB.get(ddoc._id).then(function(doc) {
                ddoc._rev = doc._rev;
                return sv.localDB.put(ddoc);
            }).catch(function(error) {
                if(error.name === 'not_found') {
                    return sv.localDB.put(ddoc);
                } else {
                    $q.reject(error);
                }
            });
        }
        
        function replicate(options) {
            //Verify if remote database exists
            return sv.remoteDB.info().then(function(info){
                console.log('Entrou replicate start');
                common.$broadcast(config.events.onReplicateStart, info);
                var replicate = PouchDB.replicate(sv.remoteDB._db_name, sv.localDB._db_name, options);
                replicate.on('complete', function (info) {
                console.log('Entrou replicate stop');
                    common.$broadcast(config.events.onReplicateComplete, info);
                });
                return {'ok': true};
            });            
        }

        function syncronize(options, cancel) {
            if(cancel && sv.sync !== undefined) {
                console.log('Entrou syncronize cancel');
                sv.sync.cancel();
                sv.sync = null;
                common.$broadcast(config.events.onSyncronizeStop);
                return;
            }
            
            sv.remoteDB.info().then(function(info){
                console.log('Entrou syncronize');
                common.$broadcast(config.events.onSyncronizeStart);
                options.live = true;
                options.retry = true;
                sv.sync = sv.localDB.sync(sv.remoteDB, options); 
                
                sv.sync.on('change', function (info) {
                console.log('Entrou syncronize change', info);
                    if(info.direction == 'pull') {
                        $rootScope.$broadcast(config.events.onDataChanged, info.change);
                    }
                });

            }).catch(function(err){
                //TODO - send a error message to the user? show some icon to alert that isn't connected
                common.$timeout(function() {
                    syncronize(user);
                }, 60000);
            });
        }

        function list(options) {
            if(options === undefined || options == null) {
                options = {};
            }
    	    return common.$q.when(sv.localDB.allDocs(options));
        }

        function get(key) {
            return common.$q.when(sv.localDB.get(key));
        }

        function filter(index, options) {
            if(options === undefined || options == null) {
                options = {};
            }

            if(!options.reduce) {
                options.reduce = false;
            }
            return common.$q.when(sv.localDB.query(index, options));
        }
        
        function save(data) {
            if(data._id === undefined || data._id === 0) {
                return common.$q.when(sv.localDB.post(data));
            } else {
                return sv.localDB.get(data._id).then(function(doc){
                   data._rev = doc._rev;
                   return common.$q.when(sv.localDB.put(data)); 
                });
            }
        }

        function saveAll(datas) {
            return common.$q.when(sv.localDB.bulkDocs(datas));
        }
        
        function remove(key) {
            var promisse = sv.localDB.get(key).then(function (doc) {
                doc._deleted = true;
                return sv.localDB.put(doc,doc._id, doc._rev);
            });

            return common.$q.when(promisse);
        }
        
        function getLocalDB() {
            return sv.localDB;
        }
        
        function getRemoteDB() {
            return sv.remoteDB;
        }
    }
})();