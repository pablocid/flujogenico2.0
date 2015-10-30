'use strict';

angular.module('flujogenico20App')
  .directive('cFrame', function () {
    return {
      template: '<md-progress-linear md-mode="indeterminate" ></md-progress-linear><div id="cframe-div"></div>',
      scope:{},
      restrict: 'EA',
      link: function (scope, element, attrs) {
        element.find('#cframe-div').empty();

        attrs.$observe('src', function (value) {
          element.find('md-progress-linear').css({'display':'block'});
         if (value) {
           console.log('cambió');
            // pass value to app controller
            buildFrame(value);
          }
        });

        function buildFrame(urlFrag){
          element.find('#cframe-div').empty();
          var url = encodeURIComponent('https://docs.google.com/document/d/'+urlFrag);
          var src= 'api/cframes/'+url;
          var iframe = angular.element('<iframe />');
          iframe
            .attr({
              src:src,
              frameborder:0
            })
            .css({
              'width':'100%',
              height:'400px',
              display:'none'
            });


          element.find('#cframe-div').append(iframe);
          var fontSize = attrs.fontSize || null;
          var margin = attrs.margin || 0;
          var padding = attrs.padding || 0;
          var backColor = attrs.backgroundColor || 'transparent';

          iframe.load( function() {
            console.log('load');
            iframe.contents().find("p").children().css({'font-size':fontSize});
            iframe.contents().find("p").css({'font-size':fontSize,'width':'100%'});
            iframe.contents().find("body").css({margin:margin,padding:padding,'background-color':backColor});
            iframe.contents().find("a").attr({target:"_parent"});
            iframe.css('display','inline-block');
            element.find('md-progress-linear').css({'display':'none'});
          });

        }
      }
    };
  });
