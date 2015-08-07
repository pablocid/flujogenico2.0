'use strict';

angular.module('flujogenico20App')
  .controller('MainCtrl', function ($mdIcon,$mdSidenav,$mdUtil, $timeout, $log, $http, $q,$state, TextContent, $mdTheming,mdThemeColors) {
    var self = this;

    self.isOpen = false;
    self.demo = {
      isOpen: false,
      count: 0,
      selectedAlignment: 'md-left'
    };
    //content
    TextContent.setLang();

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
      escala:mdThemeColors.getColorFactory('background','escala').default
    };

    console.log(self.colors);

    self.toggleLeft = buildToggler('left');
    self.toggleRight = buildToggler('right');

    self.landingTitle = 'CIRA';
    self.landingSubTitle ='Cálculo del índice de riesgo ambiental';
    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildToggler(navID) {
      var debounceFn =  $mdUtil.debounce(function(){
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      },300);
      return debounceFn;
    }

    self.openMenu = function(){
      $mdSidenav('left').toggle();
    };
    self.goToState = function(state){
      $state.go(state);
    };

    self.todos = [
      {title:'Home', description:'', icon:'home',sref:'main.home', color:self.colors.main},
      {title:'APP', description:'Cálculo del índice de riesgo ambiental',icon:'cira',sref:'main.application.evalType', color:self.colors.cira},
      {title:'Flora vascular chilena', description:'La descripcion', icon:'flora',sref:'main.flora', color:self.colors.flora},
      {title:'Fauna de polinizadores chilenos', description:'La descripcion', icon:'fauna',sref:'main.polinizadores', color:self.colors.fauna},
      {title:'Clasificaciones y escala de riesgo', description:'La descripcion', icon:'escala',sref:'main.escalas', color:self.colors.escala},
      {title:'Sobre el sistema computacional', description:'La descripcion', icon:'settings',sref:'main.sistema', color:self.colors.settings}
    ];

    self.close = function (id) {
      $mdSidenav(id).close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
    console.log(TextContent);
    self.setLang = function (lang) {
      TextContent.setLang(lang);
      console.log(TextContent);
    };

  });
