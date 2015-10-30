'use strict';

angular.module('flujogenico20App')
  .factory('TextContent', function ($http, $q) {

    var defaultLang = 'es';

    var self = this;
    // Public API here

    return {
      setLang: function(langStr){
        var self = this;
        if(!langStr){
          self.langStr = defaultLang;
        }

        $http
          .get('https://spreadsheets.google.com/feeds/cells/1VmziNKfbmyMgtmZVC-7IjvkNNnxw0UssD_NL8I1H6GE/od6/public/basic?alt=json')
          .success(function (data) {
            var r ={};
            var newArr = [];
            var result = [];
            data.feed.entry.forEach(function (n) {
              var v = n.title.$t[0];
              var p = n.title.$t.replace(/\w/,'');
              var c = n.content.$t;
              var key;

              if(v==='A'){key='section';}
              if(v==='B'){key='name';}
              if(v==='C'){key='es';}
              if(v==='D'){key='en';}

              //inicializar
              if(!result[p]){result[p]={};}

              result[p][key]=c;

            });

            result.forEach(function(p){
              if(!self[p.section]){ self[p.section]={};}
              if(p[langStr]){
                self[p.section][p.name] = p[langStr];
              }else{
                self[p.section][p.name] = p[defaultLang];
              }
            });

          })
          .error(function (err) {
            console.log("ERROR");
          });
      }
    };
  });
