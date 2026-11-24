const pedidosService = require('../service/pedidos.service');
const service = new pedidosService();

const create = async (req, res) => {
  try {
    //verifica que el id_cliente, fecha_pedido, total y estado no esten vacios y sean string
    if (!req.body.id_cliente || typeof req.body.id_cliente !== 'number') {
      return res.status(400).send({ success: false, message: 'El id del cliente es requerido y debe ser un número' });
    }
    if (!req.body.fecha_pedido || typeof req.body.fecha_pedido !== 'string') {
      return res.status(400).send({ success: false, message: 'La fecha del pedido es requerida y debe ser una cadena de texto' });
    }
    if (!req.body.total || typeof req.body.total !== 'number') {
      return res.status(400).send({ success: false, message: 'El total es requerido y debe ser un número' });
    }
    if (!req.body.estado || typeof req.body.estado !== 'string') {
      return res.status(400).send({ success: false, message: 'El estado es requerido y debe ser una cadena de texto' });
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