'use strict';

describe('Controller: PollinatorsCtrl', function () {

  // load the controller's module
  beforeEach(module('flujogenico20App'));

  var PollinatorsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PollinatorsCtrl = $controller('PollinatorsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
