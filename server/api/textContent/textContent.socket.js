/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var TextContent = require('./textContent.model');

exports.register = function(socket) {
  TextContent.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  TextContent.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('textContent:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('textContent:remove', doc);
}