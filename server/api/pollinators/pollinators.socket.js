/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Pollinators = require('./pollinators.model');

exports.register = function(socket) {
  Pollinators.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Pollinators.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('pollinators:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('pollinators:remove', doc);
}