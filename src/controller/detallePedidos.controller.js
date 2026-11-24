const detallePedidosService = require('../service/detallePedidos.service');
const service = new detallePedidosService();

const create = async (req, res) => {
  try {
    //verifica que el id_pedido, id_producto, cantidad y precio_unitario no esten vacios y sean numeros
    if (!req.body.id_pedido || typeof req.body.id_pedido !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del pedido es requerido y debe ser un número' });
    }
    if (!req.body.id_producto || typeof req.body.id_producto !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del producto es requerido y debe ser un número' });
    }
    if (!req.body.cantidad || typeof req.body.cantidad !== 'number') {
      return res.status(400).send({ success: false, message: 'La cantidad es requerida y debe ser un número' });
    }
    if (!req.body.precio_unitario || typeof req.body.precio_unitario !== 'number') {
      return res.status(400).send({ success: false, message: 'El precio unitario es requerido y debe ser un número' });
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
    //verifica que el id_pedido, id_producto, cantidad y precio_unitario no esten vacios y sean numeros
    if (!req.body.id_pedido || typeof req.body.id_pedido !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del pedido es requerido y debe ser un número' });
    }
    if (!req.body.id_producto || typeof req.body.id_producto !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del producto es requerido y debe ser un número' });
    }
    if (!req.body.cantidad || typeof req.body.cantidad !== 'number') {
      return res.status(400).send({ success: false, message: 'La cantidad es requerida y debe ser un número' });
    }
    if (!req.body.precio_unitario || typeof req.body.precio_unitario !== 'number') {
      return res.status(400).send({ success: false, message: 'El precio unitario es requerido y debe ser un número' });
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
  create,
  get,
  getById,
  update,
  _delete,
};