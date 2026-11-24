import { X, Trash2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, cart, onRemoveItem, onCheckout }) {
  const total = cart.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Tu Carrito ({cart.reduce((a, b) => a + b.cantidad, 0)})</h3>
          <button className="close-btn" type="button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <p className="empty-cart">Tu carrito está vacío. Explora nuestro hardware.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id_producto} className="cart-item">
                <div>
                  <strong>{item.nombre}</strong>
                  <div className="cart-item-sub">
                    {item.cantidad} x ${Number(item.precio).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="cart-item-right">
                  <strong>
                    ${(item.cantidad * Number(item.precio)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </strong>
                  <button
                    className="btn-trash"
                    type="button"
                    onClick={() => onRemoveItem(item.id_producto)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total a pagar:</span>
            <strong>
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
            </strong>
          </div>
          <button
            className="btn-checkout"
            type="button"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            Confirmar Pedido
          </button>
        </div>
      </aside>
    </>
  );
}