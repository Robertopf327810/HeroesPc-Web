import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft, Package, Tag } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function AdminPanel({
  productos,
  categorias,
  onBackToStore,
  onDataUpdated,
}) {
  const [tab, setTab] = useState('productos'); // 'productos' | 'categorias'
  const [proveedores, setProveedores] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Estado del formulario de Producto
  const [formProd, setFormProd] = useState({
    id_categoria: '',
    id_proveedor: '',
    sku: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen_url: '',
  });

  // Estado del formulario de Categoría
  const [formCat, setFormCat] = useState({
    nombre_categoria: '',
    descripcion: '',
  });

  useEffect(() => {
    fetch(`${API_URL}/proveedores`)
      .then((res) => res.json())
      .then((data) => setProveedores(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error cargando proveedores:', err));
  }, []);

  const resetProdForm = () => {
    setEditingId(null);
    setFormProd({
      id_categoria: categorias[0]?.id_categoria || '',
      id_proveedor: proveedores[0]?.id_proveedor || '',
      sku: '',
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      imagen_url: '',
    });
  };

  useEffect(() => {
    if (!editingId) {
      setFormProd((prev) => ({
        ...prev,
        id_categoria: prev.id_categoria || categorias[0]?.id_categoria || '',
        id_proveedor: prev.id_proveedor || proveedores[0]?.id_proveedor || '',
      }));
    }
  }, [categorias, proveedores, editingId]);

  const handleEditClick = (prod) => {
    setEditingId(prod.id_producto);
    setFormProd({
      id_categoria: prod.id_categoria,
      id_proveedor: prod.id_proveedor,
      sku: prod.sku,
      nombre: prod.nombre,
      descripcion: prod.descripcion || '',
      precio: prod.precio,
      stock: prod.stock,
      imagen_url: prod.imagen_url || '',
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formProd,
      id_categoria: Number(formProd.id_categoria),
      id_proveedor: Number(formProd.id_proveedor),
      precio: Number(formProd.precio),
      stock: Number(formProd.stock),
      activo: true,
    };

    try {
      const url = editingId
        ? `${API_URL}/productos/${editingId}`
        : `${API_URL}/productos`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('No se pudo guardar el producto');

      resetProdForm();
      onDataUpdated();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
      onDataUpdated();
    } catch (error) {
      alert('Error al eliminar producto');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCat),
      });
      if (!res.ok) throw new Error('Error al crear categoría');
      setFormCat({ nombre_categoria: '', descripcion: '' });
      onDataUpdated();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container admin-container">
      <div className="admin-top-bar">
        <div>
          <h2>Panel de Administración — HEROES PC</h2>
          <p>Gestiona el inventario de hardware, precios y categorías en PostgreSQL</p>
        </div>
        <button type="button" className="btn-back-store" onClick={onBackToStore}>
          <ArrowLeft size={18} />
          <span>Volver a la Tienda</span>
        </button>
      </div>

      {/* Pestañas */}
      <div className="admin-tabs">
        <button
          type="button"
          className={`admin-tab ${tab === 'productos' ? 'active' : ''}`}
          onClick={() => setTab('productos')}
        >
          <Package size={18} />
          <span>Productos ({productos.length})</span>
        </button>
        <button
          type="button"
          className={`admin-tab ${tab === 'categorias' ? 'active' : ''}`}
          onClick={() => setTab('categorias')}
        >
          <Tag size={18} />
          <span>Categorías ({categorias.length})</span>
        </button>
      </div>

      {tab === 'productos' ? (
        <div className="admin-grid">
          {/* Formulario Alta / Edición */}
          <div className="admin-card">
            <h3>{editingId ? `Editar Producto #${editingId}` : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSaveProduct} className="auth-form">
              <div className="form-group">
                <label>Nombre del producto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Procesador AMD Ryzen 5 5600X"
                  value={formProd.nombre}
                  onChange={(e) => setFormProd({ ...formProd, nombre: e.target.value })}
                />
              </div>

              <div className="card-two-cols">
                <div className="form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="CPU-AMD-5600X"
                    value={formProd.sku}
                    onChange={(e) => setFormProd({ ...formProd, sku: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    required
                    value={formProd.id_categoria}
                    onChange={(e) =>
                      setFormProd({ ...formProd, id_categoria: e.target.value })
                    }
                  >
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre_categoria}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Proveedor *</label>
                <select
                  required
                  value={formProd.id_proveedor}
                  onChange={(e) =>
                    setFormProd({ ...formProd, id_proveedor: e.target.value })
                  }
                >
                  {proveedores.map((p) => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>
                      {p.nombre_empresa}
                    </option>
                  ))}
                </select>
              </div>

              <div className="card-two-cols">
                <div className="form-group">
                  <label>Precio (MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="3299.00"
                    value={formProd.precio}
                    onChange={(e) => setFormProd({ ...formProd, precio: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Stock disponible *</label>
                  <input
                    type="number"
                    required
                    placeholder="10"
                    value={formProd.stock}
                    onChange={(e) => setFormProd({ ...formProd, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL de Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formProd.imagen_url}
                  onChange={(e) =>
                    setFormProd({ ...formProd, imagen_url: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Descripción técnica</label>
                <textarea
                  rows="2"
                  placeholder="Especificaciones clave..."
                  value={formProd.descripcion}
                  onChange={(e) =>
                    setFormProd({ ...formProd, descripcion: e.target.value })
                  }
                />
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="btn-auth-submit" disabled={loading}>
                  <Plus size={16} />
                  <span>{editingId ? 'Guardar Cambios' : 'Agregar Producto'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="btn-cancel-edit"
                    onClick={resetProdForm}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tabla de Inventario */}
          <div className="admin-card table-wrapper">
            <h3>Inventario Actual</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id_producto}>
                    <td className="td-prod">
                      <img
                        src={p.imagen_url || 'https://via.placeholder.com/40'}
                        alt={p.nombre}
                      />
                      <span>{p.nombre}</span>
                    </td>
                    <td>{p.sku}</td>
                    <td>
                      ${Number(p.precio).toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span className={`stock-pill ${p.stock > 0 ? 'ok' : 'low'}`}>
                        {p.stock} uds
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="btn-table-edit"
                          title="Editar"
                          onClick={() => handleEditClick(p)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-table-del"
                          title="Eliminar"
                          onClick={() => handleDeleteProduct(p.id_producto)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="admin-grid">
          <div className="admin-card">
            <h3>Nueva Categoría</h3>
            <form onSubmit={handleSaveCategory} className="auth-form">
              <div className="form-group">
                <label>Nombre de categoría *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gabinetes, Monitores, Enfriamiento..."
                  value={formCat.nombre_categoria}
                  onChange={(e) =>
                    setFormCat({ ...formCat, nombre_categoria: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  rows="3"
                  placeholder="Descripción breve..."
                  value={formCat.descripcion}
                  onChange={(e) =>
                    setFormCat({ ...formCat, descripcion: e.target.value })
                  }
                />
              </div>
              <button type="submit" className="btn-auth-submit" disabled={loading}>
                Crear Categoría
              </button>
            </form>
          </div>

          <div className="admin-card table-wrapper">
            <h3>Categorías Registradas</h3>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id_categoria}>
                    <td>#{c.id_categoria}</td>
                    <td>
                      <strong>{c.nombre_categoria}</strong>
                    </td>
                    <td>{c.descripcion || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}