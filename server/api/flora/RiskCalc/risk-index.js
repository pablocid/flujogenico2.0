var RiskModel = require('./calc/modelo.js');
var CultCult = require('./models/cultivo-cultivo.js');
var IntroCult = require('./models/cultivo-introducida.js');
var NatCult = require('./models/cultivo-nativa.js');
var _ = require('lodash');

var Cultivo = new RiskModel(CultCult);
var Introducida = new RiskModel(IntroCult);
var Nativa = new RiskModel(NatCult);

function RiskIndex (donor, receptors){
  return receptors.map(function(r){
    var recept = r.toObject();
    //console.log(recept);
    if(setIndexes(donor,recept)){
      recept.indexes = setIndexes(donor,recept);
    }else{
      console.log('error');
    }

    return recept;
  });
}

function setIndexes(donor, receptor){

  var RRI = setRRI(receptor);
  var DRI = setDRI(donor);
  var SS = sameSp(donor,receptor);
  var RI = setRI(RRI,DRI,SS);

  return {
      RRI:RRI,
      DRI:DRI,
      SS:SS,
      RI:RI
  };

}

function setRI(RRI,DRI,SS){
  var RI = {};

  RI.introducida = setRIresult(RRI.introducida,DRI,SS);
  RI.cultivada = setRIresult(RRI.cultivada,DRI,SS);
  RI.nativa = setRIresult(RRI.nativa,DRI,SS);

  return RI;
}

function setRIresult(RRI,DRI,SS){
  if(RRI && RRI!=='noProp'){
    return RRI*DRI*0.5 + 0.5*SS;
  }else if(RRI==='noProp'){
    return 'noProp'
  }else{
    return false;
  }
}


function setRRI(sp){

  var ReceptorIndex ={};

  if(_.some(sp.properties, {id:'in'})){
    //console.log('En introducidas');
    ReceptorIndex.introducida = Introducida.RRI(sp);
  }else{
    ReceptorIndex.introducida =false;
  }

  if(_.some(sp.properties, {id:'cultc'})){
    //console.log('En cultivadas');
    ReceptorIndex.cultivada = Cultivo.RRI(sp);
  }else{ReceptorIndex.cultivada =false;}


  if(_.some(sp.properties, {id:'nati'})){
    //console.log('En nativas');
    ReceptorIndex.nativa = Nativa.RRI(sp);
  }else{ReceptorIndex.nativa =false;}


  return ReceptorIndex;
}

function setDRI(d){
  var weight = _.result(_.find(d.properties, {id:'fg'}), 'weight');
  if(weight){
    return weight/5;
  }else{
    return 3/5;
  }
}

function sameSp(donor, receptor){
  var taxD = donor.general.taxonomy.local;
  var taxR = receptor.general.taxonomy.local;
  var genusDonor = _.result(_.find(taxD , {id:'gen'}), 'name');
  var spDonor = _.result(_.find(taxD , {id:'sp'}), 'name');
  var genusRecept = _.result(_.find(taxR , {id:'gen'}), 'name');
  var spRecept = _.result(_.find(taxR , {id:'sp'}), 'name');
  if(genusDonor===genusRecept && spDonor===spRecept){
    return 1;
  }{
    return 0;
  }
}

module.exports = RiskIndex;
