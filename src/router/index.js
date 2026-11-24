const express = require('express');

const usuariosRouter = require('./usuarios.router');
const categoriasRouter = require('./categorias.router');
const proveedoresRouter = require('./proveedores.router');
const productosRouter = require('./productos.router');
const pedidosRouter = require('./pedidos.router');
const detallePedidosRouter = require('./detallePedidos.router');
const pagosRouter = require('./pagos.router');
const enviosRouter = require('./envios.router');

function routerApi(app) {
  const router = express.Router();
  app.use('/api', router);

  router.use('/usuarios', usuariosRouter);
  router.use('/categorias', categoriasRouter);
  router.use('/proveedores', proveedoresRouter);
  router.use('/productos', productosRouter);
  router.use('/pedidos', pedidosRouter);
  router.use('/detalle-pedidos', detallePedidosRouter);
  router.use('/pagos', pagosRouter);
  router.use('/envios', enviosRouter);
}

module.exports = routerApi;