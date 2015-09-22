'use strict';

angular.module('flujogenico20App')
  .factory('Pollinator', function ($http,$q) {

    var setCommingData = function (dat) {

      var obj = {
        _id:dat._id,
        general:{
          taxonomy:{
            local:[]
          }
        },
        properties:[]
      };

        for(var d in dat){
          switch(d){
            case 'orden':
                  obj.general.taxonomy.local.push({id:'ord',name:'orden '+dat[d],altName:dat[d],description:''});
                  break;
            case 'familia':
              obj.general.taxonomy.local.push({id:'fam',name:dat[d],altName:dat[d],description:''});
              break;
            case 'taxa':
              obj.name= dat[d];
              break;
            case 'endemismo':
              if(dat[d]===1){
                obj.properties.push({id:'en',name:'Endémico',altName:'Especie endémica',description:''});
              }
              break;
            case 'introducida':
              if(dat[d]===1){
                obj.properties.push({id:'in',name:'Introducida',altName:'Especie introducida',description:''});
              }
              break;
            case 'polilectica':
              if(dat[d]===1){
                obj.properties.push({id:'plt',name:'Poliléctico',altName:'Especie poliléctica',description:''});
              }
              break;
            case 'oligolectica':
              if(dat[d]===1){
                obj.properties.push({id:'ol',name:'Oligoléctico',altName:'Especie oligoléctica',description:''});
              }
              break;
          }
        }
        return obj;
    };

    return {
      paginate: function(p, i){
        var deferred = $q.defer();
        $http.get('/api/fauna/'+p+'/'+i)
          .success(function(data){
            var poli = data.pollinators.map(setCommingData);
            data.pollinators = poli;
            deferred.resolve(data);
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.log('Error en FLora.paginate');
            console.error(msg,code);
          });
        return deferred.promise;
      },
      searchSN : function(name){
        var deferred = $q.defer();
        $http.get('/api/fauna/search/'+name)
          .success(function(data){
            deferred.resolve(data.map(function(a){
              return {
                _id: a._id,
                name: a.taxa
              };
            }));
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.error(msg,code);
          });
        return deferred.promise;
      },
      get:function(id3){
        var id =id3.id;
        var deferred = $q.defer();
        $http.get('/api/fauna/'+id)
          .success(function(data){
            //console.log(data);
            deferred.resolve(setCommingData(data));
          })
          .error(function(msg,code){
            deferred.reject(msg);
            console.error(msg,code);
          });
        return deferred.promise;

      }
    };
  });

/*
{
  "_id" : ObjectId("54241fd591a2593e7272a898"),
  "idLink" : NumberInt(2),
  "orden" : "Coleoptera",
  "familia" : "Buprestidae",
  "subfamilia" : "",
  "tribu" : "",
  "genero" : "Byliaxia",
  "especie" : "concinna",
  "taxa" : "Byliaxia concinna",
  "endemismo" : NumberInt(1),
  "introducida" : NumberInt(0),
  "polilectica" : NumberInt(0),
  "oligolectica" : NumberInt(1),
  "dist" : [

],
  "flora" : [
  "53e0eec7eaf791fef2566014",
  "53e0eec7eaf791fef2565457"
]
}*/
