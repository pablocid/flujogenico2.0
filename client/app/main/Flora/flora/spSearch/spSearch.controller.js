'use strict';

angular.module('flujogenico20App')
  .controller('FloraSpsearchCtrl', function (Flora) {
    var self= this;
    this.querySearch = function(name){
      if(name.length===0){ return [];}
      //console.log(name);
      return Flora.searchSN(name);
    };
    this.submitSpSearch = function(){
      var item = self.spDonorSelected;
      Flora.get({id:item._id}).then(function(sp){
        self.selectedSp = sp;
      });
      console.log(self.selectedSp);
    };
  });
