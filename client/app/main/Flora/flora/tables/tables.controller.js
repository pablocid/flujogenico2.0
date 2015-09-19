'use strict';

angular.module('flujogenico20App')
  .controller('FloraTablesCtrl', function (Flora) {
    var self = this;

    self.pageSize = 5;
    self.getPage = function(s,p){
      if(!self[s]){self[s]={};}
      if(!self[s].currentPage){self[s].currentPage=1;}

      Flora.paginate(s,p,self.pageSize).then(function(res){
        self[s].sp = res.flora;
        self[s].currentPage = res.currentPage;
        if(self[s].totalItems !== res.totalItems){
          self[s].totalItems = res.totalItems;
          //console.log(res.totalItems);
        }

      });
    };
    self.getPage('cultivated',1);
    self.getPage('transgenic',1);
    self.getPage('introduced',1);
    self.getPage('native',1);


    //TODO: traducir los títulos, conteo de especies y las lengüetas
  });
