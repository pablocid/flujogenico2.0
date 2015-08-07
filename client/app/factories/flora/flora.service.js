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
      }
    };
  });
