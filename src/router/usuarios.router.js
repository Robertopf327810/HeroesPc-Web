const express = require('express');
const router = express.Router();
const UsuariosController = require('../controller/usuarios.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router
  .post('/login', UsuariosController.login)
  .post('/google', UsuariosController.googleLogin)
  .post('/logout', UsuariosController.logout)
  .get('/me', verifyToken, UsuariosController.me)
  .get('/', UsuariosController.get)
  .get('/:id', UsuariosController.getById)
  .post('/', UsuariosController.create)
  .put('/:id', UsuariosController.update)
  .delete('/:id', UsuariosController._delete);

module.exports = router;