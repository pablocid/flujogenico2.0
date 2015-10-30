'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.application', {
        url: '/application/:evalType',
        templateUrl: 'app/application/application.html',
        controller: 'ApplicationCtrl',
        controllerAs:'appCtrl'
      })
      .state('main.application.evalType', {
        url: '/eval-type',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'{{mainCtrl.tc.app.evalTitle}}'
          },
          description:{
            template:'<div class="padding25">{{mainCtrl.tc.app.evalDescript}}</div>'
          },
          content:{
            templateUrl:'app/application/evalType/evalType.content.html'
          }
        }
      })
      .state('main.application.spsearch', {
        url: '/sp-search',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'{{mainCtrl.tc.app.spSearchTitle}}'
          },
          description:{
            template:'<div class="padding25">{{mainCtrl.tc.app.spSearchDescript}}</div>'
          },
          content:{
            templateUrl:'app/application/spSearch/spSearch.content.html',

          }
        }
      })
      .state('main.application.reach', {
        url: '/reach',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'{{mainCtrl.tc.app.reachTitle}}'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            templateUrl:'app/application/reach/reach.content.html'
          }
        }
      })
      .state('main.application.result', {
        url: '/result',
        views:{
          content:{
            controller:function(DataSession){
              DataSession.goToResult();
            }
          }
        }
      })
      .state('main.application.result-nationalscale', {
        url: '/result-national-scale',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'{{mainCtrl.tc.app.resultTitleCountry}}'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            templateUrl:'app/application/results/results.national.html'
          }
        }
      })
      .state('main.application.result-local', {
        url: '/result-local',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'{{mainCtrl.tc.app.resultTitleLocal}}'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            templateUrl:'app/application/results/results.local.html',
            controller:function(){
              this.species = ['agrostis_capillaris', 'agrostis_leptotricha', 'agrostis_magellanica'];
            },
            controllerAs:'resultLocalCtrl'
          }
        }
      });
  });
