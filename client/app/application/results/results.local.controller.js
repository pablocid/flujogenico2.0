'use strict';

angular.module('flujogenico20App')
    .controller('resultsLocalController', function ($scope,DataSession, $http,$state) {
    var self = this;

    function ifMatch(res,serv){
      if(!res || !serv || res.length===0 || serv.length===0){return;}
      for(var i =0;i<res.length;i++){
        for(var j=0; j<serv.length;j++){
          if(res[i].underscoreSp()===serv[j].id){
            return true;
          }
        }
      }

    }
    self.species =DataSession.underscoreResults;
    self.results = DataSession.results;

    var genus = DataSession.getStep('spSearch').name.split(" ")[0].toLowerCase();
    self.show=false;
    $http.get('http://servidor-modelos.cswlabs.cl/models?genero='+genus).success(function (data) {
      if(ifMatch(self.results,data)){
        self.show=true;
        console.log('match');
      }else{
        $state.go('main.application.noresult');
      }
    });

    self.localResults = function (sp) {
      DataSession.localResults =[];
      for(var s in sp.species){
        if(sp.species[s]){
          //console.log(findSp(self.results,s));
          DataSession.localResults.push(findSp(self.results,s,sp.species[s]));
        }
      }
    };
    function findSp(arr,e,val){
      console.log(val)
      var index = arr.map(function (a) {return a.underscoreSp();}).indexOf(e);
      if(index ===-1){return;}
      var esp = angular.copy(arr[index]);
      if(!esp.indexes || !esp.indexes.RI){
        esp.localResult = 'no info';
        return esp;
      }
      var RIs =[];
      for(var k in esp.indexes.RI){
        if(esp.indexes.RI[k] && esp.indexes.RI[k]!=='noProp'){
          RIs.push(esp.indexes.RI[k]);
        }
      }
      if(RIs.sort(function(a, b){return b-a})[0] && val>=1){
        var result = RIs.sort(function(a, b){return b-a})[0];
        result = Math.round(result);
        //if(!result){result=1; }
        esp.localResult =result* val/100;
      }else{
        esp.localResult = 0;
      }


      console.log(esp.localResult);
      return esp;
    }

  });
