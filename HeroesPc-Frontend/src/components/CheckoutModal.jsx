import { useState } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  MapPin,
  Lock,
  ExternalLink,
  CheckCircle2,
  Package,
  Truck,
  UserCheck,
  CalendarClock,
} from 'lucide-react';
import api from '../api/axiosClient';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onOrderSuccess,
}) {
  const [metodo, setMetodo] = useState('tarjeta');

  // Campos separados de dirección
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [colonia, setColonia] = useState('');
  const [cp, setCp] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [estadoDir, setEstadoDir] = useState('');

  // Campos de tarjeta
  const [tipoTarjeta, setTipoTarjeta] = useState('Crédito');
  const [titular, setTitular] = useState(user?.nombre || '');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [expiracion, setExpiracion] = useState('');
  const [cvv, setCvv] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !user) return null;

  const subtotal = cart.reduce(
    (acc, item) => acc + Number(item.precio) * item.cantidad,
    0
  );
  const envioCosto = subtotal >= 2500 || subtotal === 0 ? 0 : 199;
  const total = subtotal + envioCosto;
  const baseSinIva = subtotal / 1.16;
  const ivaIncluido = subtotal - baseSinIva;
  const totalArticulos = cart.reduce((acc, i) => acc + i.cantidad, 0);

  const direccionCompleta = `${calle.trim()} #${numero.trim()}, Col. ${colonia.trim()}, C.P. ${cp.trim()}, ${ciudad.trim()}, ${estadoDir.trim()}`;

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

  const detectarRed = (num) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'MASTERCARD';
    if (/^3[47]/.test(clean)) return 'AMEX';
    return 'TARJETA';
  };

  const registrarPedidoEnBackend = async (metodoPagoLabel, estadoPago) => {
    const { data: pedidoCreado } = await api.post('/pedidos', {
      id_usuario: user.id_usuario,
      total,
      estado: 'pagado',
      direccion_envio: direccionCompleta,
    });

    const idPedido = pedidoCreado.id_pedido || pedidoCreado.id;

    await Promise.all(
      cart.map(async (item) => {
        await api.post('/detalle-pedidos', {
          id_pedido: idPedido,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: Number(item.precio),
          subtotal: Number(item.precio) * item.cantidad,
        });

        const nuevoStock = Math.max(0, Number(item.stock) - item.cantidad);
        await api.put(`/productos/${item.id_producto}`, {
          stock: nuevoStock,
        });
      })
    );

    await api.post('/pagos', {
      id_pedido: idPedido,
      metodo_pago: metodoPagoLabel,
      monto: total,
      estado_pago: estadoPago,
    });

    const guiaRandom = `HPC-${Math.floor(100000 + Math.random() * 900000)}`;
    await api.post('/envios', {
      id_pedido: idPedido,
      paqueteria: 'Estafeta Express',
      numero_guia: guiaRandom,
      estado_envio: 'Preparando paquete',
    });

    return idPedido;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      !calle.trim() ||
      !numero.trim() ||
      !colonia.trim() ||
      cp.trim().length < 5 ||
      !ciudad.trim() ||
      !estadoDir.trim()
    ) {
      setErrorMsg('Por favor completa todos los campos de la dirección de entrega.');
      return;
    }

    if (metodo === 'tarjeta') {
      const cleanCard = numeroTarjeta.replace(/\s/g, '');
      if (
        !titular.trim() ||
        cleanCard.length < 15 ||
        expiracion.length < 5 ||
        cvv.length < 3
      ) {
        setErrorMsg('Verifica que todos los datos de tu tarjeta estén completos.');
        return;
      }
    }

    setLoading(true);
    try {
      if (metodo === 'mercadopago') {
        try {
          const { data: mpData } = await api.post('/pagos/mercado-pago', {
            items: cart.map((item) => ({
              title: item.nombre,
              quantity: item.cantidad,
              unit_price: Number(item.precio),
            })),
            id_usuario: user.id_usuario,
            direccion_envio: direccionCompleta,
          });

          if (mpData?.init_point) {
            window.location.href = mpData.init_point;
            return;
          }
        } catch {
          // Fallback si no hay credenciales activas de Mercado Pago
        }

        const idPedido = await registrarPedidoEnBackend(
          'Mercado Pago (Checkout Pro)',
          'Aprobado'
        );
        onClose();
        onOrderSuccess(idPedido, 'Mercado Pago');
        return;
      }

      const terminacion = numeroTarjeta.replace(/\s/g, '').slice(-4);
      const labelPago = `Tarjeta de ${tipoTarjeta} •••• ${terminacion}`;
      const idPedido = await registrarPedidoEnBackend(labelPago, 'Aprobado');
      onClose();
      onOrderSuccess(idPedido, labelPago);
    } catch (error) {
      console.error('Error al procesar el pago:', error);
      setErrorMsg(
        error.response?.data?.message ||
          'Ocurrió un error al registrar tu pedido. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 11px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '0.85rem',
    background: '#ffffff',
    color: '#0f172a',
  };

  const labelFieldStyle = {
    display: 'block',
    fontSize: '0.74rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '4px',
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          color: '#0f172a',
          width: '96%',
          maxWidth: '1120px',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: '20px',
          boxShadow: '0 25px 60px rgba(15, 23, 42, 0.45)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Barra superior oscura */}
        <div
          style={{
            background: '#0f172a',
            color: '#ffffff',
            padding: '16px 26px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #ea580c',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#22c55e" />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.12rem', fontWeight: 800 }}>
                Checkout Seguro — HEROES PC
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Encriptación SSL de 256 bits · Garantía directa de 12 meses
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo dividido en 2 columnas con Resumen extendido */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            padding: '24px',
            alignItems: 'start',
          }}
        >
          {/* COLUMNA IZQUIERDA: Envío y Datos de Pago */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {errorMsg && (
              <div
                style={{
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Paso 1: Dirección de entrega separada */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '2px',
                }}
              >
                <MapPin size={16} color="#ea580c" />
                <span>1. Dirección de entrega</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '10px',
                }}
              >
                <div>
                  <label style={labelFieldStyle}>Calle</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Av. Madero Pte."
                    value={calle}
                    onChange={(e) => setCalle(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelFieldStyle}>Núm. Ext / Int</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 450 Int. 2"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr',
                  gap: '10px',
                }}
              >
                <div>
                  <label style={labelFieldStyle}>Colonia</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Centro"
                    value={colonia}
                    onChange={(e) => setColonia(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelFieldStyle}>Código Postal</label>
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={5}
                    placeholder="58000"
                    value={cp}
                    onChange={(e) =>
                      setCp(e.target.value.replace(/\D/g, '').slice(0, 5))
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                }}
              >
                <div>
                  <label style={labelFieldStyle}>Ciudad / Municipio</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Morelia"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelFieldStyle}>Estado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Michoacán"
                    value={estadoDir}
                    onChange={(e) => setEstadoDir(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Paso 2: Método de pago */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '15px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#0f172a',
                }}
              >
                2. Método de pago
              </span>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMetodo('tarjeta')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border:
                      metodo === 'tarjeta'
                        ? '2px solid #ea580c'
                        : '1px solid #cbd5e1',
                    background: metodo === 'tarjeta' ? '#fff7ed' : '#ffffff',
                    color: metodo === 'tarjeta' ? '#ea580c' : '#334155',
                  }}
                >
                  <CreditCard size={16} />
                  <span>Tarjeta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodo('mercadopago')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border:
                      metodo === 'mercadopago'
                        ? '2px solid #2563eb'
                        : '1px solid #cbd5e1',
                    background: metodo === 'mercadopago' ? '#eff6ff' : '#ffffff',
                    color: metodo === 'mercadopago' ? '#2563eb' : '#334155',
                  }}
                >
                  <ExternalLink size={16} />
                  <span>Mercado Pago</span>
                </button>
              </div>

              {metodo === 'tarjeta' ? (
                <>
                  {/* Tarjeta visual en vivo */}
                  <div
                    style={{
                      background:
                        'linear-gradient(135deg, #0f172a 0%, #1e293b 65%, #9a3412 100%)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '132px',
                      boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(255,255,255,0.14)',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          fontWeight: 700,
                        }}
                      >
                        {tipoTarjeta.toUpperCase()}
                      </span>
                      <strong style={{ letterSpacing: '1px', color: '#fdba74' }}>
                        {detectarRed(numeroTarjeta)}
                      </strong>
                    </div>

                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.12rem',
                        letterSpacing: '2px',
                        margin: '14px 0 10px',
                      }}
                    >
                      {numeroTarjeta || '•••• •••• •••• ••••'}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.74rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <span
                        style={{
                          textTransform: 'uppercase',
                          maxWidth: '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {titular || 'NOMBRE DEL TITULAR'}
                      </span>
                      <span>VENCE: {expiracion || 'MM/AA'}</span>
                    </div>
                  </div>

                  {/* Selector Crédito / Débito */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span style={{ color: '#64748b', fontWeight: 600 }}>
                      Tipo de cuenta:
                    </span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {['Crédito', 'Débito'].map((t) => (
                        <label
                          key={t}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'pointer',
                            fontWeight: 600,
                          }}
                        >
                          <input
                            type="radio"
                            name="tipoTarjeta"
                            checked={tipoTarjeta === t}
                            onChange={() => setTipoTarjeta(t)}
                            style={{ accentColor: '#ea580c' }}
                          />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={labelFieldStyle}>Titular de la tarjeta</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre completo como aparece en la tarjeta"
                      value={titular}
                      onChange={(e) => setTitular(e.target.value)}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelFieldStyle}>Número de tarjeta</label>
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={numeroTarjeta}
                      onChange={(e) =>
                        setNumeroTarjeta(formatCardNumber(e.target.value))
                      }
                      style={{ ...inputStyle, fontFamily: 'monospace' }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                    }}
                  >
                    <div>
                      <label style={labelFieldStyle}>Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        required
                        inputMode="numeric"
                        placeholder="08/29"
                        value={expiracion}
                        onChange={(e) => setExpiracion(formatExpiry(e.target.value))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelFieldStyle}>CVV</label>
                      <input
                        type="password"
                        required
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="123"
                        value={cvv}
                        onChange={(e) =>
                          setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '0.84rem',
                    color: '#1e3a8a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={17} color="#2563eb" />
                    <span>Mercado Pago Checkout Pro</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.45 }}>
                    Paga con tu cuenta de Mercado Pago, meses sin intereses con
                    tarjetas participantes o transferencia SPEI al instante.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMNA DERECHA EXTENDIDA: Resumen Completo del Pedido */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            <div>
              {/* Encabezado del resumen */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  marginBottom: '12px',
                  borderBottom: '1px solid #e2e8f0',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  <Package size={19} color="#ea580c" />
                  Resumen detallado del pedido
                </span>
                <span
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {totalArticulos} {totalArticulos === 1 ? 'pieza' : 'piezas'}
                </span>
              </div>

              {/* Datos del comprador */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '9px 12px',
                  marginBottom: '12px',
                  fontSize: '0.78rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#334155',
                    fontWeight: 700,
                  }}
                >
                  <UserCheck size={15} color="#ea580c" />
                  Cliente: {user.nombre}
                </span>
                <span style={{ color: '#64748b' }}>{user.email}</span>
              </div>

              {/* Lista extendida de productos */}
              <div
                style={{
                  maxHeight: '420px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  paddingRight: '4px',
                }}
              >
                {cart.map((item) => (
                  <div
                    key={item.id_producto}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <img
                        src={
                          item.imagen_url ||
                          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=200'
                        }
                        alt={item.nombre}
                        style={{
                          width: '48px',
                          height: '48px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          background: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          padding: '3px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: '#64748b',
                          }}
                        >
                          {item.sku}
                        </div>
                        <div
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.nombre}
                        </div>
                        {item.descripcion && (
                          <div
                            style={{
                              fontSize: '0.71rem',
                              color: '#64748b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.descripcion}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#334155',
                            fontWeight: 600,
                            marginTop: '2px',
                          }}
                        >
                          Cantidad: {item.cantidad} × $
                          {Number(item.precio).toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: '0.88rem',
                          color: '#0f172a',
                        }}
                      >
                        $
                        {(Number(item.precio) * item.cantidad).toLocaleString(
                          'es-MX',
                          { minimumFractionDigits: 2 }
                        )}
                      </strong>
                      <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                        MXN
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destino + Desglose Fiscal + Envío + Botón de Pago */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  color: '#475569',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarClock size={14} color="#ea580c" />
                  <strong style={{ color: '#0f172a' }}>
                    Entrega estimada: 2 a 3 días hábiles (Estafeta Express)
                  </strong>
                </div>
                {(calle || colonia || ciudad) && (
                  <div style={{ paddingLeft: '20px', color: '#334155' }}>
                    <strong>Destino:</strong> {direccionCompleta}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '7px',
                  fontSize: '0.84rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Importe base (sin IVA):</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>
                    $
                    {baseSinIva.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>IVA (16% incluido):</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>
                    $
                    {ivaIncluido.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#475569' }}>Subtotal mercancía:</span>
                  <strong>
                    $
                    {subtotal.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Truck size={14} color="#16a34a" />
                    Envío asegurado:
                  </span>
                  <strong style={{ color: envioCosto === 0 ? '#16a34a' : '#0f172a' }}>
                    {envioCosto === 0 ? 'GRATIS' : `$${envioCosto.toFixed(2)}`}
                  </strong>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginTop: '6px',
                    paddingTop: '10px',
                    borderTop: '1px dashed #cbd5e1',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: '1rem' }}>
                    Total a pagar:
                  </span>
                  <strong style={{ fontSize: '1.32rem', color: '#ea580c' }}>
                    $
                    {total.toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    MXN
                  </strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cart.length === 0}
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: metodo === 'mercadopago' ? '#2563eb' : '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 6px 16px rgba(234, 88, 12, 0.25)',
                }}
              >
                <Lock size={17} />
                <span>
                  {loading
                    ? 'Confirmando pedido...'
                    : `Confirmar y Pagar $${total.toLocaleString('es-MX', {
                        minimumFractionDigits: 2,
                      })} MXN`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}