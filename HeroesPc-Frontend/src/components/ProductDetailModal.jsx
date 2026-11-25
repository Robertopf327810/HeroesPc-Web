import { X, ShoppingCart, ShieldCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ProductDetailModal({ producto, onClose, onAddToCart }) {
  if (!producto) return null;

  const sinStock = Number(producto.stock) <= 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          color: '#0f172a',
          width: '94%',
          maxWidth: '760px',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          boxShadow: '0 24px 50px rgba(15, 23, 42, 0.35)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#0f172a',
          }}
        >
          <X size={20} />
        </button>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '290px',
            }}
          >
            <img
              src={
                producto.imagen_url ||
                'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'
              }
              alt={producto.nombre}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.5px',
              }}
            >
              {producto.sku}
            </span>

            <h2
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 800,
                lineHeight: 1.3,
                color: '#0f172a',
                paddingRight: '28px',
              }}
            >
              {producto.nombre}
            </h2>

            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#ea580c',
              }}
            >
              $
              {Number(producto.precio).toLocaleString('es-MX', {
                minimumFractionDigits: 2,
              })}{' '}
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                MXN
              </span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: sinStock ? '#dc2626' : '#16a34a',
              }}
            >
              {sinStock ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>
                {sinStock
                  ? 'Agotado temporalmente'
                  : `En stock inmediato (${producto.stock} unidades)`}
              </span>
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '0.84rem',
                color: '#334155',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '4px', color: '#0f172a' }}>
                Especificaciones / Descripción
              </strong>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                {producto.descripcion ||
                  'Componente de alto rendimiento seleccionado para ensambles HEROES PC.'}
              </p>
              <ul
                style={{
                  margin: '10px 0 0',
                  paddingLeft: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '0.8rem',
                  color: '#475569',
                }}
              >
                <li>Código de inventario: {producto.sku}</li>
                <li>Garantía: 12 meses directo con HEROES PC</li>
              </ul>
            </div>

            <button
              type="button"
              disabled={sinStock}
              onClick={() => {
                onAddToCart(producto);
                onClose();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                background: sinStock ? '#cbd5e1' : '#ea580c',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: sinStock ? 'not-allowed' : 'pointer',
              }}
            >
              <ShoppingCart size={18} />
              <span>{sinStock ? 'Sin stock disponible' : 'Agregar al carrito'}</span>
            </button>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                paddingTop: '8px',
                borderTop: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#64748b',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Truck size={15} color="#ea580c" />
                Envío gratis en compras mayores a $2,500 MXN
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={15} color="#16a34a" />
                Compra protegida y empaque antiestático
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}