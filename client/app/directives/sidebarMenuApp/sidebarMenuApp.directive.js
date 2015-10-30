'use strict';

angular.module('flujogenico20App')
  .directive('sidebarMenuApp', function () {
    return {
      templateUrl: 'app/directives/sidebarMenuApp/sidebarMenuApp.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });