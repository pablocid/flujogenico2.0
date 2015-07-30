'use strict';

describe('Service: IconService', function () {

  // load the service's module
  beforeEach(module('flujogenicoApp'));

  // instantiate service
  var IconService;
  beforeEach(inject(function (_IconService_) {
    IconService = _IconService_;
  }));

  it('should do something', function () {
    expect(!!IconService).toBe(true);
  });

});
