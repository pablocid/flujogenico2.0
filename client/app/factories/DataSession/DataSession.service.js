'use strict';

angular.module('flujogenico20App')
  .factory('DataSession', function ($state) {
    function goTo(state){
      var es = state || 'main.application.evalType';
      $state.go(es);
    }

    return {
      steps:[],
      pushStep:function(step){
        if(!step){
          goTo();
        }else{
          this.addStep(step);
          goTo(step.to);
        }
      },
      eraseSteps:function () {
        this.steps=[];
        goTo();
      },
      addStep:function(step){
        var index = this.steps.map(function (e){return e.id;}).indexOf(step.id);
        if(index!=-1){
          this.steps[index]= step;
        }else{
          this.steps.push(step);
        }
      },
      goToResult:function(){
        console.log('gotoresult');
        if(!this.steps.filter(function(a){return a.id===3 })[0].nameVar){ return;}
        var resultType = this.steps.filter(function(a){return a.id===3})[0].nameVar;

        if(resultType=='reachCtry'){ goTo('main.application.result-nationalscale');}
        if(resultType=='reachLocal'){ goTo('main.application.result-local');}
      }
    };
  });
