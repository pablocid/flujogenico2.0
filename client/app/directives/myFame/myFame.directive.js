'use strict';

angular.module('flujogenico20App')
  .directive('myFrame', function () {
    return {
      template: '<div></div>',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        var iframe = angular.element('<iframe />');
        iframe.attr({
          src:attrs.src,
          frameborder:0
        });
        element.append(iframe);

        var fontSize = attrs.fontSize || null;
        var margin = attrs.margin || 0;
        var padding = attrs.padding || 0;
        var backColor = attrs.backgroundColor || 'transparent';


        iframe.load( function() {
          iframe.contents().find("p").children().css({'font-size':fontSize});
          iframe.contents().find("body").css({margin:margin,padding:padding,'background-color':backColor});
        });


      }
    };
  });
