import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Package,
  Cpu,
  Shield,
} from 'lucide-react';
import heroesLogo from '../assets/HEROESPC-LOGO.png';

export default function Navbar({
  search,
  setSearch,
  cartCount,
  onOpenCart,
  user,
  onOpenAuth,
  onOpenOrders,
  onLogout,
  activeView,
  onChangeView,
}) {
  const isAdmin = user?.rol?.toLowerCase() === 'admin';

  return (
    <header className="navbar">
      <div className="container nav-content">
        <div
          className="logo-brand"
          onClick={() => onChangeView('store')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <img
            src={heroesLogo}
            alt="HEROES PC Games & Hardware"
            className="brand-emblem"
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span
              style={{
                fontWeight: 900,
                fontSize: '1.15rem',
                letterSpacing: '0.5px',
                color: '#ffffff',
              }}
            >
              HEROES PC
            </span>
            <span
              style={{
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '1.6px',
                color: '#ea580c',
                textTransform: 'uppercase',
              }}
            >
              GAMES &amp; HARDWARE
            </span>
          </div>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar procesadores, tarjetas gráficas, laptops, SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (activeView !== 'store') onChangeView('store');
            }}
          />
          <button
            type="button"
            className="search-btn"
            aria-label="Buscar"
            onClick={() => {
              if (activeView !== 'store') onChangeView('store');
            }}
          >
            <Search size={18} />
          </button>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className={`nav-btn ${activeView === 'builder' ? 'active-nav' : ''}`}
            onClick={() =>
              onChangeView(activeView === 'builder' ? 'store' : 'builder')
            }
          >
            <Cpu size={17} />
            <span>Arma tu PC</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              className={`nav-btn ${activeView === 'admin' ? 'active-nav' : ''}`}
              onClick={() =>
                onChangeView(activeView === 'admin' ? 'store' : 'admin')
              }
            >
              <Shield size={17} />
              <span>Admin</span>
            </button>
          )}

          {user ? (
            <>
              <button
                type="button"
                className="nav-btn"
                onClick={onOpenOrders}
              >
                <Package size={17} />
                <span>Mis Pedidos ({user.nombre})</span>
              </button>
              <button
                type="button"
                className="nav-btn icon-only"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <button type="button" className="nav-btn" onClick={onOpenAuth}>
              <User size={17} />
              <span>Iniciar Sesión</span>
            </button>
          )}

          <button
            type="button"
            className="nav-btn cart-btn"
            onClick={onOpenCart}
          >
            <ShoppingCart size={17} />
            <span>Carrito ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}