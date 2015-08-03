'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main/main.html',
        controller: 'MainCtrl',
        controllerAs:'mainCtrl'
      });
  });
