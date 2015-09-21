'use strict';

var _ = require('lodash');
var Pollinators = require('./pollinators.model');
var q = require('q');

//pagination
exports.pagination = function(req, res) {
  var items = req.params.items;
  var page = req.params.page;

  q.all(
    [
      Pollinators.find().count().exec(),
      Pollinators.find().sort('taxa').skip(items*(page-1)).limit(items).exec()
    ])
    .spread(function(count,currPageCont){
      //console.log(count);
      var respuesta = {
        totalItems:count,
        items:items,
        totalPages:Math.ceil(count/items),
        currentPage:page,
        pollinators:currPageCont
      };
      res.status(200).json(respuesta);
    })
    .fail(function(err){ console.log(err);});
};



// Get list of pollinatorss
exports.index = function(req, res) {
  Pollinators.find().limit(10).exec(function (err, pollinatorss) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(pollinatorss);
  });
};

// Get a single pollinators
exports.show = function(req, res) {
  Pollinators.findById(req.params.id, function (err, pollinators) {
    if(err) { return handleError(res, err); }
    if(!pollinators) { return res.status(404).send('Not Found'); }
    return res.json(pollinators);
  });
};

// Creates a new pollinators in the DB.
exports.create = function(req, res) {
  Pollinators.create(req.body, function(err, pollinators) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(pollinators);
  });
};

// Updates an existing pollinators in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Pollinators.findById(req.params.id, function (err, pollinators) {
    if (err) { return handleError(res, err); }
    if(!pollinators) { return res.status(404).send('Not Found'); }
    var updated = _.merge(pollinators, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(pollinators);
    });
  });
};

// Deletes a pollinators from the DB.
exports.destroy = function(req, res) {
  Pollinators.findById(req.params.id, function (err, pollinators) {
    if(err) { return handleError(res, err); }
    if(!pollinators) { return res.status(404).send('Not Found'); }
    pollinators.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}
