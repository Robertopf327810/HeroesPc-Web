import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onRemoveItem,
  onCheckout,
}) {
  if (!isOpen) return null;

  const total = cart.reduce(
    (sum, item) => sum + Number(item.precio) * item.cantidad,
    0
  );

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h3>
            <ShoppingBag
              size={20}
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            />
            Tu Carrito ({cart.reduce((acc, item) => acc + item.cantidad, 0)})
          </h3>
          <button
            type="button"
            className="btn-close-drawer"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-items">
          {cart.length === 0 ? (
            <p className="empty-cart-msg">
              Tu carrito está vacío. Explora nuestro hardware.
            </p>
          ) : (
            cart.map((item) => (
              <div key={item.id_producto} className="drawer-item">
                <div className="drawer-item-info">
                  <h4>{item.nombre}</h4>
                  <span>
                    {item.cantidad} x $
                    {Number(item.precio).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-remove-item"
                  onClick={() => onRemoveItem(item.id_producto)}
                  title="Quitar producto"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="drawer-footer">
          <div className="drawer-total">
            <span>Total a pagar:</span>
            <strong>
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </strong>
          </div>
          <button
            type="button"
            className="btn-checkout"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Confirmar Pedido
          </button>
        </div>
      </aside>
    </div>
  );
}