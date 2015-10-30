'use strict';

describe('Main View', function() {
  var page;

  beforeEach(function() {
    browser.get('/');
    page = require('./main.po');
  });

  it('button "more information" should link to /about page', function() {
    page.aboutBtn.click();
    expect(browser.getCurrentUrl()).toContain('/about');

  });
});
