'use strict';

var express = require('express');
var controller = require('./flora.controller');

var router = express.Router();

router.get('/search/:name', controller.search);
router.get('/match/:id/:type', controller.matchById);
router.get('/match-genus/:genus/:type', controller.matchByGenus);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
