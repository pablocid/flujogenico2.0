'use strict';
 var Page = function () {
   this.title = element(by.binding('mainCtrl.tc[section].mainTitle'));
   //this.btnLangES = element(by.css('#langBtnES'));
   //this.btnLangEN = element(by.id('langBtnEN'));
   //this.btnLangEN = browser.isElementPresent(element(by.css('.langBtnEN')));
 };

module.exports = new Page();
