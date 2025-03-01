/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';

var MainPage = function() {
  this.toolbar= element(by.tagName('md-toolbar'));
  this.aboutBtn = element(by.css('#aboutBtn'));
};

module.exports = new MainPage();
