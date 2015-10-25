'use strict';

var express = require('express');
var controller = require('./cFrame.controller.js');

var router = express.Router();

router.get('/', controller.index);
router.get('/:url', controller.getIframe);
module.exports = router;
