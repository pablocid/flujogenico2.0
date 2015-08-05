'use strict';

angular.module('flujogenico20App')
  .controller('MainCtrl', function ($mdIcon,$mdSidenav,$mdUtil, $timeout, $log, $http, $q,$state) {
    var self = this;
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
      $state.go('landing'+state);
    };

    self.todos = [
      {title:'Home', description:'', icon:'home',sref:'.home', color:'#31beff'},
      {title:'APP', description:'Cálculo del índice de riesgo ambiental',icon:'cira',sref:'.application.evalType', color:'#f44336'},
      {title:'Flora vascular chilena', description:'La descripcion', icon:'flora',sref:'.flora', color:'#8bc34a'},
      {title:'Fauna de polinizadores chilenos', description:'La descripcion', icon:'fauna',sref:'.polinizadores', color:'#fbb531'},
      {title:'Clasificaciones y escala de riesgo', description:'La descripcion', icon:'escala',sref:'.escalas', color:'#f50057'},
      {title:'Sobre el sistema computacional', description:'La descripcion', icon:'settings',sref:'.sistema', color:'#0091ea'}
    ];

    self.close = function (id) {
      $mdSidenav(id).close()
        .then(function () {
          $log.debug("close LEFT is done");
        });
    };
  });
