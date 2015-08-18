'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        abstract:true,
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl',
        controllerAs:'mainCtrl'
      })
      .state('main.home', {
        url: '/',
        templateUrl: 'app/main/home/home.html',
        controller: 'HomeCtrl',
        controllerAs:'homeCtrl'
      })
      .state('map',{
        url:'/map',
        template:'<dist-map species="mapCtrl.species"></dist-map>',
        controller:function(){
          this.species = ['agrostis_capillaris', 'agrostis_leptotricha', 'agrostis_magellanica'];
        },
        controllerAs:"mapCtrl"
      });
  });
