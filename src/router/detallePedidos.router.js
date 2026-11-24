const express = require('express');
const router = express.Router();
const detallePedidosController = require('../controller/detallePedidos.controller');

router
    .get('/', detallePedidosController.get)
    .get('/:id', detallePedidosController.getById)
    .post('/', detallePedidosController.create)
    .put('/:id', detallePedidosController.update)
    .delete('/:id', detallePedidosController._delete);

module.exports = router;