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
        controllerAs:'mapCtrl'
      })
      .state('main.about',{
        url:'/about',
        templateUrl:'app/main/template.a1.html',
        controller: function ($scope) {
          $scope.hola = 'HOLA';
          $scope.theme='about';
          $scope.section = 'about';
          $scope.logo='question';
        }
      })
      .state('main.escala',{
        url:'/escala',
        templateUrl:'app/main/template.a1.html',
        controller: function ($scope) {
          $scope.theme='escala';
          $scope.section = 'escala';
          $scope.logo='escala';
        }
      })
      .state('main.settings',{
        url:'/settings',
        templateUrl:'app/main/template.a1.html',
        controller: function ($scope) {
          $scope.theme='settings';
          $scope.section = 'settings';
          $scope.logo='settings';
        }
      });
  });
