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
        selection:'='
      },
      link: function (scope, element) {
        var map, species;
        //var num = "distribution-map-"+Math.floor((Math.random() * 10000) + 1);
        var width = scope.dmWidth || '100%';
        var height = scope.dmHeight || '350px';

         map = new window.DMap({
         container: 'map',
         host: 'http://flujogenico.cswlabs.cl'  // donde se encuentran los modelos
         });

        element.find('#map').css('height',height);
        element.find('#map').css('width',width);

        species = scope.species;

        function latitud(geojson){
          console.log(geojson)
          var boundingBox = window.Turf(geojson);
          console.log(boundingBox);
          return (boundingBox[1]+boundingBox[3])/2;
        }

         map.on('selectionChange', function(e) {
           scope.selection = e.species;
           scope.$apply();
           console.log(latitud(e.geom));
           //console.log(new Date(), e.species);
         });

         map.setSpecies(species);
         map.show('max');
      }
    };
  });
