'use strict';
//TODO agregar id dinamico al mapa
angular.module('flujogenico20App')
  .directive('distMap', function () {
    return {
      //templateUrl: 'app/directives/distMap/distMap.html',
      template:'<div id="map"></div>',
      restrict: 'EA',
      scope:{
        dmWidth:'@dmWidth',
        dmHeight:'@dmHeight',
        species:'=species',
        rpi:'&',
        selection:'&'
      },
      link: function (scope, element) {
        var map, species;
        //var num = "distribution-map-"+Math.floor((Math.random() * 10000) + 1);
        var width = scope.dmWidth || '100%';
        var height = scope.dmHeight || '450px';

         map = new window.DMap({
         container: 'map',
         host: 'http://servidor-modelos.cswlabs.cl'  // donde se encuentran los modelos
         });


        element.find('#map').css('height',height);
        element.find('#map').css('width',width);

        species = scope.species;

        function latitud(geojson){
          //console.log(geojson);
          var boundingBox = window.Turf(geojson);
          //console.log(boundingBox);
          return (boundingBox[1]+boundingBox[3])/2;
        }
        //18-19	20-24	25-29	30-34	35-39	40-44	45-49	50-54	55-56
        //0.249	0.271	0.375	1	0.543	0.216	0.097	0.052	0.0037
        var ripValues = function(lat){
          var lat = lat *-1;
          if(lat>=18 && lat <20){ return 0.249*100}
          if(lat>=20 && lat <25){ return 0.271*100}
          if(lat>=25 && lat <30){ return 0.375*100}
          if(lat>=30 && lat <35){ return 1*100}
          if(lat>=35 && lat <40){ return 0.543*100}
          if(lat>=40 && lat <45){ return 0.216*100}
          if(lat>=45 && lat <50){ return 0.097*100}
          if(lat>=50 && lat <55){ return 0.052*100}
          if(lat>=55 ){ return 0.0037*100}
          return 0;
        }

         map.on('selectionChange', function(e) {
           scope.selection({sp:e});
           console.log("latitud(e.geom)")
           var index = ripValues(latitud(e.geom))
           console.log(latitud(e.geom));
           console.log(ripValues(latitud(e.geom)));
           scope.rpi({i:index});
           scope.$apply();
           //console.log(new Date(), e.species);
         });

         map.setSpecies(species);
         map.show('max');
      }
    };
  });
