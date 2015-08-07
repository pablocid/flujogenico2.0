'use strict';

angular.module('flujogenico20App')
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('other')
      .primaryPalette('grey',{
        'default':'800'
      })
      .backgroundPalette('grey',{
        'default':'100'
      });
    /*********MAIN*********/
    $mdThemingProvider.theme('main')
      .primaryPalette('blue', {
        'default': '500',
        'hue-1': '100',
        'hue-2': '600',
        'hue-3': 'A100'
      })
      .backgroundPalette('blue',{
        'default':'500'
      });
    /*********END MAIN*********/

    /*********TOOL*********/
    $mdThemingProvider.theme('tool')
      .backgroundPalette('grey',{
        'default':'200'
      });
    /*********END TOOL*********/

    /*********FOOTER*********/
    $mdThemingProvider.theme('footer')
      .primaryPalette('blue', {
        'default': '500',
        'hue-1': '100',
        'hue-2': '500',
        'hue-3': 'A100'
      })
      .warnPalette('purple', {
        'default': '500',
        'hue-1': '800',
        'hue-3': 'A100'
      })
      .accentPalette('amber', {
        'default': '500'
      })
      .backgroundPalette('blue-grey',{
        'default':'500'
      });
    /*********END FOOTER*********/

    /*********ABOUT*********/
    $mdThemingProvider.theme('about')
      .primaryPalette('blue-grey', {
        'default': '800',
        'hue-1': '100',
        'hue-2': '600',
        'hue-3': 'A100'
      })
      .backgroundPalette('blue-grey',{
        'default':'600'
      });
    /*********END ABOUT*********/

    /*********FLORA*********/
    $mdThemingProvider.theme('flora')
      .backgroundPalette('light-green',{
        'default':'800'
      });
    /*********END FLORA*********/

    /*********FAUNA*********/
    $mdThemingProvider.theme('fauna')
      .primaryPalette('orange', {
        'default': '800',
        'hue-1': '100',
        'hue-2': '600',
        'hue-3': 'A100'
      })
      .accentPalette('purple', {
        'default': '200'
      })
      .backgroundPalette('orange',{
        'default':'800'
      });
    /*********FAUNA*********/

    /*********CIRA*********/
    $mdThemingProvider.theme('cira')
      .primaryPalette('red', {
        'default': '500',
        'hue-1': '100',
        'hue-2': '600',
        'hue-3': 'A100'
      })
      .backgroundPalette('red',{
        'default':'500'
      })
      .accentPalette('purple', {
        'default': '200'
      });
    /*********END CIRA*********/

    /*********ESCALA*********/
    $mdThemingProvider.theme('escala')
      .primaryPalette('blue', {
        'default': '500',
        'hue-1': '100',
        'hue-2': '600',
        'hue-3': 'A100'
      })
      .accentPalette('purple', {
        'default': '500'
      })
      .backgroundPalette('blue',{
        'default':'500'
      });
    /*********END SCALA*********/

    /*********SETTINGS*********/
    $mdThemingProvider.theme('settings')
      .primaryPalette('purple', {
        'default': '500',
        'hue-1': '100',
        'hue-2': '600',
        'hue-3': 'A100'
      })
      .accentPalette('red', {
        'default': '800'
      })
      .backgroundPalette('purple',{
        'default':'500'
      });
    /*********END SETTINGS*********/
  });
