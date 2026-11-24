const express = require('express');
const router = express.Router();
const categoriasController = require('../controller/categorias.controller');

router
    .get('/', categoriasController.get)
    .get('/:id', categoriasController.getById)
    .post('/', categoriasController.create)
    .put('/:id', categoriasController.update)
    .delete('/:id', categoriasController._delete);

module.exports = router;