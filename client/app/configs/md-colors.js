'use strict';

angular.module('flujogenico20App')
  .config(['$provide', '$mdThemingProvider', function($provide, $mdThemingProvider) {

    /**
     * Of form:
     * {
         *  'blue':{ // Palette name
         *      '50': #abcdef, // Color name: color value
         *      '100': #abcdee,
         *          ...
         *      },
         *      ...
         * }
     * @type {{}}
     */
    var colorStore = {};

    //fetch the colors out of the themeing provider
    Object.keys($mdThemingProvider._PALETTES).forEach(
      // clone the pallete colors to the colorStore var
      function(palleteName) {
        var pallete = $mdThemingProvider._PALETTES[palleteName];
        var colors  = [];
        colorStore[palleteName]=colors;
        Object.keys(pallete).forEach(function(colorName) {
          // use an regex to look for hex colors, ignore the rest
          if (/#[0-9A-Fa-f]{6}|0-9A-Fa-f]{8}\b/.exec(pallete[colorName])) {
            colors[colorName] = pallete[colorName];
          }
        });
      });


    /**
     * mdThemeColors service
     *
     * The mdThemeColors service will provide easy, programmatic access to the themes that have been configured
     * So that the colors can be used according to intent instead of hard coding color values.
     *
     * e.g.
     *
     * <span ng-style="{background: mdThemeColors.primary['50']}">Hello World!</span>
     *
     * So the theme can change but the code doesn't need to.
     */
    $provide.factory('mdThemeColors', [
      function() {

        /**
         * Define the getter methods for accessing the colors
         */
        /*
        Object.defineProperty(service,'primary', {
          get: getColorFactory('primary')
        });

        Object.defineProperty(service,'accent', {
          get: getColorFactory('accent')
        });

        Object.defineProperty(service,'warn', {
          get: getColorFactory('warn')
        });

        Object.defineProperty(service,'background', {
          get: getColorFactory('background')
        });
        */

        return {
          getColorFactory: function(intent,nameTheme){
              var nameThemes = nameTheme || 'default';
              var colors = $mdThemingProvider._THEMES[nameThemes].colors[intent];
              var name = colors.name;
              // Append the colors with links like hue-1, etc
              colorStore[name].default = colorStore[name][colors.hues['default']];
              colorStore[name].hue1 = colorStore[name][colors.hues['hue-1']];
              colorStore[name].hue2 = colorStore[name][colors.hues['hue-2']];
              colorStore[name].hue3 = colorStore[name][colors.hues['hue-3']];
              return colorStore[name];

          }
        };
      }
    ]);

// secci
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
      .primaryPalette('grey',{
        'default':'500'
      })
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
  }]);

