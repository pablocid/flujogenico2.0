'use strict';
/**
 * @ngdoc controller
 * @name flujogenico20App.controller:MainCtrl
 * @description
 * Este es el controlador padre de toda la aplicación. Desde acá se obtiene el contenido en texto, settings de colores y themes, funcion para cambios de estado y manejo del menú lateral.
 *
 * #Tareas:
 * - Estraer html desde un iframe y arreglar formato
 * - Utilizar googlespreadsheet con cell en vez de list
 * - Hacer una directiva con el menu lateral
 * - Hacer una factoria con funciones auxiliares
 *
 */
angular.module('flujogenico20App')
  .controller('MainCtrl', function ($scope, $mdIcon,$mdSidenav,$mdUtil, $timeout, $log, $http, $q,$state, TextContent, $mdTheming,mdThemeColors,$sce) {
    var self = this;

    self.isOpen = false;
    self.demo = {
      isOpen: false,
      count: 0,
      selectedAlignment: 'md-left'
    };
    //content
    TextContent.setLang();
    self.apply= function () {
      $scope.$apply();
    };
    self.tc = TextContent;

    // colors
    self.colors = {
      footer:mdThemeColors.getColorFactory('background','footer').default,
      flora:mdThemeColors.getColorFactory('background','flora').default,
      fauna:mdThemeColors.getColorFactory('background','fauna').default,
      settings:mdThemeColors.getColorFactory('background','settings').default,
      main:mdThemeColors.getColorFactory('background','main').default,
      cira:mdThemeColors.getColorFactory('background','cira').default,
      other:mdThemeColors.getColorFactory('background','settings').default,
      about:mdThemeColors.getColorFactory('background','about').default,
      tool:mdThemeColors.getColorFactory('background','tool').default,
      escala:mdThemeColors.getColorFactory('background','escala').default,
      reachIcon:mdThemeColors.getColorFactory('primary','other').default
    };

    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug('toggle ' + navID + ' is done');
          });
      },300);
      return debounceFn;
    }

    self.toggleLeft = buildToggler('left');
    self.toggleRight = buildToggler('right');

    self.landingTitle = 'CIRA';
    self.landingSubTitle ='Cálculo del índice de riesgo ambiental';
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */


    self.openMenu = function(){
      $mdSidenav('left').toggle();
    };
    /**
     * @ngdoc method
     * @name flujogenico20App.method:goToState
     * @methodOf flujogenico20App.controller:MainCtrl
     * @description
     * Función que permite cambiar de estado
     *
     * @param {string} State_name nombre del estado
     */
    self.goToState = function(state){
      $state.go(state);
    };

    TextContent.content().then(function () {
      self.sections = [
        {title:'Home', icon:'home',sref:'main.home', color:self.colors.main},
        {title:'APP', icon:'cira',sref:'main.application.evalType', color:self.colors.cira},
        {title:self.tc.flora.title, icon:'flora',sref:'main.flora.tables', color:self.colors.flora},
        {title:self.tc.fauna.title, icon:'fauna',sref:'main.fauna.table', color:self.colors.fauna},
        {title:self.tc.escala.mainTitle, icon:'escala',sref:'main.escala', color:self.colors.escala},
        {title:self.tc.settings.mainTitle, icon:'settings',sref:'main.settings', color:self.colors.settings}
      ];
    });


    self.close = function (id) {
      $mdSidenav(id).close()
        .then(function () {
          $log.debug('close LEFT is done');
        });
    };
    self.setLang = function (lang) {
      TextContent.setLang(lang);
    };
    self.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    self.iframes ={
      about: $sce.trustAsResourceUrl("https://docs.google.com/document/d/11EawVdD5l2ZglEdqgSGO-Rm7I0QnDW1zZdRrkzkuERs/pub?embedded=true"),
      escala:$sce.trustAsResourceUrl("https://docs.google.com/document/d/1K8vxWtqW1MFmijxi6lR9zj5DI8yK--F6w76i78VGVzA/pub?embedded=true"),
      settings:$sce.trustAsResourceUrl("https://docs.google.com/document/d/1xa2oatimRHzyBvZ6FKlldIlL68lAxJGRKmxvzIEp1FA/pub?embedded=true")
    };

    $http
      .get('https://spreadsheets.google.com/feeds/list/1VmziNKfbmyMgtmZVC-7IjvkNNnxw0UssD_NL8I1H6GE/od6/public/basic?alt=json')
      .success(function (data) {
        var newArr = [];
        function kaka(ds) {
          var arr = ds.split(", ");
          var obj={};
          arr.map(function (a) {

            var na = a.split(": ");
            obj[na[0]]=na[1];
            return na;
          });
          return obj;
        }

        data.feed.entry.forEach(function (d) {
          var dato = "section: "+d.title.$t+", "+d.content.$t;
          newArr.push(kaka(dato));
          //r[d.title.$t] =d.content.$t;
        });
        //console.log(newArr);
      });


  });
