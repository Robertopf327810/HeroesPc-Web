require('dotenv').config();
const sequelize = require('./src/libs/sequelize');

async function actualizarImagenes() {
  try {
    await sequelize.authenticate();
    const ProductoModel =
      sequelize.models.Producto ||
      sequelize.models.Productos ||
      Object.values(sequelize.models).find((m) => m.tableName === 'productos');

    const productos = await ProductoModel.findAll();
    let actualizados = 0;

    for (const prod of productos) {
      const nombre = (prod.nombre || '').toLowerCase();
      let nuevaUrl = prod.imagen_url;

      if (nombre.includes('intel') || nombre.includes('core i')) {
        nuevaUrl = 'https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=600&q=80';
      } else if (nombre.includes('ryzen') || nombre.includes('amd')) {
        nuevaUrl = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80';
      } else if (nombre.includes('rtx') || nombre.includes('geforce') || nombre.includes('nvidia')) {
        nuevaUrl = 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80';
      } else if (nombre.includes('radeon') || nombre.includes('rx ')) {
        nuevaUrl = 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80';
      }

      if (nuevaUrl !== prod.imagen_url) {
        await prod.update({ imagen_url: nuevaUrl });
        actualizados++;
      }
    }

    console.log(`Imágenes actualizadas en ${actualizados} productos.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

actualizarImagenes();