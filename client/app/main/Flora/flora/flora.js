'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.flora', {
        url: '/flora-vascular-chilena',
        abstract:true,
        templateUrl: 'app/main/Flora/flora/flora.html',
        controller: 'FloraCtrl',
        controllerAs:'floraCtrl'
      })
      .state('main.flora.spsearch',{
        url: '/search',//'/search'
        views:{
          mainflora:{
            templateUrl: 'app/main/Flora/flora/spSearch/spSearch.html',
            controller: 'FloraSpsearchCtrl',
            controllerAs:'fspSCtrl'
          }
        }
      })
      .state('main.flora.tables',{
        url: '',//'/search'
        views:{
          mainflora:{
            templateUrl: 'app/main/Flora/flora/tables/tables.html',
            controller: 'FloraTablesCtrl',
            controllerAs:'ftSCtrl'
          }
        }
      });
  });
