const { Usuario, UsuarioSchema } = require('./usuario.model');
const { Categoria, CategoriaSchema } = require('./categoria.model');
const { Proveedor, ProveedorSchema } = require('./proveedor.model');
const { Producto, ProductoSchema } = require('./producto.model');
const { Pedido, PedidoSchema } = require('./pedido.model');
const { DetallePedido, DetallePedidoSchema } = require('./detallePedido.model');
const { Pago, PagoSchema } = require('./pago.model');
const { Envio, EnvioSchema } = require('./envio.model');

function setupModels(sequelize) {
  Usuario.init(UsuarioSchema, Usuario.config(sequelize));
  Categoria.init(CategoriaSchema, Categoria.config(sequelize));
  Proveedor.init(ProveedorSchema, Proveedor.config(sequelize));
  Producto.init(ProductoSchema, Producto.config(sequelize));
  Pedido.init(PedidoSchema, Pedido.config(sequelize));
  DetallePedido.init(DetallePedidoSchema, DetallePedido.config(sequelize));
  Pago.init(PagoSchema, Pago.config(sequelize));
  Envio.init(EnvioSchema, Envio.config(sequelize));

  const models = sequelize.models;
  Object.values(models).forEach((model) => {
    if (typeof model.associate === 'function') {
      model.associate(models);
    }
  });

  return models;
}

module.exports = setupModels;