import { ShoppingCart, Search, User, LogOut, Settings, Package } from 'lucide-react';

export default function Navbar({
  search,
  setSearch,
  cartCount,
  onOpenCart,
  user,
  onOpenAuth,
  onOpenOrders,
  onLogout,
  isAdminView,
  onToggleAdmin,
}) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <a
          href="#"
          className="logo-brand"
          onClick={(e) => {
            e.preventDefault();
            if (isAdminView) onToggleAdmin();
          }}
        >
          <img
            src="/HEROESPC-LOGO.jpg"
            alt="Heroes PC Logo"
            className="brand-emblem"
          />
          <span className="brand-name">HEROES PC</span>
        </a>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar procesadores, tarjetas gráficas, laptops, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" aria-label="Buscar">
            <Search size={18} />
          </button>
        </div>

        <div className="nav-actions">
          <button
            className={`btn-icon ${isAdminView ? 'btn-admin-active' : ''}`}
            type="button"
            onClick={onToggleAdmin}
          >
            <Settings size={18} />
            <span>{isAdminView ? 'Tienda' : 'Admin'}</span>
          </button>

          {user ? (
            <div className="user-pill">
              <button
                type="button"
                className="btn-user-orders"
                title="Ver Mis Pedidos"
                onClick={onOpenOrders}
              >
                <Package size={16} />
                <span>Mis Pedidos ({user.nombre.split(' ')[0]})</span>
              </button>
              <button
                type="button"
                className="btn-logout"
                title="Cerrar sesión"
                onClick={onLogout}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button className="btn-icon" type="button" onClick={onOpenAuth}>
              <User size={18} />
              <span>Mi Cuenta</span>
            </button>
          )}

          <button className="btn-cart" type="button" onClick={onOpenCart}>
            <ShoppingCart size={18} />
            <span>Carrito ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}