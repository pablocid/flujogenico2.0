'use strict';

angular.module('flujogenico20App')
  .factory('DataSession', function ($state, Flora) {
    function goTo(state){
      var es = state || 'main.application.evalType';
      $state.go(es);
    }

    return {
      steps:[],
      results:'',
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
        this.results = '';
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
      getId:function(){
        return this.steps.filter(function(e){return e.id==2;})[0].nameVar._id;
      },
      getEvalType:function(){
        return this.steps.filter(function(e){return e.id==1;})[0].nameVar;
      },
      goToResult:function(){
        if(!this.steps.filter(function(a){return a.id===3 })[0].nameVar){ return;}
        var resultType = this.steps.filter(function(a){return a.id===3})[0].nameVar;
        var id = this.getId();
        var evalType = this.getEvalType();

        var self = this;

        self.progressBar = true;
        self.resultMatch = true;
        Flora
          .getMatchSp(id,evalType)
          .then(function(a){
            if(a.length==0){
              self.resultMatch = false;
            }else{
              self.resultMatch= true;
            }
            self.results = a;
            self.progressBar = false;
            //console.log(a)
        });

        if(resultType=='reachCtry'){ goTo('main.application.result-nationalscale');}
        if(resultType=='reachLocal'){ goTo('main.application.result-local');}
      }
    };
  });
