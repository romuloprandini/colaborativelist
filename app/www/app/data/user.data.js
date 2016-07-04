(function() {
    'use strict';
    
    angular
        .module('colaborativelist.data')
        .factory('userData', userData);
    
    userData.$inject = ['$rootScope', '$http', 'config', 'common', 'database'];
                
    function userData($rootScope, $http, config, common, database) {
      var sv = this;
      init();
        
      return {
            get: getUser,
            set: setUser,
            login: login,
            logout: logout,
            create: createUser,
            search: searchUser,
            isGuest: isGuest
        };
        
      //FUNCTIONS
        
      function init() {
        sv.localUserDB = new PouchDB('user');
        sv.userDNS = config.url+'/colaborativelist/user.php';
        sv.user = getGuest();
        $rootScope.username = sv.user.name;
        
        database.createDesignDoc('filter', null, {
            by_user: function(doc, req) {  
                var isvalid = false; 
                if(doc.userList) {
                    doc.userList.forEach(function(user) { 
                        if(user.name == req.query.user) {
                            isvalid = true;
                            return; 
                        } 
                    }); 
                } 
                return isvalid;
            }.toString()
        }).then(function(doc) {
            console.log('Criou Design doc user', doc);
        });
    }
        
    function setUser(data) {
        if(data !== undefined) {
            return {
                _id: data._id,
                name: data.name,
                fullname: data.fullname,
                email: data.email,
                avatar: data.avatar
            }
        }
        return;
    }
        
    function getUserData(userName) {
        var request = $http({
            method: 'get',
            url: sv.userDNS+'?username='+userName,
            responseType: 'json'
        });
        
        return request
            .then(onSuccess)
            .catch(onError);
        
        function onSuccess(response) {
            if(response.data !== undefined && response.data.ok) {
                return setUser(response.data.user);
            } else if(response.data !== undefined && response.data.error !== undefined) {
                return throwError(translation.FIND_LOGIN_USER_ERROR, response.data.error);
            }
            return throwError(translation.FIND_LOGIN_USER_ERROR);
        }
        
        function onError(message){
            return throwError(translation.FIND_LOGIN_USER_ERROR, message);
        }
    }
       
    function isGuest(name) {
        return (name === undefined || name == 'guest');
    }
    
    function getGuest() {
        return setUser({_id: 0, name: 'guest', fullname: '', email: '', avatar:''})
    }
        
    function getUser() {
        return common.$q.when(getUserInternal());
        
        function getUserInternal() {
        if(!isGuest(sv.user.name))
        {
            return common.$q.resolve(sv.user);
        }

        if(navigator.onLine) {
            return database.getRemoteDB().getSession()
            .then(function(doc) {
                if(doc.ok && doc.userCtx.name !== null) {
                    return getUserData(doc.userCtx.name)
                        .then(function(user) {
                        sv.user = setUser(user);
                        $rootScope.username = user.name;
                        database.syncronize({filter: 'filter/by_user', query_params: {'user' : user.name}});
                        common.$broadcast(config.events.onLogin, sv.user);
                        return sv.user;
                        });
                }
                return getUserStored().then(function(user) {
                    if(user.username !== '' && user.password !== '') {
                        return login(user.username, user.password);
                    }
                    return getGuest();
                });
            })
            .catch(function(err) {
                return getGuest();
            });
        }

        return getGuest();
        }
    }
        
    function getUserStored() {
        return sv.localUserDB.get('user')
            .then(onSuccess)
            .catch(onError);
            
        function onSuccess(doc) {
            return doc;
        }
                        
        function onError(err) {
            if(err.name !== 'not_found') {
            setUserStored('','');
            }
        }
    }
        
    function setUserStored(username, password) {
        var userData = {'_id':'user', 'username': username, 'password': password};
        return sv.localUserDB.get('user')
            .then(onSuccess)
            .catch(onError);
        
        function onSuccess(doc) {
            userData._rev= doc._rev;
            return saveUserLocal(userData);
        }
            
        function onError(err) {
            if(err.name == 'not_found') {
                return saveUserLocal(userData);
            }
            return false;
        }
        
        function saveUserLocal(user) {
            return sv.localUserDB.put(user)
                .then(onSuccess)
                .catch(onError);
                
        function onSuccess(doc) {
                return true;
            }
            
            function onError(err) {
                return false;
            }
        }
    }

    function login(username, password) {
        if((username === undefined || username === '') && (password === undefined || password === '')) {
            return throwError(translation.FIELDS_REQUIRED);
        } else if(username === undefined || username === '') {
            return throwError(translation.USERNAME_REQUIRED);
        } else if(password === undefined || password === '') {
            return throwError(translation.PASSWORD_REQUIRED);
        }
        return common.$q.when(
            database.getRemoteDB().login(username, password)
            .then(function (login) {
                return setUserStored(username, password)
                    .then(function(ok) {
                        if(ok) {
                            return getUserData(username).then(function(user) {
                                sv.user = setUser(user);
                                $rootScope.username = user.name;
                                database.syncronize({filter: 'filter/by_user', query_params: {'user' : user.name}});
                                common.$broadcast(config.events.onLogin, sv.user);
                                return sv.user;  
                            });
                        }
                        return throwError(translation.FIND_LOGIN_USER_ERROR, err);
                    });
                })
            .catch(function(err) {
                var message = translation.FIND_LOGIN_USER_ERROR; 
                if(err.name == 'unauthorized') {
                    message = translation.INVALID_USERNAME_PASSWORD;
                }
                return throwError(message, err);
            })
        );
    }

    function logout() {
        return common.$q.when(database.getRemoteDB().logout()
            .then(function(){
                return setUserStored('','').then(function(doc) {
                    sv.user = getGuest();
                    $rootScope.username = sv.user.name;
                    database.syncronize(null, true);
                    common.$broadcast(config.events.onLogout, sv.user);
                    return sv.user;
                });
            })
            .catch(function(err){
                return throwError(translation.LOGOUT_ERROR, err); 
            }));
    }
        
    function createUser(data) {
        if(data === undefined || data == null) {
            return throwError(translation.FIELDS_REQUIRED);
        }
        if(data.username === undefined || data.username == null || data.username.trim() === '') {
            return throwError(translation.USERNAME_REQUIRED);
        }
        if(data.password === undefined || data.password == null || data.password.trim() === '') {
            return throwError(translation.PASSWORD_REQUIRED);
        }
        if(data.fullName === undefined || data.fullName == null || data.fullName.trim() === '') {
            return throwError(translation.FULLNAME_REQUIRED);
        }
        if(data.email === undefined || data.email == null || data.email.trim() === '') {
            return throwError(translation.EMAIL_REQUIRED);
        }
        var validEmail = /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(!validEmail.test(data.email)) {
            return throwError(translation.EMAIL_MALFORMED);
        }
                    
        var request = $http({
            method: 'post',
            url: sv.userDNS,
            responseType: 'json',
            data: {
                username: data.username,
                password: data.password,
                fullname: data.fullName,
                email: data.email,
                avatar: data.avatar
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        return request
            .then(onSuccess)/*
            .catch(onError)*/;
        
        function onSuccess(response) {
            if(response.data !== undefined && response.data.ok) {
                return setUser(response.data.user)
            } else if(response.data !== undefined && response.data.error !== undefined) {
                if(response.data.error.name == 'useralreadyexists') {
                    return throwError(translation.USER_ALREADY_EXISTS_ERROR, response.data.error);
                }
                return throwError(translation.SIGNUP_ERROR, response.data.error);
            }
            
            return throwError(translation.SIGNUP_ERROR);                
        }
        /*
        function onError(err){
            return common.$q.reject(translation.SIGNUP_ERROR, err);
        }*/
    }
        
    function searchUser(search) {
        var request = $http({
            method: 'get',
            url: sv.userDNS+'?search='+search,
            responseType: 'json'
        });
        
        return request
            .then(onSuccess);
        
        function onSuccess(response) {
            if(response.data !== undefined && response.data.ok) {
                return response.data.userlist;
            } else if(response.data !== undefined && response.data.error !== undefined) {
                if(response.data.error.name == 'notfound') {
                    return [];
                }
            }
            return throwError(translation.FIND_LOGIN_USER_ERROR, response.data.error);                
        }
    }
        
    function throwError(message, cause) {
        common.exception.catcher(message)(cause);
        return common.$q.reject(new Error(message));
    }
    }
})();