const express = require('express');
const router = express.Router();
const enviosController = require('../controller/envios.controller');

router
    .get('/', enviosController.get)
    .get('/:id', enviosController.getById)
    .post('/', enviosController.create)
    .put('/:id', enviosController.update)
    .delete('/:id', enviosController._delete);

module.exports = router;