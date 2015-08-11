'use strict';

var _ = require('lodash');
var q = require('q');
var Flora = require('./flora.model');
var RiskModel = require('./RiskCalc/calc/modelo.js');
var CultCult = require('./RiskCalc/models/cultivo-cultivo.js');
var IntroCult = require('./RiskCalc/models/cultivo-introducida.js');
var NatCult = require('./RiskCalc/models/cultivo-nativa.js');

var Cultivo = new RiskModel(CultCult);
var Introducida = new RiskModel(IntroCult);
var Nativa = new RiskModel(NatCult);

// Get list of floras
exports.index = function(req, res) {
  Flora.find(function (err, floras) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(floras);
  });
};

// Get a single flora
exports.show = function(req, res) {
  Flora.findById(req.params.id, function (err, flora) {
    if(err) { return handleError(res, err); }
    if(!flora) { return res.status(404).send('Not Found'); }
    return res.json(flora);
  });
};

// Creates a new flora in the DB.
exports.create = function(req, res) {
  Flora.create(req.body, function(err, flora) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(flora);
  });
};

// Updates an existing flora in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Flora.findById(req.params.id, function (err, flora) {
    if (err) { return handleError(res, err); }
    if(!flora) { return res.status(404).send('Not Found'); }
    var updated = _.merge(flora, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(flora);
    });
  });
};

