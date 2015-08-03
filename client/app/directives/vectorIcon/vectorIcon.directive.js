'use strict';

angular.module('flujogenico20App')
  .directive('vectorIcon', function (IconService) {
    return {
      restrict: 'EA',
      scope:{
        name:'@name',
        colorFill:'@fill',
        circleColor:'@circleColor'
      },
      link: function (scope, element, attrs) {
        var xmlns = "http://www.w3.org/2000/svg";
        var svg = document.createElementNS(xmlns,'svg');

        var circleColor = scope.circleColor || 'white';
        var colorFill = scope.colorFill || 'white';
        var d = IconService.get(scope.name).d;

        svg.setAttribute('viewBox',"0 0 140 140");
        svg.setAttribute('width','100%');
        svg.setAttribute('height','100%');

        var circle = document.createElementNS(xmlns,'circle');
        circle.setAttribute('cx','50%');
        circle.setAttribute('cy','50%');
        circle.setAttribute('r','50%');
        circle.setAttribute('fill',circleColor);

        svg.appendChild(circle);

        var path = document.createElementNS(xmlns,'path');
        path.setAttribute('d',d);
        path.setAttribute('style','fill:'+ colorFill);

        var g = document.createElementNS(xmlns,'g');
        g.setAttribute('transform','translate(20,20)');
        g.appendChild(path);

        svg.appendChild(g);

        element.append(svg);
      }
    };
  });
