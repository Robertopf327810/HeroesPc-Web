const express = require('express');
const router = express.Router();
const pedidosController = require('../controller/pedidos.controller');

router
    .get('/', pedidosController.get)
    .get('/:id', pedidosController.getById)
    .post('/', pedidosController.create)
    .put('/:id', pedidosController.update)
    .delete('/:id', pedidosController._delete);

module.exports = router;