// Deletes a flora from the DB.
exports.destroy = function(req, res) {
  Flora.findById(req.params.id, function (err, flora) {
    if(err) { return handleError(res, err); }
    if(!flora) { return res.status(404).send('Not Found'); }
    flora.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

// Search in name field
// Get a single flora
exports.search = function(req, res) {
  var name = new RegExp(req.params.name, "i");
  var query = Flora.find({name: name,"properties.id":"cult"});
  query.limit(8);
  query.select('_id name');
  query.exec(function(err, flora){
    if(err){return handleError(res,err);}
    if(!flora) { return res.send(404); }
    return res.json(flora);
  });

};

exports.matchById = function(req, res) {
  // 3 tipos de match bio, coex y all
  var id = req.params.id;
  console.log(id);
  var typeVar = req.params.type;
  console.log(typeVar);
  var type = evalTypeToPropertyQuery(typeVar);
  console.log(type);

  Flora.findById(id)
    .exec(function(err,flora){
      if(err) { return handleError(res, err); }
      if(!flora) { return res.status(404).send('Not Found sp with this _id: '+id); }
      console.log(flora.name);

      return flora;
    })
    .then(function(flora,err){
      if(err) { return handleError(res, err); }
      if(!flora) { return res.status(404).send('Not Found sp with this _id: '+id); }

      var genus = flora.toObject().general.taxonomy.local.filter(function(s){
        return s.id=="gen";
      })[0].name;
      console.log(genus);
      return genus;
    })
    .then(function(genus){
      var query =  [
        {
          "$match" : type
        },
        {
          "$unwind":"$general.taxonomy.local"
        },
        {
          "$match" : {"general.taxonomy.local.id":"gen"}
        },
        {
          "$match" : {"general.taxonomy.local.name":genus}
        },
        {
          "$group":{_id:"$_id"}
        }
      ];
      console.log(query);
      //return res.json(query);
      return query;

    })
    .then(function(query,err){
      if(err){return handleError(res,err);}
      //console.log(query);
      return  Flora.aggregate(query).exec();
    })
    .then(function(ids, err){
      console.log(ids.length);
      var ides = ids;
      if(err){return handleError(res,err);}
      if(!ides) { res.status(404).send('The variable is false, not set or undefined'); }
      if(ides.length==0){
        res.status(200).json([]);
        return 'empty';
      }else{
        return {"$or":ids};
      }
    })
    .then(function(query){
      if(query==='empty'){return};
      if(!query) { return res.send(404); }
      return Flora.find(query).exec();
    })
    .then(function(flora, err){

      if(!flora){return;}
      if(err){return handleError(res,err);}
      var RRI = flora.map(function(sp){
        var espe= sp.toObject();
        return setRRI(espe);
      });
      return res.json(RRI);

    });


/*
  function getGenus(id){
    var deferred = q.defer();

    Flora.findById(id,function(err,flora){
      if(err) { return handleError(res, err); }
      if(!flora) { return res.status(404).send('Not Found sp with this _id: '+id); }

      var genus = flora.toObject().general.taxonomy.local.filter(function(s){
        return s.id=="gen";
      })[0].name;
      deferred.resolve(genus);
    });
    return deferred.promise;
  }

  function idRelatives (genus){
    var deferred = q.defer();
    var query = Flora.aggregate(
      [
        {
          "$match" : type
        },
        {
          "$unwind":"$general.taxonomy.local"
        },
        {
          "$match" : {"general.taxonomy.local.id":"gen"}
        },
        {
          "$match" : {"general.taxonomy.local.name":genus}
        },
        {
          "$group":{_id:"$_id"}
        }
      ]
    );
    query.exec(function(err, flora){
      if(err){return handleError(res,err);}
      if(!flora) { return res.send(404); }
      deferred.resolve(flora);
    });
    return deferred.promise;
  }

  function findRelatives (arrayIds){
    if(!arrayIds) { return res.send(404); }
    if(arrayIds.length===0) { return res.json([]); }

    var deferred = q.defer();
    var query = {"$or":arrayIds};

    Flora.find(query).exec(function(err, flora){
      if(err){return handleError(res,err);}
      if(!flora) { return res.send(404); }
      deferred.resolve(flora);
    });
    return deferred.promise;
  }

  function makeResponse(){
    return id;
  }

  q.fcall(makeResponse)
    .then(getGenus)
    .then(idRelatives)
    .then(findRelatives)
    .then(function(flora){
    res.json(flora);

  });
*/

};

function setRRI(sp){
  sp.RRI = {};

  if(sp.properties.filter(function(p){return p.id=='in'}).length==1){
    sp.RRI.introducida = Introducida.RRI(sp);
  }

  if(sp.properties.filter(function(p){return p.id=='cultc'}).length==1){
    sp.RRI.cultivada = Cultivo.RRI(sp);
  }
  if(sp.properties.filter(function(p){return p.id=='nati';}).length ==1){
    sp.RRI.nativa = Nativa.RRI(sp);
  }

  return sp;
}

exports.matchByGenus = function(req, res) {
  // 3 tipos de match bio, coex y all
  var genus = req.params.genus;
  var typeVar = req.params.type;
  var type = evalTypeToPropertyQuery(typeVar);

  if(!type){ res.status(404).send('Is not set the evaluation type');}
  if(!genus){ res.status(404).send('Is not set the genus');}

  var query = [
    {
      "$match" : type
    },
    {
      "$unwind":"$general.taxonomy.local"
    },
    {
      "$match" : {"general.taxonomy.local.id":"gen"}
    },
    {
      "$match" : {"general.taxonomy.local.name":genus}
    },
    {
      "$group":{_id:"$_id"}
    }
  ];

  Flora.aggregate(query)
    .exec(function(err, flora){

      if(err){return handleError(res,err);}
      if(!flora) { res.status(404).send('The variable is false, not set or undefined'); }
      if(flora.length===0){return res.status(404).send('No match with this genus: ' + genus);}

      return flora;
    })
    .then(function (flora,err){

      if(err){return handleError(res,err);}
      if(!flora) { return res.send(404); }

      return {"$or":flora};
    })
    .then(function(query){

      return Flora.find(query).exec();
    })
    .then(function(err, flora){

      if(err){return handleError(res,err);}
      if(!flora) { return res.send(404); }

      return res.json(flora);
    });
};


function handleError(res, err) {
  console.log('Se ha ejecutado el handleError');
  return res.status(500).send(err);
}

var evalTypeToPropertyQuery = function (et){
  var type = {};
  if(et==='coex'){
    type = {"properties.id":"cultc"};
  }else if(et==='bio'){
    type = {$or:[
      {"properties.id":"in"},
      {"properties.id":"nati"}
    ]};
  }else if(et ==='all'){
    type = {$or:[
      {"properties.id":"cultc"},
      {"properties.id":"in"},
      {"properties.id":"nati"}
    ]};
  }else{
    return false;
  }

  return type;
};











