'use strict';

angular.module('flujogenico20App')
  .controller('ApplicationCtrl', function (DataSession,$state) {
    var self = this;
    //self.state = $state;
/*    var param = $stateParams.evalType;
    if(param && (param==='coexistencia' || param==='biodiversidad')){
      var tipo;
      if(param==='coexistencia'){tipo='coex';}
      if(param==='biodiversidad'){tipo='bio'}
      if(tipo){
        DataSession.pushStep({id:1,title:'evalTypeStep', nameVar:tipo,to:'main.application.spsearch'});
      }
    }*/

    self.starAgain = function(){
      DataSession.eraseSteps();
      $state.go('main.application.evalType');
    };

    // para mostrar tabla de avance
    self.DS = DataSession;

    //if(DataSession.steps.length===0){self.starAgain();}
/*    this.evalTypeSelected = function(tipo){
      DataSession.pushStep({id:1,title:'evalTypeStep', nameVar:tipo,to:'main.application.spsearch'});
    };

    this.submitSpSearch = function(){
      var item = self.spDonorSelected;
      //console.log(item);
      DataSession.pushStep({id:2,title:'spSearchStep', name:item.name,nameVar:item,to:'main.application.reach'});
    };

    this.querySearch = function(name){
      if(name.length===0){ return [];}
      //console.log(name);
      return Flora.searchSN(name);
    };

    this.selectedReach = function(string){
      DataSession.pushStep({id:3,title:'reachStep', nameVar:string, to:'main.application.result'});
    };*/

    this.indexColor = function(idx){
      if(idx<=0.2){return '#0b620a';}
      if(idx>0.2 && idx<=0.4){return '#97ca04';}
      if(idx>0.4 && idx<=0.6){return '#edd910';}
      if(idx>0.6 && idx<=0.8){return '#fdbe01';}
      if(idx<0.8 ){return '#f70602';}else{
        return '#e6e6e6';
      }
    };
    this.indexScale = function(idx){
      if(idx<=0.2){return 'Very low';}
      if(idx>0.2 && idx<=0.4){return 'Low';}
      if(idx>0.4 && idx<=0.6){return 'Medium';}
      if(idx>0.6 && idx<=0.8){return 'High';}
      if(idx<0.8 ){return 'Very high';}else{
        return 'noData';
      }
    };

  });
