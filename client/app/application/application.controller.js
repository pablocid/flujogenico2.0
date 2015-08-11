'use strict';

angular.module('flujogenico20App')
  .controller('ApplicationCtrl', function (DataSession, Flora, $state) {
    var self = this;
    self.state = $state;

    self.starAgain = function(){
      self.spDonorSelected='';
      self.searchText = '';
      DataSession.eraseSteps();
    };

    self.DS = DataSession;

    if(DataSession.steps.length===0){self.starAgain();}

    this.evalTypeSelected = function(tipo){
      DataSession.pushStep({id:1,title:'evalTypeStep', nameVar:tipo,to:'main.application.spsearch'});
    };

    this.submitSpSearch = function(){
      var item = self.spDonorSelected;
      console.log(item);
      DataSession.pushStep({id:2,title:'spSearchStep', name:item.name,nameVar:item,to:'main.application.reach'});
    };

    this.querySearch = function(name){
      if(!name.length>0){ return []}
      //console.log(this);
      return Flora.searchSN(name);
    };

    this.selectedReach = function(string){
      DataSession.pushStep({id:3,title:'reachStep', nameVar:string, to:'main.application.result'});
    };

    this.DS = DataSession;

  });
