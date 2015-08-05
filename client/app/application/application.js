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
            template:'<h2>Info view</h2>'
          },
          title:{
            template:'Tipo de Evaluación'
          },
          description:{
            template:'<div class="padding25">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam architecto atque, aut beatae corporis doloremque ducimus eos error magnam mollitia nihil odio perferendis quas sequi, suscipit totam voluptate? Eos, magnam?</div>'
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
            template:'<h2>Info view</h2>'
          },
          title:{
            template:'Busca una especie de uso agrícola'
          },
          description:{
            template:'<div class="padding25">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam architecto atque, aut beatae corporis doloremque ducimus eos error magnam mollitia nihil odio perferendis quas sequi, suscipit totam voluptate? Eos, magnam?</div>'
          },
          content:{
            templateUrl:'app/application/spSearch/spSearch.content.html'
          }
        }
      })
      .state('main.application.reach', {
        url: '/reach',
        views:{
          info:{
            template:'<h2>Info view</h2>'
          },
          title:{
            template:'¿A qué nivel deseas analizar la especie cultivada?'
          },
          description:{
            template:'<div class="padding25">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam architecto atque, aut beatae corporis doloremque ducimus eos error magnam mollitia nihil odio perferendis quas sequi, suscipit totam voluptate? Eos, magnam?</div>'
          },
          content:{
            templateUrl:'app/application/reach/reach.content.html'
          }
        }
      })
      .state('main.application.result', {
        url: '/result',
        views:{
          info:{
            template:'<h2>Info view</h2>'
          },
          title:{
            template:'Resultados'
          },
          description:{
            template:'<div class="padding25">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aperiam architecto atque, aut beatae corporis doloremque ducimus eos error magnam mollitia nihil odio perferendis quas sequi, suscipit totam voluptate? Eos, magnam?</div>'
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
