'use strict';

angular.module('flujogenico20App')
  .directive('showProps', function ($compile) {
    return {
      //template: '<div></div>',
      restrict: 'EA',
      scope:{
        sp:'=',
        text:'='
      },
      link: function (scope, element) {

        scope.$watch('sp',function(sp){
          if(!sp){return;}
          var span = angular.element('<span />');
          //console.log(sp);


          scope.sp.general.taxonomy.local.forEach(function(t){
            if(t.id==='gen'||t.id==='sp'){return;}
            var toolTextt = t.name;
            var aa = '<md-button md-no-ink class="md-fab"  style="background-color: gray;"> '+t.id+' <md-tooltip >'+toolTextt+'</md-tooltip></md-button>';
            var sa = angular.element(aa);
            span.append(sa);
          });

          if(scope.sp.general.vernacularNames){
            scope.sp.general.vernacularNames.forEach(function (t) {
              var toolTextt = t.name;
              var aa = '<md-button md-no-ink class="md-fab"  style="background-color: gray;"> '+t.lang+' <md-tooltip >nombre comun: '+toolTextt+'</md-tooltip></md-button>';
              var sa = angular.element(aa);
              span.append(sa);
            });
          }

          scope.sp.properties.forEach(function(prop){
            if(prop.id==='cultc'||prop.id==='gffs'||prop.id==='gffc'||prop.id==='sb'|| prop.id==='fg'|| prop.id==='reg'|| prop.id==='ag'){return;}
            var toolText = '{{mainCtrl.tc.table.'+prop.id+' || "'+prop.altName+'"||"'+prop.name+'"}}';//prop.altName || prop.name;
            //if(prop.id==='aus'){toolText='Ausente en Chile';}
            //{{mainCtrl.tc.table[prop.id] prop.altName || prop.name}}
            //if(prop.weight){toolText+=': '+prop.weight;}
            var pp = '<md-button md-no-ink class="md-fab" style="background-color: gray;"> '+prop.id+' <md-tooltip >'+toolText+'</md-tooltip></md-button>';
            var ep = angular.element(pp);
            span.append(ep);

          });

          $compile(span)(scope.$parent);
          element.append(span);
        });
        //TODO: traducir las propiedades y leyendas
      }
    };
  });
