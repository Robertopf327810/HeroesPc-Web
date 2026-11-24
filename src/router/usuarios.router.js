const express = require('express');
const router = express.Router();
const UsuariosController = require('../controller/usuarios.controller');

router
    .get('/', UsuariosController.get)
    .get('/:id', UsuariosController.getById)
    .post('/', UsuariosController.create)
    .put('/:id', UsuariosController.update)
    .delete('/:id', UsuariosController._delete);

module.exports = router;