'use strict';

var express = require('express');
var controller = require('./pollinators.controller');

var router = express.Router();

router.get('/search/:name', controller.search);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/:page/:items', controller.pagination);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
