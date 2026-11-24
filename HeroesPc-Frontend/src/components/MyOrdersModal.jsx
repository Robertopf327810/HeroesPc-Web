import { useEffect, useState } from 'react';
import { X, PackageCheck, Truck, CreditCard, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:3000/api';

export default function MyOrdersModal({ isOpen, onClose, user }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    async function fetchUserOrders() {
      setLoading(true);
      try {
        const [resPedidos, resDetalles, resEnvios, resPagos, resProductos] =
          await Promise.all([
            fetch(`${API_URL}/pedidos`),
            fetch(`${API_URL}/detalle-pedidos`),
            fetch(`${API_URL}/envios`),
            fetch(`${API_URL}/pagos`),
            fetch(`${API_URL}/productos`),
          ]);

        const [pedidos, detalles, envios, pagos, productos] = await Promise.all([
          resPedidos.json(),
          resDetalles.json(),
          resEnvios.json(),
          resPagos.json(),
          resProductos.json(),
        ]);

        const listaPedidos = Array.isArray(pedidos) ? pedidos : [];
        const listaDetalles = Array.isArray(detalles) ? detalles : [];
        const listaEnvios = Array.isArray(envios) ? envios : [];
        const listaPagos = Array.isArray(pagos) ? pagos : [];
        const listaProductos = Array.isArray(productos) ? productos : [];

        // Filtrar solo los pedidos del usuario logueado y ordenarlos del más reciente al más antiguo
        const misPedidos = listaPedidos
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

        setOrders(misPedidos);
      } catch (error) {
        console.error('Error cargando historial de pedidos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrders();
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="orders-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <div>
            <h3>Mis Pedidos — {user.nombre}</h3>
            <span className="orders-subtitle">{user.email}</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p className="orders-empty">Cargando tu historial de compras...</p>
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <p>Aún no has realizado ninguna compra en HEROES PC.</p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id_pedido} className="order-card">
                <div className="order-card-top">
                  <div>
                    <span className="order-number">Pedido #{order.id_pedido}</span>
                    {order.fecha_pedido && (
                      <span className="order-date">
                        <Calendar size={13} />
                        {new Date(order.fecha_pedido).toLocaleDateString('es-MX')}
                      </span>
                    )}
                  </div>
                  <span className="order-status-badge">
                    <PackageCheck size={14} />
                    {(order.estado || 'pagado').toUpperCase()}
                  </span>
                </div>

                {/* Lista de artículos del pedido */}
                <div className="order-items-list">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span>
                        <strong>{item.cantidad}x</strong> {item.nombre_producto}
                      </span>
                      <span>
                        $
                        {Number(
                          item.subtotal || item.precio_unitario * item.cantidad
                        ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Datos de Envío y Pago */}
                <div className="order-meta-grid">
                  <div className="meta-box">
                    <div className="meta-title">
                      <Truck size={15} />
                      <span>Envío y Rastreo</span>
                    </div>
                    {order.envio ? (
                      <>
                        <p>
                          <strong>Paquetería:</strong> {order.envio.paqueteria}
                        </p>
                        <p>
                          <strong>Guía:</strong>{' '}
                          <span className="tracking-code">
                            {order.envio.numero_guia}
                          </span>
                        </p>
                        <p>
                          <strong>Estado:</strong> {order.envio.estado_envio}
                        </p>
                      </>
                    ) : (
                      <p>Pendiente de asignación de guía</p>
                    )}
                  </div>

                  <div className="meta-box">
                    <div className="meta-title">
                      <CreditCard size={15} />
                      <span>Pago</span>
                    </div>
                    {order.pago ? (
                      <>
                        <p>{order.pago.metodo_pago}</p>
                        <p>
                          <strong>Estado:</strong> {order.pago.estado_pago}
                        </p>
                      </>
                    ) : (
                      <p>Registrado en orden</p>
                    )}
                  </div>
                </div>

                <div className="order-card-footer">
                  <span>Dirección: {order.direccion_envio || user.direccion}</span>
                  <strong className="order-total">
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