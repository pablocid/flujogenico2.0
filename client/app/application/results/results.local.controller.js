'use strict';

angular.module('flujogenico20App')
    .controller('resultsLocalController', function ($scope,DataSession) {
    var self = this;
    //self.species = ['brassica_napus','brassica_rapa','brassica_cretica','brassica_oleracea', 'brassica_carinata', 'brassica_juncea', 'brassica_oleracea_capitata'];//['agrostis_capillaris', 'agrostis_leptotricha', 'agrostis_magellanica','brassica_napus'];
    //self.species =['zea_mais_rugosa'];

/*    if(DataSession.results && DataSession.results.length){
      console.log('ok');
      self.species =DataSession.underscoreResults();
    }
    $scope.DS= DataSession;
    $scope.results = $scope.DS.results;
    */

    self.species =DataSession.underscoreResults;

    /*self.species = ['agrostis_arvensis',
      'agrostis_meyenii',
      'agrostis_capillaris',
      'agrostis_nebulosa',
      'agrostis_stolonifera',
      'agrostis_stolonifera',
      'agrostis_tenuis',
      'agrostis_gigantea',
      'agrostis_mertensii',
      'agrostis_serranoi',
      'agrostis_exasperata',
      'agrostis_serranoi',
      'agrostis_brachyathera',
      'agrostis_breviculmis',
      'agrostis_castellana',
      'agrostis_serranoi',
      'agrostis_glabra_glabra',
      'agrostis_glabra_melanthes',
      'agrostis_imberbis',
      'agrostis_inconspicua',
      'agrostis_kuntzei',
      'agrostis_masafuerana',
      'agrostis_leptotricha',
      'agrostis_tolucensis',
      'agrostis_scabra',
      'agrostis_magellanica',
      'agrostis_mertensii',
      'agrostis_meyenii',
      'agrostis_stolonifera',
      'agrostis_perennans',
      'agrostis_philippiana',
      'agrostis_umbellata',
      'agrostis_uliginosa',
      'agrostis_vidalii'];*/

    /*
    DataSession.results.forEach(function (a) {
      console.log(a);
    });

     self.selectionInfo = function(a){
     self.showSelection = a;
     };
     $interval( function(){
     console.log(self.showSelection);
     }, 500);
     */

  });
