'use strict';

angular.module('flujogenico20App')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.fauna', {
        abstract:true,
        url: '/pollinators',
        templateUrl: 'app/main/Pollinators/Pollinators.html',
        controller: 'PollinatorsCtrl'
      })
      .state('main.fauna.table',{
        url:'',
        views:{
          mainfauna:{
            templateUrl:'app/main/Pollinators/pollinator.table.html',
            controller: function (Pollinator) {
              var self = this;
              self.pageSize = 5;
              self.getPage = function(p){
                var s = 'Pollinators';
                if(!self[s]){self[s]={};}
                if(!self[s].currentPage){self[s].currentPage=1;}

                Pollinator.paginate(p,self.pageSize).then(function(res){
                  self[s].sp = res.pollinators;
                  self[s].currentPage = res.currentPage;
                  if(self[s].totalItems !== res.totalItems){
                    self[s].totalItems = res.totalItems;
                    //console.log(res.totalItems);
                  }

                });
              };
              self.getPage(1);
            },
            controllerAs:'ptCtrl'
          }
        }
      });
  });
