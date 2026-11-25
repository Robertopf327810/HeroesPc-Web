const { MercadoPagoConfig, Preference } = require('mercadopago');
const pagosService = require('../service/pagos.service');

const service = new pagosService();
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
});

const crearPreferencia = async (req, res) => {
  try {
    const { items, id_pedido } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Se requiere un arreglo válido de productos (items)',
      });
    }

    const preference = new Preference(mpClient);

    const response = await preference.create({
      body: {
        items: items.map((item) => ({
          id: String(item.id_producto || item.sku),
          title: item.nombre,
          quantity: Number(item.cantidad),
          unit_price: Number(item.precio),
          currency_id: 'MXN',
        })),
        external_reference: String(id_pedido || ''),
        back_urls: {
          success: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?pago=aprobado`,
          failure: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?pago=fallido`,
          pending: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?pago=pendiente`,
        },
        auto_return: 'approved',
      },
    });

    return res.json({
      success: true,
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: 'Error al generar preferencia de MercadoPago: ' + error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    if (!req.body.id_pedido || typeof req.body.id_pedido !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del pedido es requerido y debe ser un número' });
    }
    if (!req.body.metodo_pago || typeof req.body.metodo_pago !== 'string') {
      return res.status(400).send({ success: false, message: 'El método de pago es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.monto || typeof req.body.monto !== 'number') {
      return res.status(400).send({ success: false, message: 'El monto es requerido y debe ser un número' });
    }
    if (req.body.referencia_transaccion && typeof req.body.referencia_transaccion !== 'string') {
      return res.status(400).send({ success: false, message: 'La referencia de transacción debe ser una cadena de texto' });
    }
    const response = await service.create(req.body);
    res.json({ success: true, data: response });
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const get = async (req, res) => {
  try {
    const response = await service.findAll();
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const getById = async (req, res) => {
  try {
    const response = await service.findOne(req.params.id);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    if (!req.body.id_pedido || typeof req.body.id_pedido !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del pedido es requerido y debe ser un número' });
    }
    if (!req.body.metodo_pago || typeof req.body.metodo_pago !== 'string') {
      return res.status(400).send({ success: false, message: 'El método de pago es requerido y debe ser una cadena de texto' });
    }
    if (!req.body.monto || typeof req.body.monto !== 'number') {
      return res.status(400).send({ success: false, message: 'El monto es requerido y debe ser un número' });
    }
    if (req.body.referencia_transaccion && typeof req.body.referencia_transaccion !== 'string') {
      return res.status(400).send({ success: false, message: 'La referencia de transacción debe ser una cadena de texto' });
    }
    const response = await service.update(req.params.id, req.body);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

const _delete = async (req, res) => {
  try {
    const response = await service.delete(req.params.id);
    res.json(response);
  } catch (error) {
    return res.status(500).send({ success: false, message: error.message });
  }
};

module.exports = {
  crearPreferencia,
  create,
  get,
  getById,
  update,
  _delete,
};