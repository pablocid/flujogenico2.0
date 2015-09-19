'use strict';

angular.module('flujogenico20App')
  .factory('TextContent', function () {
    // Service logic
    // ...

    var meaningOfLife = 42;
    var defaultLang = 'es';
    var content = [
      {section:'std',name:'moreinfo',es:'más información',en:'more information'},
      {section:'std',name:'enter',es:'entrar',en:'go'},
      {section:'std',name:'cira',es:'CIRA',en:'CERI'},
      {section:'home',name:'mainTitle',es:'CIRA',en:'CERI'},
      {section:'home',name:'mainSubTitle',es:'Cálculo del Índice de Riesgo Ambiental',en:'Calculation of Environmental Risk Index'},
      {section:'flora',name:'title',es:'Flora vascular chilena',en:'Chilean vascular flora'},
      {section:'flora',name:'descriptHome',es:'Consulta nuestra base de datos donde podrás encontrar especies cultivadas, introducidas y nativas.',en:'You can find cultivated species, introduced and native in our database'},
      {section:'fauna',name:'title',es:'Polinizadores de Chile',en:'Chilean Pollinators'},
      {section:'fauna',name:'descriptHome',es:'En esta sección encontrarás nuestra base de datos de insectos polinizadores.',en:'In this section you will find our database pollinating insects.'},
      {section:'escala',name:'title',es:'Escalas e Índices',en:'Scales and Indexes'},
      {section:'escala',name:'descriptHome',es:'En esta sección encontrarás las definiciones de las escalas e índices utilizadas en la aplicación.',en:'In this section you will find the definitions of the scales and indexes used in the application.'},
      {section:'settings',name:'title',es:'Sobre el sistema',en:'About de system'},
      {section:'settings',name:'descriptHome',es:'Entérate de cuales fueron las tecnologías de la información que se utilizaron.',en:'Find out what were the technologies of the information used.'},
      {section:'home',name:'aboutTitle',es:'¿Qué es CIRA?',en:'What is CERI?'},
      {section:'home',name:'aboutContent',es:'CIRA es una herramienta diseñada para evaluar el impacto ambiental que implica introducir una especie cultivada en la flora vascular chilena',en:'CERI is a tool designed to assess the environmental impact which involves introducing a cultivated species in the chilean vascular flora'},
      {section:'home',name:'aboutBtn',es:'más información',en:'more information'},
      {section:'home',name:'toolTitle',es:'Herramienta de cálculo',en:'Calculation tool'},
      {section:'app',name:'coex',es:'Coexistencia',en:'Coexistence'},
      {section:'app',name:'bio',es:'Biodiversidad',en:'Biodiversity'},
      {section:'app',name:'evalTitle',es:'Tipo de Evaluación',en:'Evaluation type'},
      {section:'app',name:'evalDescript',es:'Puedes elegir entre dos tipos de evaluaciones. El análisis de "Coexistencia" es una evaluación que analiza el potencial de cruzamiento entre especies que se encuentran dentro de un sistema agrícola. Por otro lado, el análisis de "Biodiversidad" consiste en evaluar el potencial de cruzamiento y la posible pérdida de biodiversidad asociada a una especie agrícola que se introduce y otra especie que se encuentra fuera del sistema agrícola. ',en:'You can choose between two types of evaluations. The analysis of "Coexistence" is an assessment that analyzes the out-crossing potential between species found within a farming system. On the other hand, the analysis of "Biodiversity" is evaluating the out-crossing potential and the possible loss of biodiversity associated with agricultural species and other introduced or native species found outside of the farming system.'},
      {section:'app',name:'spSearchTitle',es:'Busca una especie de uso agrícola',en:'Search a farming species'},
      {section:'app',name:'evalTypeStep',es:'Tipo de análisis',en:'Type of analysis'},
      {section:'app',name:'spSearchDescript',es:'Elige una especie',en:'Select a farming species'},
      {section:'app',name:'spSearchStep',es:'Especie seleccionada',en:'Selected species'},
      {section:'app',name:'scientificname',es:'nombre científico',en:'scientific name'},
      {section:'app',name:'required',es:'<b>Debes</b> ingresar un nombre cientifico',en:'You <b>have</b> put a scientific name.'},
      {section:'app',name:'reachTitle',es:'¿A qué nivel deseas analizar la especie cultivada?',en:'What level you want to analyze the cultivated species?'},
      {section:'app',name:'reachDescript',es:'',en:''},
      {section:'app',name:'reachStep',es:'Alcance del análisis',en:'Reach of analysis'},
      {section:'app',name:'reachCtry',es:'Nivel nacional',en:'National scale'},
      {section:'app',name:'reachLocal',es:'Nivel local',en:'Locally result'},
      {section:'app',name:'newStart',es:'Realiza otro análisis',en:'Make another analysis'},
      {section:'app',name:'resultTitle',es:'Resultado del análisis', en:'Analysis results'},
      {section:'app',name:'resultTitleCountry',es:'Resultado a nivel nacional', en:'National scale result'},
      {section:'app',name:'noResults',es:'No coincide ninguna especie',en:'No match for this species'},
      {section:'app',name:'veryLow',es:'muy bajo',en:'very low'},
      {section:'app',name:'low',es:'bajo',en:'low'},
      {section:'app',name:'medium',es:'medio',en:'medium'},
      {section:'app',name:'high',es:'alto',en:'high'},
      {section:'app',name:'veryHigh',es:'muy alto',en:'very high'},
      {section:'app',name:'noData',es:'Sin información en la base de datos',en:'No information in the data base'},
      {section:'app',name:'riskScale',es:'Escala de riesgo',en:'Risk scale'},
      {section:'app',name:'riskIndex',es:'Índice de riesgo',en:'Risk index'},
      {section:'app',name:'resultTitleLocal',es:'Resultados a nivel local',en:'Local scale results'},
      {section:'flora',name:'mainTitle',es:'Flora vascular chilena',en:'Chilean vascular flora'},
      //{section:'flora',name:'mainSubTitle',es:'Recopilacion de ',en:'Calculation of Environmental Risk Index'},
      {section:'flora',name:'sideTitle',es:'Flora vascular chilena',en:'Chilean vascular flora'},
      {section:'flora',name:'searchDescript',es:'Dentro de nuestra base de datos puedes encontrar especies chilenas con informacion taxonomica y biologica',en:'In our data base yo can find taxonomic and biological information about chilean vascular flora'}

    ];

    // Public API here
    return {
      someMethod: function () {
        return meaningOfLife;
      },
      setLang: function(langStr){
        var self = this;
        if(!langStr){
          langStr = defaultLang;
        }
        content.forEach(function(p){

          if(!self[p.section]){ self[p.section]={};}

          if(p[langStr]){
            self[p.section][p.name] = p[langStr];
          }else{
            self[p.section][p.name] = p[defaultLang];
          }

        });
      }
    };
  });
