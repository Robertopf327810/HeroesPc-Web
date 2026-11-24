const express = require('express');
const router = express.Router();
const pagosController = require('../controller/pagos.controller');

router
    .get('/', pagosController.get)
    .get('/:id', pagosController.getById)
    .post('/', pagosController.create)
    .put('/:id', pagosController.update)
    .delete('/:id', pagosController._delete);

module.exports = router;