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
      });
  });
