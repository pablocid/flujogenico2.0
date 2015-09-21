'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PollinatorsSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
},{ collection: 'Pollinators' });

module.exports = mongoose.model('Pollinators', PollinatorsSchema);
