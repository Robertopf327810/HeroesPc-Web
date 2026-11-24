const express = require('express');
const router = express.Router();
const ProveedoresController = require('../controller/proveedores.controller');

router
    .get('/', ProveedoresController.get)
    .get('/:id', ProveedoresController.getById)
    .post('/', ProveedoresController.create)
    .put('/:id', ProveedoresController.update)
    .delete('/:id', ProveedoresController._delete);

module.exports = router;