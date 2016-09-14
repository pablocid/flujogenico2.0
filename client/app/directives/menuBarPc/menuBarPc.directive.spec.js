'use strict';

describe('Directive: menuBarPc', function () {

  // load the directive's module and view
  beforeEach(module('flujogenico20App'));
  beforeEach(module('app/directives/menuBarPc/menuBarPc.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<menu-bar-pc></menu-bar-pc>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the menuBarPc directive');
  }));
});