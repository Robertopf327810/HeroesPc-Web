import { useState, useEffect } from 'react';
import { X, ShoppingCart, ShieldCheck, Truck, Cpu, CheckCircle2 } from 'lucide-react';

export default function ProductDetailModal({
  producto,
  onClose,
  onAddToCart,
}) {
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    setCantidad(1);
  }, [producto]);

  if (!producto) return null;

  const hasStock = producto.stock > 0;
  const img =
    producto.imagen_url || 'https://via.placeholder.com/300x300?text=Hardware+PC';

  const handleAddMultiple = () => {
    for (let i = 0; i < cantidad; i++) {
      onAddToCart(producto);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="detail-close-btn"
          aria-label="Cerrar detalle"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <div className="detail-grid">
          {/* Columna Izquierda: Imagen */}
          <div className="detail-img-stage">
            <img src={img} alt={producto.nombre} />
          </div>

          {/* Columna Derecha: Especificaciones y Compra */}
          <div className="detail-info">
            <div className="detail-badges">
              {producto.categoria && (
                <span className="detail-cat-badge">
                  {producto.categoria.nombre_categoria}
                </span>
              )}
              <span className="detail-sku">SKU: {producto.sku}</span>
            </div>

            <h2 className="detail-title">{producto.nombre}</h2>

            <div className="detail-price-box">
              <span className="detail-price">
                $
                {Number(producto.precio).toLocaleString('es-MX', {
                  minimumFractionDigits: 2,
                })}{' '}
                <small>MXN</small>
              </span>
              <span className="detail-tax">IVA incluido</span>
            </div>

            <div className={`detail-stock ${hasStock ? 'in' : 'out'}`}>
              <CheckCircle2 size={16} />
              <span>
                {hasStock
                  ? `Disponible para envío inmediato (${producto.stock} unidades)`
                  : 'Producto agotado temporalmente'}
              </span>
            </div>

            {/* Ficha Técnica / Descripción */}
            <div className="detail-specs-box">
              <h4>
                <Cpu size={16} />
                <span>Especificaciones y Descripción</span>
              </h4>
              <p>
                {producto.descripcion ||
                  'Componente de hardware original con garantía oficial del fabricante y compatibilidad verificada por HEROES PC.'}
              </p>

              <ul className="detail-tech-list">
                <li>
                  <strong>Código de inventario:</strong> {producto.sku}
                </li>
                {producto.proveedor && (
                  <li>
                    <strong>Distribuidor / Marca:</strong>{' '}
                    {producto.proveedor.nombre_empresa}
                  </li>
                )}
                <li>
                  <strong>Garantía:</strong> 12 meses directo con HEROES PC
                </li>
              </ul>
            </div>

            {/* Selector de Cantidad y Botón de Carrito */}
            {hasStock && (
              <div className="detail-buy-row">
                <div className="qty-selector">
                  <button
                    type="button"
                    onClick={() => setCantidad((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span>{cantidad}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCantidad((q) => Math.min(producto.stock, q + 1))
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-detail-add"
                  onClick={handleAddMultiple}
                >
                  <ShoppingCart size={18} />
                  <span>Agregar al carrito</span>
                </button>
              </div>
            )}

            <div className="detail-perks">
              <div>
                <Truck size={15} />
                <span>Envío gratis en compras mayores a $2,500 MXN</span>
              </div>
              <div>
                <ShieldCheck size={15} />
                <span>Compra protegida y empaque antiestático</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}