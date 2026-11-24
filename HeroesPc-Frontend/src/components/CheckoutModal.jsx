import { useState } from 'react';
import { X, CreditCard, ShieldCheck, Wallet } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onOrderSuccess,
}) {
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // 'tarjeta' | 'mercadopago'
  const [tipoTarjeta, setTipoTarjeta] = useState('credito'); // 'credito' | 'debito'
  const [nombreTitular, setNombreTitular] = useState(user?.nombre || '');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');
  const [direccionEnvio, setDireccionEnvio] = useState(user?.direccion || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );
  const envio = subtotal >= 2500 ? 0 : 149;
  const total = subtotal + envio;

  // Detecta automáticamente la franquicia de la tarjeta
  const detectCardBrand = (num) => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]|^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^6/.test(clean)) return 'Carnet / Discover';
    return 'Tarjeta Bancaria';
  };

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!direccionEnvio.trim()) {
      setError('Ingresa una dirección de entrega válida.');
      return;
    }

    if (metodoPago === 'tarjeta') {
      const cleanCard = numeroTarjeta.replace(/\s+/g, '');
      if (cleanCard.length < 15) {
        setError('Ingresa un número de tarjeta válido (15 o 16 dígitos).');
        return;
      }
      if (expiracion.length < 5 || cvv.length < 3) {
        setError('Verifica la fecha de expiración y el código CVV.');
        return;
      }
    }

    setLoading(true);

    try {
      // 1. Crear el Pedido en POST /api/pedidos
      const resPedido = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user.id_usuario,
          total: total.toFixed(2),
          estado: 'pagado',
          direccion_envio: direccionEnvio,
        }),
      });
      const pedidoData = await resPedido.json();
      if (!resPedido.ok || pedidoData.success === false) {
        throw new Error(pedidoData.message || 'No se pudo generar el pedido');
      }

      const pedidoCreado = pedidoData.data || pedidoData;
      const idPedido = pedidoCreado.id_pedido;

      // 2. Registrar cada producto en POST /api/detalle-pedidos y descontar stock en PUT /api/productos/:id
      for (const item of cart) {
        await fetch(`${API_URL}/detalle-pedidos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_pedido: idPedido,
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio_unitario: Number(item.precio).toFixed(2),
            subtotal: (Number(item.precio) * item.cantidad).toFixed(2),
          }),
        });

        const nuevoStock = Math.max(0, Number(item.stock) - item.cantidad);
        await fetch(`${API_URL}/productos/${item.id_producto}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: nuevoStock }),
        });
      }

      // 3. Registrar el Pago en POST /api/pagos
      const brand = detectCardBrand(numeroTarjeta);
      const last4 = numeroTarjeta.replace(/\s+/g, '').slice(-4);
      const descripcionMetodo =
        metodoPago === 'mercadopago'
          ? 'Mercado Pago (Tarjeta / Saldo MP)'
          : `Tarjeta ${tipoTarjeta === 'credito' ? 'Crédito' : 'Débito'} ${brand} ****${last4}`;

      await fetch(`${API_URL}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pedido: idPedido,
          metodo_pago: descripcionMetodo,
          monto: total.toFixed(2),
          estado_pago: 'completado',
          referencia_transaccion: `TXN-${Date.now()}`,
        }),
      });

      // 4. Crear el registro inicial de Envío en POST /api/envios
      await fetch(`${API_URL}/envios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_pedido: idPedido,
          paqueteria: 'Estafeta / DHL Express',
          numero_guia: `HPC-${Math.floor(100000 + Math.random() * 900000)}`,
          estado_envio: 'preparando',
          direccion_entrega: direccionEnvio,
        }),
      });

      onOrderSuccess(idPedido, descripcionMetodo);
      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h3>Finalizar Compra Segura</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selector de Método de Pago */}
        <div className="payment-tabs">
          <button
            type="button"
            className={`pay-tab ${metodoPago === 'tarjeta' ? 'active' : ''}`}
            onClick={() => setMetodoPago('tarjeta')}
          >
            <CreditCard size={18} />
            <span>Tarjeta Crédito / Débito</span>
          </button>

          <button
            type="button"
            className={`pay-tab mp ${metodoPago === 'mercadopago' ? 'active' : ''}`}
            onClick={() => setMetodoPago('mercadopago')}
          >
            <Wallet size={18} />
            <span>Mercado Pago</span>
          </button>
        </div>

        <form onSubmit={handlePayment} className="auth-form">
          <div className="form-group">
            <label>Dirección de entrega *</label>
            <input
              type="text"
              required
              placeholder="Calle, número, colonia, C.P., ciudad"
              value={direccionEnvio}
              onChange={(e) => setDireccionEnvio(e.target.value)}
            />
          </div>

          {metodoPago === 'tarjeta' ? (
            <>
              <div className="card-badges-row">
                <span className="brand-chip">VISA</span>
                <span className="brand-chip">Mastercard</span>
                <span className="brand-chip">AMEX</span>
                <span className="brand-chip">Carnet</span>
                <span className="detected-brand">
                  {numeroTarjeta ? detectCardBrand(numeroTarjeta) : ''}
                </span>
              </div>

              <div className="card-type-row">
                <label className="radio-pill">
                  <input
                    type="radio"
                    name="tipoTarjeta"
                    checked={tipoTarjeta === 'credito'}
                    onChange={() => setTipoTarjeta('credito')}
                  />
                  Tarjeta de Crédito
                </label>
                <label className="radio-pill">
                  <input
                    type="radio"
                    name="tipoTarjeta"
                    checked={tipoTarjeta === 'debito'}
                    onChange={() => setTipoTarjeta('debito')}
                  />
                  Tarjeta de Débito
                </label>
              </div>

              <div className="form-group">
                <label>Nombre del titular *</label>
                <input
                  type="text"
                  required
                  placeholder="Como aparece en la tarjeta"
                  value={nombreTitular}
                  onChange={(e) => setNombreTitular(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Número de tarjeta *</label>
                <input
                  type="text"
                  required
                  placeholder="0000 0000 0000 0000"
                  value={numeroTarjeta}
                  onChange={(e) =>
                    setNumeroTarjeta(formatCardNumber(e.target.value))
                  }
                />
              </div>

              <div className="card-two-cols">
                <div className="form-group">
                  <label>Expiración (MM/AA) *</label>
                  <input
                    type="text"
                    required
                    placeholder="08/29"
                    value={expiracion}
                    onChange={(e) =>
                      setExpiracion(formatExpiry(e.target.value))
                    }
                  />
                </div>
                <div className="form-group">
                  <label>CVV *</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="mp-box">
              <p className="mp-title">Paga con tu cuenta o tarjeta de Mercado Pago</p>
              <p className="mp-desc">
                Acepta tarjeta de débito Mercado Pago, saldo disponible en tu cuenta o tarjetas guardadas con acreditación inmediata.
              </p>
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Número de tarjeta Mercado Pago (opcional si usas saldo)</label>
                <input
                  type="text"
                  placeholder="4000 0000 0000 0000"
                  value={numeroTarjeta}
                  onChange={(e) =>
                    setNumeroTarjeta(formatCardNumber(e.target.value))
                  }
                />
              </div>
            </div>
          )}

          {/* Resumen de Cobro */}
          <div className="checkout-summary">
            <div>
              <span>Subtotal ({cart.reduce((a, b) => a + b.cantidad, 0)} art.):</span>
              <span>
                ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span>Envío asegurado:</span>
              <span>
                {envio === 0
                  ? 'GRATIS'
                  : `$${envio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              </span>
            </div>
            <div className="summary-total">
              <strong>Total a pagar:</strong>
              <strong>
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </strong>
            </div>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className={`btn-pay-submit ${metodoPago === 'mercadopago' ? 'mp-btn' : ''}`}
            disabled={loading}
          >
            <ShieldCheck size={18} />
            <span>
              {loading
                ? 'Procesando pago...'
                : metodoPago === 'mercadopago'
                ? `Pagar $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} con Mercado Pago`
                : `Pagar $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}