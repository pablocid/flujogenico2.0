'use strict';

angular.module('flujogenico20App')
    .controller('resultsLocalController', function (DataSession) {
    var self = this;
    self.species = ['brassica_napus','brassica_rapa','brassica_cretica','brassica_oleracea'];//['agrostis_capillaris', 'agrostis_leptotricha', 'agrostis_magellanica','brassica_napus'];

    DataSession.results.forEach(function (a) {
      console.log(a);
    });
    /*
     self.selectionInfo = function(a){
     self.showSelection = a;
     };
     $interval( function(){
     console.log(self.showSelection);
     }, 500);
     */

  });
