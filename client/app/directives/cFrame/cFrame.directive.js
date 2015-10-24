'use strict';

angular.module('flujogenico20App')
  .directive('cFrame', function () {
    return {
      template: '<div></div>',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        var iframe = angular.element('<iframe />');
        iframe
          .attr({
            src:attrs.src,
            frameborder:0
          })
          .css({
            width:'100%',
            height:'450px'
          });

        element.append(iframe);

        var fontSize = attrs.fontSize || null;
        var margin = attrs.margin || 0;
        var padding = attrs.padding || 0;
        var backColor = attrs.backgroundColor || 'transparent';

        iframe.load( function() {
          iframe.contents().find("p").children().css({'font-size':fontSize});
          iframe.contents().find("p").css({'font-size':fontSize,'width':'100%'});
          iframe.contents().find("body").css({margin:margin,padding:padding,'background-color':backColor});
          iframe.contents().find("a").attr({target:"_parent"});
        });
      }
    };
  });
