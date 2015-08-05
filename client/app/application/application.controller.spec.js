'use strict';

describe('Controller: ApplicationCtrl', function () {

  // load the controller's module
  beforeEach(module('flujogenico20App'));

  var AplicationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AplicationCtrl = $controller('ApplicationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
