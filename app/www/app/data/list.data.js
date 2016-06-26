(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('listData', listData);
    
    listData.$inject = ['common', 'config', 'database'];
                
    function listData(common, config, database) { 
            var service = {
                get: getList,
                list: getAllList,
                save: saveList,
                remove: removeList,
                share: shareList,
                sync: syncList
            }
            
        return service;
        
        //FUNCTIONS

        function setListData(data, username) {
            var listReturn;
            if(data !== undefined) {
                listReturn = {
                    _id: data._id,
                    name: data.name,
                    userList: data.userList,
                    isGuest: false,
                    canSync: false,
                    canEdit: true
                };
                if(data.productList !== undefined) {
                    listReturn.productList = data.productList;
                } else {
                    listReturn.productList = [];
                }
                if(data.userList.length == 1 && data.userList[0].name == config.guestName) {
                    listReturn.isGuest = true;
                }
                if(listReturn.isGuest && username != config.guestName) {
                    listReturn.canSync = true;
                }
                data.userList.forEach(function(user) {
                    if(user.name == username && user.permission == 'read') {
                        listReturn.canEdit = false;
                        return;
                    }
                })
            }
            return listReturn;
        }
        
        function getList(key, username) {
            return database.get(key)
                .then(onSuccess)
                .catch(onError);
            
            function onSuccess(doc) {
                return setListData(doc, username);
            }
            
            function onError(err) {
                    var message = translation.GET_LIST_ERROR;
                    if(err.name == '') {
                        message = translation.ERROR;
                    }
                    throwError(message, err);
                }
        }

        function getAllList(username) {
            var options = {
                include_docs : true, 
                keys: [config.guestName], 
                reduce:false
            };
            if(username != config.guestName) {
                options.keys.push(username);
            }
            return database.filter('view_list/by_user', options)
                .then(onSuccess)
                .catch(onError);
            
            function onSuccess(doc) {
                var listCollection = [];
                angular.forEach(doc.rows, function (row) {
                    if(row.key == config.guestName || row.key == username) {
                        listCollection.push(setListData(row.doc, username));
                    }
                });
                
                return listCollection;
            }
            
            function onError(err) {
                    var message = translation.GET_ALL_LIST_ERROR;
                    if(err.name == '') {
                        message = translation.ERROR;
                    }
                    throwError(message, err);
                }
        }
        
        function saveList(list, username) {
            if(list === undefined) {
                throwError(translation.LIST_NAME_REQUIRED);
            }
            if(list.name === undefined || list.name.trim() == '') {
                throwError(translation.LIST_NAME_REQUIRED);
            }
            
            return save(list);
            
            function save(list) {
                
                if(list._id !== undefined && list._id != 0) {
                    return getList(list._id).then(function(data){
                        data.name = list.name;
                        data.productList = list.productList;
                        data.userList = list.userList;
                        return database.save(data)
                            .then(onSuccess)
                            .catch(onError);
                    });
                } else {
                    var newList = {
                        name: list.name,
                        userList: [{name: username, permission: 'edit'}],
                        productList: []
                    }
                    
                    list = setListData(newList, username);
                    
                    return database.save(newList)
                        .then(onSuccess)
                        .catch(onError);
                }
                
                function onSuccess(doc) {
                    list._id = doc.id;
                    return list;                    
                }
                
                function onError(err) {
                    var message = translation.SAVE_LIST_ERROR;
                    if(err.name == '') {
                        message = translation.ERROR;
                    }
                    throwError(message);
                }
            }
        }

        function removeList(key, username) {
            if (key === undefined || key.trim() == '') {
                throwError(translation.LIST_ID_REQUIRED);
            }
            
            return getList(key).then(function(list) {
               if(list.userList.length < 2) {
                    return database.remove(key).then(function (doc) {
                        return doc.ok;
                    });
                } else {
                    var userIndex = -1;
                    list.userList.forEach(function(user, index){
                       if(user.name == username) {
                           userIndex = index;
                           return;
                       } 
                    });
                    
                    list.userList.splice(userIndex,1);
                    
                    return database.save(list)
                        .then(onSuccess)
                        .catch(onError);
                    
                    function onSuccess(doc) {
                        return doc.ok;
                    }
                    
                    function onError(err) {
                        var message = translation.DELETE_LIST_ERROR.replace('LIST_NAME',list.name);
                        if(err.name == '') {
                            message = translation.ERROR;
                        }
                        throwError(message);
                    }
                } 
            });
        }
        
        function shareList(key, userList) {
            if (key === undefined || key.trim() == '') {
                throwError(translation.LIST_ID_REQUIRED);
            }
            if (userList === undefined || userList.constructor !== Array) {
                throwError(translation.LISTUSER_REQUIRED);
            }
            return getList(key).then(function (list) {
                list.userList = userList;
                return saveList(list).then(function (doc) {
                    return doc.ok;
                });
            });
        }
        
        function syncList(list, username) {
            list.userList = [{name: username, permission: 'edit'}];
            return getList(list._id).then(function(data){
                data.userList = list.userList;
                return database.save(data)
                    .then(onSuccess)
                    .catch(onError);
            });
            
                
            function onSuccess(doc) {
                list = setListData(list, username);
                return list;
            }
            
            function onError(err) {
                var message = translation.LIST_SYNC_ERROR;
                throwError(message, err);
            }
        }
    }
    
    function throwError(message, cause) {
        throw {message: message, cause: cause} ;
    }
})();