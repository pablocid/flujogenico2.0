'use strict';

describe('Directive: sidebarMenuApp', function () {

  // load the directive's module and view
  beforeEach(module('flujogenico20App'));
  beforeEach(module('app/directives/sidebarMenuApp/sidebarMenuApp.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<sidebar-menu-app></sidebar-menu-app>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the sidebarMenuApp directive');
  }));
});