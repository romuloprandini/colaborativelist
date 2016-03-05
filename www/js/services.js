var myModule = angular.module('carrinhofacil.services', [])
.service('TranslationService', ['$resource', function($resource) {  
    this.getTranslation = function($scope, language) {
        var languageFilePath = 'js/translations/translation_' + language + '.json';
        $resource(languageFilePath).get(function (data) {
            $scope.translation = data;
        });
    };
}])
//dados local se ainda não existir
.factory('DatabaseService', ['$q', '$timeout', function($q, $timeout) {

    return function() {
        
        var database_version = 1,
        db = new PouchDB('list'),
        remote_db = new PouchDB('http://localhost:5984/list', {skipSetup: true} ),
        db_configuration = PouchDB('configuration'),
        sync;

        return {
            configure: configure,
            login: login,
            logout: logout,
            syncronize: syncronize,
            getUser: getUser,

            list: list,
            get: get,
            filter: filter,
            save: save,
            remove: remove,
            saveAll: saveAll
        }

        function setConfigurations() {
            var ddocs = [
            {
                _id: '_design/view_list',
                views: {
                    by_user: {
                        map: function (doc) { if(doc.name.indexOf('_design') == -1) emit(doc.user, doc.name.toLowerCase()) }.toString(),
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
                  by_user: function(doc, req) { return (doc.user == req.query.user) }.toString()
               }
            }];

            var keys = [];
            ddocs.forEach(function(ddoc) {
                keys.push(ddoc._id);
            });

            return db.allDocs({ keys: keys }).then(function (docs) {
                angular.forEach(docs.rows, function (row) {
                    var index = keys.indexOf(row.id);
                    if (index > -1) {
                        ddocs[index]._rev = row.value.rev;
                    }
                });
                return db.bulkDocs(ddocs);
            }).then(function (docs) {
                return db_configuration.put({ _id: 'version', value: database_version }).then(function (doc) {
                    return true;
                });
            });
        }


        function configure() {
            return db_configuration.get('version').then(function(doc) {
                if(doc.value <= database_version)
                {
                    return true;
                }
                return setConfigurations();
            }).catch(function(err) {
                return setConfigurations();
            });
        }

        function getUser() {
            if(remote_db !== undefined) {
                return remote_db.getSession().then(function(response) {
                    if(!response.userCtx.name) {
                        return false;
                    }
                    return remote_db.getUser(response.userCtx.name).then(function(response) {
                       return response; 
                    })
                });
            }
            return $q.reject({'name': 'cannot_retrieve', 'message': 'Cannot retrieve user data.'});
        }

        function login(username, password) {
            return remote_db.login(username, password).then(function (login) {
                return login;
            });
        }

        function logout() {
            if(sync === undefined) {
                return $q.defer();
            }
            return remote_db.logout(function (err, response) {
                if (err) {
                    throw err;
                }
                return true;
            });
        }

        function syncronize(user, onChangeCallback) {
            if(onChangeCallback == 'cancel' && sync !== undefined) {
                sync.cancel();
                sync = null;
                return;
            }

            //Verify if remote database exists
            remote_db.info().then(function(info){
                console.log('database info', info);
                sync = db.sync(remote_db, {live: true, retry: true, filter: 'filter/by_user', query_params: {'user' : user}});
                onChangeCallback();

                db.changes({
                  live: true,
                  include_docs: true}).then(function(changes) {
                    console.log('changes', changes);
                });

                sync.on('change', function (info) {
                    if(onChangeCallback !== undefined && info.direction == 'pull') {
                        onChangeCallback(info);
                    }
                  console.log('On change: ', info);
                }).on('paused', function () {
                  console.log('pausou ');
                }).on('active', function () {
                  console.log('voltou online');
                }).on('denied', function (info) {
                  console.log('On denied: ', info);
                }).on('complete', function (info) {
                  console.log('On cancel sync: ', info);
                }).on('error', function (err) {
                  console.log('On error: ', err);
                });

            }).catch(function(err){
                console.log('database error', err);
                $timeout(function() {
                    syncronize(onChangeCallback);
                }, 60000);
            });
        }

        function list(keys, options) {
            if(options === undefined || options == null) {
                options = {};
            }
    	    return $q.when(db.allDocs(options));
        }

        function get(key) {
            return $q.when(db.get(key));
        }

        function filter(index, options) {
            if(options === undefined || options == null) {
                options = {};
            }

            if(!options.reduce) {
                options.reduce = false;
            }
            return $q.when(db.query(index, options));
        }
        
        function save(data) {
            if(data._id == undefined || data._id == 0) {
                return $q.when(db.post(data));
            } else {
                return $q.when(db.put(data));
            }
        }

        function saveAll(datas) {
            return $q.when(db.bulkDocs(datas));
        }
        
        function remove(key) {
            var promisse = db.get(key).then(function (doc) {
                if (doc._id != key )
                    throw Error({'name' : 'none_found', 'message': 'No record found!'});
                doc._deleted = true;
                return db.put(doc,doc._id, doc._rev);
            });

            return $q.when(promisse);
        }
    }
}])

.factory('MeasureService', function() {

    return function() {
        var measureCollection = [{id:'U', name:'Unidades'},
            {id:'Ml', name:'Mililítros'},
            {id:'L', name:'Litros'},
            {id:'G', name:'Gramas'},
            {id:'Kg', name:'Kilogramas'}];

        function get(id) {
            var measure;
            angular.forEach(measureCollection, function(value, index){
                if(value.id == id){
                    measure = value;
                    return;
                }
            });
            return measure;
        }

        function all() {
            return measureCollection;
        }

        return {
            get: get,
            all: all
        }

    };
})

.factory('ListService', ['$q', '$timeout', function ($q, $timeout) {
        
        return function (user, db) {       

        function setList(id, name, totalProducts, user) {
            return {
                '_id': id,
                'name': name,
                'totalProducts': totalProducts,
                'user': user
            };
        }
        
        function get(key) {
            return db.get(key).then(function (doc) {
                return setList(doc._id, doc.name, doc.productList.length, doc.user);
            });
        }

        function list() {
            var listCollection = [],
            options = {include_docs : true, keys: ['guest']};
            if(user != "guest") {
                options.keys.push(user);
            }
            return db.filter('view_list/by_user', options).then(function (doc) {
                angular.forEach(doc.rows, function (row) {
                    if(row.key == 'guest' || row.key == user){
                        listCollection.push(setList(row.doc._id, row.doc.name, row.doc.productList.length, row.doc.user));
                    }
                });

                return listCollection;
            });
        }
        
        function save(newList) {
            if(newList === undefined) {
                return $q.reject({'name': 'invalid_list', 'message': 'Inválid List!'});
            }
            if(newList.name === undefined || newList.name.trim() == '') {
                return $q.reject({'name': 'list_name', 'message' : 'Inform the list name!'});
            }

            var options = {key : newList.user, reduce : false};
            return db.filter('view_list/by_user', options).then(function (list) {
                    var exists = false;
                if (list.rows.length > 0) {
                    angular.forEach(list.rows, function(list) {
                        if(list.id != newList._id && list.value == newList.name.toLowerCase()) {
                            exists = true;
                            return;
                        }
                    });
                    if(exists) {
                        return $q.reject({'name': 'duplicated_list', 'message': 'Already have a list with this name!'});
                    }
                }

                var obj = {
                    _id: newList._id,
                    name: newList.name,
                    user: newList.user,
                    productList: []
                };

                //Update
                if (obj._id != undefined && obj._id != 0) {
                    return db.get(obj._id).then(function (doc) {
                        obj._rev = doc._rev;
                        obj.productList = doc.productList;
                        return db.save(obj).then(function (doc) {
                            return setList(doc.id, obj.name, obj.productList.length, obj.user);
                        });
                    });
                //Insert
                } else {
                    return db.save(obj).then(function (doc) {
                        return setList(obj._id, obj.name, 0, obj.user);
                    });
                }
            });
        }

        function remove(key) {
            if (key === undefined || key.trim() == '') {
                return $q.reject({'name': 'inform_list_id', 'message': 'Informe the list id!'});
            }
            return db.remove(key).then(function (doc) {
                return doc.ok;
            });
        }
        return {
            get: get,
            list: list,
            save: save,
            remove: remove
        };
    }
}])

.factory('ProductService', ['$q', '$filter', '$timeout', function ($q, $filter, $timeout) {
    return function (list_id, db) {   

        if (list_id === undefined || list_id == 0) {
            throw Error({'name': 'invalid_list', 'message': 'Inválid List!'});
        }

        function setProduct(id, name, price, unit, amount, measure, checked) {

            //Instancia um novo objeto
            return {
                _id: id,
                name: name,
                price: price,
                unit: unit,
                amount: amount,
                measure: measure,
                checked: checked
            };
        }

        function get(name) {
            return db.get(list_id).then(function (doc) {
                var product;
                doc.rows[0].productList.forEach(function (product, index) {
                    if (product.name == name) {
                        product = setProduct(index, doc.name, doc.price, doc.unit, doc.amount, doc.measure, doc.checked);
                        return;
                    }
                });
                return product;
            });
        }

        function list() {
            var productList = [],
            options = {key : list_id, include_docs : true};
            return db.filter('view_product/by_list_id', options).then(function (docs) {
                if(docs.rows.length > 0) {
                    docs.rows[0].doc.productList.forEach(function (product, index) {
                        productList.push(setProduct(index, product.name, product.price, product.unit, product.amount, product.measure, product.checked));
                    });
                }
                return productList;
            });
        }
        
        function save(newProduct) {
            
            if(newProduct === undefined) {
                throw Error({'name': 'invalid_product', 'message': 'Inválid product!'});
            } else if (newProduct.name === undefined) {
                throw Error({'name': 'inform_product', 'message': 'Informe the product name!'});
            } else {

                var options = {key : list_id}
                return db.filter('view_product/by_list_id', options).then(function (list) {
                    if (list.rows.length > 0 && newProduct.name != newProduct.oldName){
                        var exists = false;
                         angular.forEach(list.rows[0].value, function(product) {
                            if(product == newProduct.name.toLowerCase()) {
                                exists = true;
                                return;
                            }
                        });
                        if(exists) {
                            return $q.reject({'name': 'duplicated_product', 'message': 'Already have a product with this name!'});
                        }
                    }

                    var obj = {
                        name: newProduct.name,
                        price: newProduct.price,
                        unit: newProduct.unit,
                        amount: newProduct.amount,
                        measure: newProduct.measure,
                        checked: newProduct.checked
                    };

                    //Busca a lista inteira
                    return db.get(list_id).then(function (doc) {
                        var index;
                        doc.productList.forEach(function (product, i) {
                            if (product.name == newProduct.oldName) {
                                index = i;
                                return;
                            }
                        });
                        if(index == undefined) {
                            doc.productList.push(obj);
                        } else {
                            doc.productList[index] = obj;
                        }

                        return db.save(doc).then(function (doc) {
                            return setProduct(newProduct._id, obj.name, obj.price, obj.unit, obj.amount, obj.measure, obj.checked);
                        });
                    });
                });
            }
        }

        function remove(name) {
            if (name === undefined || name.trim() == '') {
                return $q.reject({'name': 'inform_product_id', 'message': 'Informe the product id!'});
            }
            return db.get(list_id).then(function (doc) {
                var index,
                productList = doc.productList;
                productList.forEach(function (product, idx) {
                    if (product.name == name) {
                        index = idx;
                        return;
                    }
                });
                doc.productList.splice(index, 1);
                return db.save(doc).then(function (doc) {
                    return doc.ok;
                });
            });
        }

        return {
            get: get,
            list: list,
            save: save,
            remove: remove
        }
    }
}]);
