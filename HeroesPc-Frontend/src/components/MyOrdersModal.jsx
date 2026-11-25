import { useQuery } from '@tanstack/react-query';
import { X, PackageCheck, Truck, CreditCard, Calendar } from 'lucide-react';
import api from '../api/axiosClient';

export default function MyOrdersModal({ isOpen, onClose, user }) {
  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ['mis-pedidos', user?.id_usuario],
    enabled: Boolean(isOpen && user?.id_usuario),
    queryFn: async () => {
      const [resPedidos, resDetalles, resEnvios, resPagos, resProductos] =
        await Promise.all([
          api.get('/pedidos'),
          api.get('/detalle-pedidos'),
          api.get('/envios'),
          api.get('/pagos'),
          api.get('/productos'),
        ]);

      const listaPedidos = Array.isArray(resPedidos.data) ? resPedidos.data : [];
      const listaDetalles = Array.isArray(resDetalles.data) ? resDetalles.data : [];
      const listaEnvios = Array.isArray(resEnvios.data) ? resEnvios.data : [];
      const listaPagos = Array.isArray(resPagos.data) ? resPagos.data : [];
      const listaProductos = Array.isArray(resProductos.data) ? resProductos.data : [];

      return listaPedidos
        .filter((p) => Number(p.id_usuario) === Number(user.id_usuario))
        .sort((a, b) => Number(b.id_pedido) - Number(a.id_pedido))
        .map((pedido) => {
          const items = listaDetalles
            .filter((d) => Number(d.id_pedido) === Number(pedido.id_pedido))
            .map((det) => {
              const prodInfo = listaProductos.find(
                (pr) => Number(pr.id_producto) === Number(det.id_producto)
              );
              return {
                ...det,
                nombre_producto:
                  prodInfo?.nombre || `Producto #${det.id_producto}`,
                imagen_url: prodInfo?.imagen_url || '',
              };
            });

          const envio = listaEnvios.find(
            (e) => Number(e.id_pedido) === Number(pedido.id_pedido)
          );
          const pago = listaPagos.find(
            (pg) => Number(pg.id_pedido) === Number(pedido.id_pedido)
          );

          return {
            ...pedido,
            items,
            envio,
            pago,
          };
        });
    },
  });

  if (!isOpen || !user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          color: '#0f172a',
          width: '92%',
          maxWidth: '680px',
          maxHeight: '85vh',
          overflowY: 'auto',
          borderRadius: '14px',
          padding: '22px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div
          className="drawer-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '12px',
            marginBottom: '16px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a' }}>
              Mis Pedidos — {user.nombre}
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {user.correo || user.email}
            </span>
          </div>
          <button
            type="button"
            className="btn-close-drawer"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
            Cargando tu historial de compras...
          </p>
        ) : orders.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '28px 16px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
              color: '#475569',
            }}
          >
            <p style={{ margin: 0 }}>
              Aún no has realizado ninguna compra en HEROES PC.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((order) => (
              <div
                key={order.id_pedido}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px',
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      Pedido #{order.id_pedido}
                    </span>
                    {order.fecha_pedido && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          color: '#64748b',
                        }}
                      >
                        <Calendar size={13} />
                        {new Date(order.fecha_pedido).toLocaleDateString('es-MX')}
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#fff7ed',
                      color: '#ea580c',
                      border: '1px solid #fed7aa',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    <PackageCheck size={14} />
                    {(order.estado || 'pagado').toUpperCase()}
                  </span>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.86rem',
                      }}
                    >
                      <span>
                        <strong>{item.cantidad}x</strong> {item.nombre_producto}
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        $
                        {Number(
                          item.subtotal || item.precio_unitario * item.cantidad
                        ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '10px',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        marginBottom: '6px',
                        color: '#334155',
                      }}
                    >
                      <Truck size={15} color="#ea580c" />
                      <span>Envío y Rastreo</span>
                    </div>
                    {order.envio ? (
                      <>
                        <p style={{ margin: '2px 0' }}>
                          <strong>Paquetería:</strong> {order.envio.paqueteria}
                        </p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>Guía:</strong>{' '}
                          <span
                            style={{
                              fontFamily: 'monospace',
                              background: '#f1f5f9',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {order.envio.numero_guia}
                          </span>
                        </p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>Estado:</strong> {order.envio.estado_envio}
                        </p>
                      </>
                    ) : (
                      <p style={{ margin: 0, color: '#64748b' }}>
                        Pendiente de asignación de guía
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      background: '#ffffff',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        marginBottom: '6px',
                        color: '#334155',
                      }}
                    >
                      <CreditCard size={15} color="#ea580c" />
                      <span>Pago</span>
                    </div>
                    {order.pago ? (
                      <>
                        <p style={{ margin: '2px 0' }}>{order.pago.metodo_pago}</p>
                        <p style={{ margin: '2px 0' }}>
                          <strong>Estado:</strong> {order.pago.estado_pago}
                        </p>
                      </>
                    ) : (
                      <p style={{ margin: 0, color: '#64748b' }}>
                        Registrado en orden
                      </p>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.84rem',
                    paddingTop: '8px',
                    borderTop: '1px solid #e2e8f0',
                  }}
                >
                  <span style={{ color: '#475569' }}>
                    Dirección: {order.direccion_envio || user.direccion || 'Entrega en tienda'}
                  </span>
                  <strong style={{ fontSize: '0.98rem', color: '#ea580c' }}>
                    Total: $
                    {Number(order.total).toLocaleString('es-MX', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    MXN
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 