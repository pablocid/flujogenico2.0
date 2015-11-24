'use strict';

angular.module('flujogenico20App')
  .factory('DataSession', function ($state, Flora,$q) {
    return {
      steps:[],
      results:'',
      underscoreResults: '',
      setStep: function (id,content) {
        var stepIndex = this.steps.map(function(a){return a.id}).indexOf(id);
        if(stepIndex===-1){
          var obj = {};
          obj.id= id;
          obj.value=content;
          this.steps.push(obj);
        }else{
          this.steps[stepIndex].value= content;
        }
        return true;
      },
      getStep: function (id) {
        var stepIndex = this.steps.map(function(a){return a.id}).indexOf(id);
        if(stepIndex===-1){return;}
        return this.steps[stepIndex].value;
      },
      eraseSteps:function () {
        this.steps=[];
        this.results = '';
      },
      makeResult: function () {
        var deffered = $q.defer();
        var self = this;
        var idIndex = this.steps.map(function(a){return a.id}).indexOf('spSearch');
        var etIndex = this.steps.map(function(a){return a.id}).indexOf('evalType');
        if(idIndex===-1 ||etIndex===-1 ){return;}

        var id = this.steps[idIndex].value._id;
        console.log(id);
        var evalType = this.steps[etIndex].value;

        Flora.getMatchSp({id:id,type:evalType}).$promise.then(function (data) {
          if(data.length===0){self.resultMatch = false;}
          else{self.resultMatch= true;}
          self.results = data;
          self.resultsIntroducidas = data.filter(function(b){
            var r = b.properties.filter(function(c){
              return c.id==='in';
            }).length;

            if(r===1){return true;}else{return false;}

          });
          self.resultsNativas = data.filter(function(b){
            var r = b.properties.filter(function(c){
              return c.id==='nati';
            }).length;

            if(r===1){return true;}else{return false;}

          });
          self.progressBar = false;
          self.underscoreResults = data.map(function(a){return a.underscoreSp();});

          console.log(self.underscoreResults);
          deffered.resolve('OK');
        });

        return deffered.promise;

      },
      getEvalType:function(){
        //return this.steps.filter(function(e){return e.id==='evalType';})[0].value;
        var index = this.steps.map(function(a){return a.id}).indexOf('evalType');
        if(index===-1){return;}
        return this.steps[index].value;
      },
      getReach: function () {
        var index = this.steps.map(function(a){return a.id}).indexOf('reach');
        if(index===-1){return}
        return this.steps[index].value;
      }
/*      pushStep:function(step){
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
        if(index!==-1){
          this.steps[index]= step;
        }else{
          this.steps.push(step);
        }
      },
      getId:function(){
        return this.steps.filter(function(e){return e.id===2;})[0].nameVar._id;
      },
      getEvalType:function(){
        return this.steps.filter(function(e){return e.id===1;})[0].nameVar;
      },
      goToResult:function(){
        //console.log('Ejecucion de goToResult');
        if(!this.steps.filter(function(a){return a.id===3; })[0].nameVar){ console.log('Error en if'); return;}
        var resultType = this.steps.filter(function(a){return a.id===3;})[0].nameVar;
        var id = this.getId();
        var evalType = this.getEvalType();

        var self = this;

        self.progressBar = true;
        self.resultMatch = true;
        //console.log('Entrando a la llamada match');
        //console.log('Valores de la llamada');
        //console.log('id '+id);
        //console.log('evaltype');
        //console.log(evalType);
        Flora
          .getMatchSp(id,evalType)
          .then(function(a){
            //console.log(a);
            if(a.length===0){
              //console.log('Array length = 0');
              self.resultMatch = false;
            }else{
              self.resultMatch= true;
            }
            self.results = a;
            //console.log( self.results);

            self.resultsIntroducidas = a.filter(function(b){
              var r = b.properties.filter(function(c){
                return c.id==='in';
              }).length;

              if(r===1){return true;}else{return false;}

            });
            self.resultsNativas = a.filter(function(b){
              var r = b.properties.filter(function(c){
                return c.id==='nati';
              }).length;

              if(r===1){return true;}else{return false;}

            });
            self.progressBar = false;
            //console.log(a)
        });

        if(resultType==='reachCtry'){ goTo('main.application.result-nationalscale');}
        if(resultType==='reachLocal'){ goTo('main.application.result-local');}
      }*/
    };
  });
