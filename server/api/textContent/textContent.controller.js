'use strict';

var _ = require('lodash');
var TextContent = require('./textContent.model');

// Get list of textContents
exports.index = function(req, res) {
  TextContent.find(function (err, textContents) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(textContents);
  });
};

// Get a single textContent
exports.show = function(req, res) {
  TextContent.findById(req.params.id, function (err, textContent) {
    if(err) { return handleError(res, err); }
    if(!textContent) { return res.status(404).send('Not Found'); }
    return res.json(textContent);
  });
};

// Creates a new textContent in the DB.
exports.create = function(req, res) {
  TextContent.create(req.body, function(err, textContent) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(textContent);
  });
};

// Updates an existing textContent in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  TextContent.findById(req.params.id, function (err, textContent) {
    if (err) { return handleError(res, err); }
    if(!textContent) { return res.status(404).send('Not Found'); }
    var updated = _.merge(textContent, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(textContent);
    });
  });
};

// Deletes a textContent from the DB.
exports.destroy = function(req, res) {
  TextContent.findById(req.params.id, function (err, textContent) {
    if(err) { return handleError(res, err); }
    if(!textContent) { return res.status(404).send('Not Found'); }
    textContent.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}