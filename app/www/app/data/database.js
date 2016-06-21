(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('database', database);
    
    database.$inject = ['$rootScope', 'config', 'common'];
    
    function database($rootScope, config, common) { 
        var database = this;
        
        init();
                
        return database.services;
                
        //FUNCTIONS
        
        function init() {
          database.filter = 'filter/by_user';
          database.remoteDB = new PouchDB(config.database.url+':'+config.database.port+'/'+config.database.name, {skipSetup: true} );
          database.localDB = new PouchDB(config.database.name);
          database.sync;
          database.services = {
            configure: configure,
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
          }
        }
                
        function configure() {
            return database.localDB.get('version').then(function(doc) {
                if(doc.value <= config.version)
                {
                    return doc;
                }
                return getConfigurations(doc);
            }).catch(function(err) {
                return getConfigurations();
            });
            
            function getConfigurations(version) {
                var ddocs = [
                {
                    _id: '_design/view_list',
                    views: {
                        by_user: {
                            map: function (doc) { 
                                if(doc.name.indexOf("_design") == -1) {
                                    if(doc.userList) {
                                        doc.userList.forEach(function(user) {
                                            emit(user.name, doc.name.toLowerCase());
                                        }); 
                                    }
                                }
                                }.toString(),
                            reduce: '_count'
                        }
                    }
                },
                {
                    _id: '_design/view_product',
                    views: {
                        by_list_id: {
                            map: function (doc) {
                                if (doc.productList) {
                                    var listProductName = [];
                                    doc.productList.forEach(function (product) {
                                        listProductName.push(product.name.toLowerCase());
                                    });
                                    emit(doc._id, listProductName);
                                }

                            }.toString(),
                            reduce: '_count'
                        }
                    }
                },
                {
                _id: '_design/filter',
                filters: {
                    by_user: function(doc, req) {  var isvalid = false; if(doc.userList) {doc.userList.forEach(function(user) { if(user.name == req.query.user) {isvalid = true; return; } }); } return isvalid }.toString()
                }
                }];

                var keys = [];
                ddocs.forEach(function(ddoc) {
                    keys.push(ddoc._id);
                });

                return database.localDB.allDocs({ keys: keys })
                    .then(function (docs) {
                        angular.forEach(docs.rows, function (row) {
                            var index = keys.indexOf(row.id);
                            if (index > -1) {
                                ddocs[index]._rev = row.value.rev;
                            }
                        });
                        return database.localDB.bulkDocs(ddocs);
                    })
                    .then(function (docs) {
                        var newVersion = { _id: 'version', value: config.version };
                        if(version !== undefined) {
                            newVersion._rev = version._rev;
                        }
                        return database.localDB.put(newVersion)
                            .then(function (doc) {
                                return doc;
                            });
                    });
            }
        }
        
        function replicate(userName) {
            //Verify if remote database exists
            database.remoteDB.info().then(function(info){
                var replicate = PouchDB.replicate(database.remoteDB._db_name, database.localDB._db_name, {filter: database.filter, query_params: {'user' : userName}});
                replicate.on('complete', function (info) {
                    common.$broadcast(config.events.onReplicateComplete, info);
                });

            });            
        }

        function syncronize(userName, cancel) {
            if(cancel && database.sync !== undefined) {
                database.sync.cancel();
                database.sync = null;
                common.$broadcast(config.events.onSyncronizeStop);
                return;
            }
            
            //Verify if remote database exists
            database.remoteDB.info().then(function(info){
                database.sync = database.localDB.sync(database.remoteDB, {live: true, retry: true, filter: database.filter, query_params: {'user' : userName}}); 
                //onChangeCallback();

                database.sync.on('change', function (info) {
                    if(onChangeCallback !== undefined && info.direction == 'pull') {
                        $rootScope.$broadcast(config.events.onDataChanged, info);
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
    	    return common.$q.when(database.localDB.allDocs(options));
        }

        function get(key) {
            return common.$q.when(database.localDB.get(key));
        }

        function filter(index, options) {
            if(options === undefined || options == null) {
                options = {};
            }

            if(!options.reduce) {
                options.reduce = false;
            }
            return common.$q.when(database.localDB.query(index, options));
        }
        
        function save(data) {
            if(data._id === undefined || data._id === 0) {
                return common.$q.when(database.localDB.post(data));
            } else {
                return database.localDB.get(data._id).then(function(doc){
                   data._rev = doc._rev;
                   return common.$q.when(database.localDB.put(data)); 
                });
            }
        }

        function saveAll(datas) {
            return common.$q.when(database.localDB.bulkDocs(datas));
        }
        
        function remove(key) {
            var promisse = database.localDB.get(key).then(function (doc) {
                doc._deleted = true;
                return database.localDB.put(doc,doc._id, doc._rev);
            });

            return common.$q.when(promisse);
        }
        
        function getLocalDB() {
            return database.localDB;
        }
        
        function getRemoteDB() {
            return database.remoteDB;
        }
    }
})();