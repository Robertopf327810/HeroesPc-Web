import { ShoppingCart, Search, User } from 'lucide-react';

export default function Navbar({ search, setSearch, cartCount, onOpenCart }) {
  return (
    <header className="navbar">
      <div className="container nav-content">
        <a href="#" className="logo">
          HEROES<span>PC</span>
        </a>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar procesadores, tarjetas gráficas, laptops, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button">
            <Search size={18} />
          </button>
        </div>

        <div className="nav-actions">
          <button className="btn-icon" type="button">
            <User size={18} />
            <span>Mi Cuenta</span>
          </button>
          <button className="btn-cart" type="button" onClick={onOpenCart}>
            <ShoppingCart size={18} />
            <span>Carrito ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}