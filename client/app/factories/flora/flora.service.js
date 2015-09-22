'use strict';

angular.module('flujogenico20App')
  .factory('Flora', function ($http,$q) {
    // Service logic
    // ...

    var meaningOfLife = 42;

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      },
      paginate:function(type,p, i){
        var deferred = $q.defer();
        $http.get('/api/flora/'+type+'/pagination/'+p+'/'+i)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.log('Error en FLora.paginate');
            console.error(msg,code);
          });
        return deferred.promise;
      },
      all:function(){
        var deferred = $q.defer();
        $http.get('/api/flora')
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.log('Error en FLora.all');
            console.error(msg,code);
          });
        return deferred.promise;
      },
      get:function(id3){
        var id =id3.id;
        var deferred = $q.defer();
        $http.get('/api/flora/'+id)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.error(msg,code);
          });
        return deferred.promise;

      },
      searchSN : function(name){
        var deferred = $q.defer();
        $http.get('/api/flora/search/'+name)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.error(msg,code);
          });
        return deferred.promise;
      },
      getMatchSp : function(id,type){
        //console.log('Dentro de getmatchsp');
        var deferred = $q.defer();
        $http.get('/api/flora/match/'+id+'/'+type)
          .success(function(data){
            deferred.resolve(data);
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.error(msg,code);
          });
        return deferred.promise;
      }
    };
  });
