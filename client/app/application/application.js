'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.application', {
        url: '/application',
        templateUrl: 'app/application/application.html',
        controller: 'ApplicationCtrl'
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
      .state('main.application.resultLocal', {
        url: '/result-local',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'Resultados locales'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            template:'<ul>' +
            '<li>Especie</li>' +
            '<li></li>' +
            '<li></li>' +
            '<li></li>' +
            '<li></li>' +
            '</ul>'
          }
        }
      })
      .state('main.application.resultCountry', {
        url: '/result-country',
        views:{
          info:{
            //template:'<h2>Info view</h2>'
          },
          title:{
            template:'Resultados nacionales'
          },
          description:{
            template:'<div class="padding25"></div>'
          },
          content:{
            template:'<ul>' +
            '<li>Especie</li>' +
            '<li></li>' +
            '<li></li>' +
            '<li></li>' +
            '<li></li>' +
            '</ul>'
          }
        }
      });
  });
