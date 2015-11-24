'use strict';

angular.module('flujogenico20App')
  .factory('Flora', function ($resource) {
    var FloraService = $resource('/api/flora/:id',
      {id: '@_id'},
      {
        searchSN:{
          method:'GET',
          url:'/api/flora/search/:name',
          isArray:true
        },
        getMatchSp:{
          method:'GET',
          url:'/api/flora/match/:id/:type',
          isArray:true
        },
        paginate:{
          method:'GET',
          url:'/api/flora/:type/pagination/:p/:i',
          isArray:false,
          transformResponse: function(data, header) {
            var wrapped = angular.fromJson(data);
            var flora =  wrapped.flora.map(function (a) {
              return new FloraService(a);
            });
            wrapped.flora = flora;
            return wrapped;
          }
        }
      }
    );

    FloraService.prototype.underscoreSp = function () {
      var genIndex = this.general.taxonomy.local.map(function(a){return a.id}).indexOf('gen');
      var spIndex = this.general.taxonomy.local.map(function(a){return a.id}).indexOf('sp');
      var varIndex = this.general.taxonomy.local.map(function(a){return a.id}).indexOf('var');
      var sppIndex = this.general.taxonomy.local.map(function(a){return a.id}).indexOf('spp');

      var undeSp ='';
      if(genIndex!==-1){undeSp += this.general.taxonomy.local[genIndex].name}
      if(spIndex!==-1){undeSp += '_'+this.general.taxonomy.local[spIndex].name}
      if(varIndex!==-1){undeSp += '_'+this.general.taxonomy.local[varIndex].name}
      if(sppIndex!==-1){undeSp += '_'+this.general.taxonomy.local[sppIndex].name}
      return undeSp;
    };
    return FloraService;
/*    return {
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
    };*/
  });
