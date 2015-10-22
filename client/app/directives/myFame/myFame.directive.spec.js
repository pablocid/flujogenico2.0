'use strict';

describe('Directive: myFame', function () {

  // load the directive's module
  beforeEach(module('flujogenico20App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<my-fame></my-fame>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the myFame directive');
  }));
});