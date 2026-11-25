require('dotenv').config();
const sequelize = require('./src/libs/sequelize');

async function crearServicioEnsamblaje() {
  try {
    await sequelize.authenticate();
    const ProductoModel =
      sequelize.models.Producto ||
      sequelize.models.Productos ||
      Object.values(sequelize.models).find((m) => m.tableName === 'productos');

    const CategoriaModel =
      sequelize.models.Categoria ||
      sequelize.models.Categorias ||
      Object.values(sequelize.models).find((m) => m.tableName === 'categorias');

    const ProveedorModel =
      sequelize.models.Proveedor ||
      sequelize.models.Proveedores ||
      Object.values(sequelize.models).find((m) => m.tableName === 'proveedores');

    const cat = await CategoriaModel.findOne();
    const prov = ProveedorModel ? await ProveedorModel.findOne() : null;

    await ProductoModel.findOrCreate({
      where: { sku: 'SRV-BUILD-01' },
      defaults: {
        sku: 'SRV-BUILD-01',
        nombre: 'Ensamblaje Profesional + Gestión de Cables e Instalación SO',
        descripcion:
          'Armado completo por técnicos certificados, actualización de BIOS, pruebas de estrés y gestión limpia de cableado.',
        precio: 499,
        stock: 999,
        id_categoria: cat ? cat.id_categoria : 1,
        id_proveedor: prov ? prov.id_proveedor || prov.id : 1,
        imagen_url:
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
      },
    });

    console.log('Servicio SRV-BUILD-01 listo en PostgreSQL.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

crearServicioEnsamblaje();