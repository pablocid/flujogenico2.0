'use strict';
describe('About Page', function () {
  var page;

  beforeEach(function () {
    browser.get('/about');
    page= require('./cframe.po');
  });

  it('title should be correct', function () {
    expect(page.title.getText()).toBe('¿Qué es CIRA ?');
    //var lang = browser.isElementPresent(element(by.css('.langBtnEN')));
    //lang.click();
    //expect(page.title.getText()).toBe('What is CERI?');
    //var ptor = protractor.getInstance();
    //ptor.waitForAngular();
    //expect(browser.isElementPresent(element(by.id('langBtnEN')))).toBe(true);
  });
});
