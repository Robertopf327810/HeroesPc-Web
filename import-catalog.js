require('dotenv').config();
const sequelize = require('./src/libs/sequelize');

const BASE_DATASET_URL =
  'https://raw.githubusercontent.com/docyx/pc-part-dataset/main/data/json';

const CATALOG_SOURCES = [
  {
    categoria: 'Procesadores',
    file: 'cpu.json',
    prefix: 'CPU',
    limit: 60,
    image: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=500',
    filterFn: (item) =>
      item.name &&
      (item.name.toLowerCase().includes('amd') ||
        item.name.toLowerCase().includes('intel')),
    descFn: (item) =>
      [
        item.core_count ? `${item.core_count} núcleos` : null,
        item.core_clock ? `Base ${item.core_clock} GHz` : null,
        item.boost_clock ? `Boost ${item.boost_clock} GHz` : null,
        item.tdp ? `TDP ${item.tdp}W` : null,
        item.graphics ? `Gráficos: ${item.graphics}` : 'Sin gráficos integrados',
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Enfriamiento',
    file: 'cpu-cooler.json',
    prefix: 'COOL',
    limit: 25,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
    descFn: (item) =>
      [
        item.rpm ? `RPM: ${Array.isArray(item.rpm) ? item.rpm.join('-') : item.rpm}` : null,
        item.noise_level ? `Ruido: ${Array.isArray(item.noise_level) ? item.noise_level.join('-') : item.noise_level} dB` : null,
        item.size ? `Radiador: ${item.size}mm` : 'Enfriamiento por aire',
        item.color ? `Color: ${item.color}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Tarjetas Madre',
    file: 'motherboard.json',
    prefix: 'MB',
    limit: 35,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500',
    descFn: (item) =>
      [
        item.socket ? `Socket ${item.socket}` : null,
        item.form_factor ? `Formato ${item.form_factor}` : null,
        item.max_memory ? `Máx RAM ${item.max_memory}GB` : null,
        item.memory_slots ? `${item.memory_slots} ranuras RAM` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Memoria RAM',
    file: 'memory.json',
    prefix: 'RAM',
    limit: 30,
    image: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500',
    descFn: (item) =>
      [
        Array.isArray(item.speed) ? `DDR${item.speed[0]} ${item.speed[1]}MHz` : null,
        Array.isArray(item.modules) ? `${item.modules[0]}x${item.modules[1]}GB` : null,
        item.cas_latency ? `CL${item.cas_latency}` : null,
        item.color ? `Color: ${item.color}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Tarjetas Gráficas',
    file: 'video-card.json',
    prefix: 'GPU',
    limit: 35,
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500',
    descFn: (item) =>
      [
        item.chipset ? `Chipset ${item.chipset}` : null,
        item.memory ? `${item.memory}GB VRAM` : null,
        item.boost_clock ? `Boost ${item.boost_clock} MHz` : null,
        item.length ? `Largo ${item.length}mm` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Almacenamiento',
    file: 'internal-hard-drive.json',
    prefix: 'SSD',
    limit: 25,
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500',
    descFn: (item) =>
      [
        item.capacity ? `Capacidad ${item.capacity}GB` : null,
        item.type ? `Tipo ${item.type}` : null,
        item.form_factor ? `Factor ${item.form_factor}` : null,
        item.interface ? `Interfaz ${item.interface}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Fuentes de Poder',
    file: 'power-supply.json',
    prefix: 'PSU',
    limit: 25,
    image: 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=500',
    descFn: (item) =>
      [
        item.wattage ? `${item.wattage}W` : null,
        item.efficiency ? `Certificación 80+ ${item.efficiency.toUpperCase()}` : null,
        item.modular ? `Modular: ${item.modular}` : null,
        item.type ? `Formato ${item.type}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
  {
    categoria: 'Gabinetes',
    file: 'case.json',
    prefix: 'CASE',
    limit: 25,
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
    descFn: (item) =>
      [
        item.type ? `Formato ${item.type}` : null,
        item.color ? `Color ${item.color}` : null,
        item.side_panel ? `Panel ${item.side_panel}` : null,
      ]
        .filter(Boolean)
        .join(' | '),
  },
];

async function importarCatalogoCompleto() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const CategoriaModel =
      sequelize.models.Categoria ||
      sequelize.models.Categorias ||
      Object.values(sequelize.models).find((m) => m.tableName === 'categorias');

    const ProductoModel =
      sequelize.models.Producto ||
      sequelize.models.Productos ||
      Object.values(sequelize.models).find((m) => m.tableName === 'productos');

    const UsuarioModel =
      sequelize.models.Usuario ||
      sequelize.models.Usuarios ||
      Object.values(sequelize.models).find((m) => m.tableName === 'usuarios');

    const ProveedorModel =
      sequelize.models.Proveedor ||
      sequelize.models.Proveedores ||
      Object.values(sequelize.models).find((m) => m.tableName === 'proveedores');

    // 1. Garantizar un proveedor base para cumplir con id_proveedor NOT NULL
    let idProveedorBase = 1;
    if (ProveedorModel) {
      let proveedor = await ProveedorModel.findOne();
      if (!proveedor) {
        const provData = {};
        for (const [attrName, attrDef] of Object.entries(ProveedorModel.rawAttributes)) {
          if (attrDef.primaryKey || attrDef._autoGenerated) continue;
          if (attrName.includes('nombre')) provData[attrName] = 'HeroesPC Mayorista';
          else if (attrName.includes('contacto')) provData[attrName] = 'Distribuidor Oficial';
          else if (attrName.includes('email') || attrName.includes('correo'))
            provData[attrName] = 'compras@heroespc.com';
          else if (attrName.includes('telefono')) provData[attrName] = '4430000000';
          else if (attrName.includes('direccion')) provData[attrName] = 'Morelia, Michoacán';
          else if (attrDef.allowNull === false && attrDef.defaultValue === undefined) {
            provData[attrName] = 'N/A';
          }
        }
        proveedor = await ProveedorModel.create(provData);
      }
      idProveedorBase = proveedor.id_proveedor || proveedor.id || 1;
    }

    // 2. Garantizar cuenta administrador para pruebas del Panel Admin
    await UsuarioModel.findOrCreate({
      where: { email: 'admin@heroespc.com' },
      defaults: {
        nombre: 'Roberto Admin',
        email: 'admin@heroespc.com',
        password_hash: 'admin123',
        rol: 'admin',
      },
    });

    let totalInsertados = 0;

    for (const source of CATALOG_SOURCES) {
      const [catRecord] = await CategoriaModel.findOrCreate({
        where: { nombre_categoria: source.categoria },
        defaults: { nombre_categoria: source.categoria },
      });

      console.log(`Descargando ${source.categoria} (${source.file})...`);
      const res = await fetch(`${BASE_DATASET_URL}/${source.file}`);
      if (!res.ok) {
        console.warn(`No se pudo descargar ${source.file}: HTTP ${res.status}`);
        continue;
      }

      const rawItems = await res.json();
      const validItems = rawItems
        .filter((item) => {
          const hasPrice = Number(item.price) > 0;
          const passesCustom = source.filterFn ? source.filterFn(item) : Boolean(item.name);
          return hasPrice && passesCustom;
        })
        .slice(0, source.limit);

      let countCat = 0;

      for (let i = 0; i < validItems.length; i++) {
        const item = validItems[i];
        const cleanCode = item.name
          .replace(/[^a-zA-Z0-9]/g, '')
          .toUpperCase()
          .slice(0, 12);
        const sku = `${source.prefix}-${cleanCode}-${i + 1}`;
        const precioMxn = Math.round(Number(item.price) * 19.5);
        const descripcion =
          source.descFn(item) || `${source.categoria} de alto rendimiento`;

        const [, created] = await ProductoModel.findOrCreate({
          where: { sku },
          defaults: {
            sku,
            nombre: item.name,
            descripcion,
            precio: precioMxn,
            stock: Math.floor(Math.random() * 14) + 3,
            id_categoria: catRecord.id_categoria,
            id_proveedor: idProveedorBase,
            imagen_url: source.image,
          },
        });

        if (created) {
          countCat++;
          totalInsertados++;
        }
      }

      console.log(`  -> ${countCat} productos agregados en ${source.categoria}`);
    }

    console.log(`\nProceso finalizado. Total de productos nuevos insertados: ${totalInsertados}`);
    process.exit(0);
  } catch (error) {
    console.error('Error durante la importación:', error);
    process.exit(1);
  }
}

importarCatalogoCompleto();