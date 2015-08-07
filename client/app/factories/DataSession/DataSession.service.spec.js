'use strict';

describe('Service: DataSession', function () {

  // load the service's module
  beforeEach(module('flujogenico20App'));

  // instantiate service
  var DataSession;
  beforeEach(inject(function (_DataSession_) {
    DataSession = _DataSession_;
  }));

  it('should do something', function () {
    expect(!!DataSession).toBe(true);
  });

});
