'use strict';

angular.module('flujogenico20App')
  .directive('menuBarPc', function () {
    return {
      templateUrl: 'app/directives/menuBarPc/menuBarPc.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });