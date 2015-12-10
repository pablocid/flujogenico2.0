'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.application', {
        url: '/application',
        templateUrl: 'app/application/application.html',
        controller: 'ApplicationCtrl',
        controllerAs:'appCtrl'
      })
      .state('main.application.evalType', {
        url: '/eval-type',
        views:{
          title:{
            template:'{{mainCtrl.tc.app.evalTitle}}'
          },
          description:{
            template:'<div class="padding25">{{mainCtrl.tc.app.evalDescript}}</div>'
          },
          content:{
            templateUrl:'app/application/evalType/evalType.content.html',
            controller: function ($state, DataSession) {
              var self = this;
              self.selection = function (type) {
                DataSession.setStep('evalType',type);
                console.log(DataSession.steps);
                $state.go('main.application.spsearch');
              }
            },
            controllerAs:'evalTypeContentCtrl'
          }
        }
      })
      .state('main.application.spsearch', {
        url: '/sp-search',
        views:{
          title:{
            template:'{{mainCtrl.tc.app.spSearchTitle}}'
          },
          description:{
            template:'<div class="padding25">{{mainCtrl.tc.app.spSearchDescript}}</div>'
          },
          content:{
            templateUrl:'app/application/spSearch/spSearch.content.html',
            controller: function ($state,Flora,DataSession,$timeout) {
              var self = this;
              this.submitSpSearch = function(obj){
                if(obj){
                  DataSession.setStep('spSearch',obj);
                }else{
                  DataSession.setStep('spSearch',self.spDonorSelected);
                }
                console.log(DataSession.steps);
                $state.go('main.application.reach');
              };
              this.querySearch = function(name){
                if(name.length===0){ return [];}
                return Flora.searchSN({name:name}).$promise
              };
              Flora.getList({type:4}).$promise.then(function (data) {
                self.transgenic = data;
              });
              Flora.getList({type:1}).$promise.then(function (data) {
                self.cultivated = data;
              });

            },
            controllerAs:'spSearchContentCtrl'
          }
        }
      })
      .state('main.application.reach', {
        url: '/reach',
        views:{
          title:{
            template:'{{mainCtrl.tc.app.reachTitle}}'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            templateUrl:'app/application/reach/reach.content.html',
            controller: function ($state,DataSession) {
              this.selection = function(string){
                DataSession.setStep('reach',string);
                console.log(DataSession.steps);
                $state.go('main.application.result');
              };
            },
            controllerAs:'reachContentCtrl'
          }
        }
      })
      .state('main.application.result', {
        url: '/result',
        views:{
          content:{
            controller:function(DataSession,$state){
              //decide donde lo redige
              if(DataSession.steps!==3){
                DataSession.makeResult().then(function () {
                  //reachCtry
                  if(DataSession.getReach()==='reachLocal'){
                    $state.go('main.application.result-local');
                  }
                  if(DataSession.getReach()==='reachCtry'){
                    $state.go('main.application.result-nationalscale');
                  }
                });
              }
            }
          }
        }
      })
      .state('main.application.result-nationalscale', {
        url: '/result-national-scale',
        views:{
          title:{
            template:'{{mainCtrl.tc.app.resultTitleCountry}}'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            templateUrl:'app/application/results/results.national.html',
            controller: function (DataSession) {
              this.DS = DataSession;
            },
            controllerAs:'nationalContentCtrl'
          }
        }
      })
      .state('main.application.result-local', {
        url: '/result-local',
        views:{
          title:{
            template:'{{mainCtrl.tc.app.resultTitleLocal}}'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            templateUrl:'app/application/results/results.local.html',
            controller:'resultsLocalController',
            controllerAs:'resultLocalCtrl'
          }
        }
      })
      .state('main.application.noresult',{
        url:'/no-result',
        views:{
          title:{
            template:'<h2>No results</h2>'
          },
          content:{
            controller: function ($state) {

            }
          }
        }
      });
  });
