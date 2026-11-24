import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import CheckoutModal from './components/CheckoutModal';
import AdminPanel from './components/AdminPanel';
import MyOrdersModal from './components/MyOrdersModal';
import ProductDetailModal from './components/ProductDetailModal';
import PcBuilder from './components/PcBuilder';
import './App.css';

const API_URL = 'http://localhost:3000/api';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeView, setActiveView] = useState('store'); // 'store' | 'builder' | 'admin'
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('heroespc_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [resCat, resProd] = await Promise.all([
        fetch(`${API_URL}/categorias`),
        fetch(`${API_URL}/productos`),
      ]);
      const dataCat = await resCat.json();
      const dataProd = await resProd.json();
      setCategorias(Array.isArray(dataCat) ? dataCat : []);
      setProductos(Array.isArray(dataProd) ? dataProd : []);
    } catch (error) {
      console.error('Error cargando datos del backend:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('heroespc_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('heroespc_user');
  };

  const filteredProducts = productos
    .filter((p) => {
      const matchCat = selectedCat === 'all' || p.id_categoria === selectedCat;
      const matchSearch =
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const matchStock = !onlyStock || p.stock > 0;
      return matchCat && matchSearch && matchStock;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return Number(a.precio) - Number(b.precio);
      if (sortBy === 'price-desc') return Number(b.precio) - Number(a.precio);
      return 0;
    });

  const handleAddToCart = (producto) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id_producto === producto.id_producto);
      if (exists) {
        if (exists.cantidad >= producto.stock) return prev;
        return prev.map((item) =>
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const handleAddBuildToCart = (partsList) => {
    partsList.forEach((part) => handleAddToCart(part));
    setIsCartOpen(true);
  };

  const handleRemoveFromCart = (idProducto) => {
    setCart((prev) => prev.filter((item) => item.id_producto !== idProducto));
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (idPedido, metodo) => {
    alert(
      `¡Compra aprobada!\nPedido #${idPedido} registrado correctamente.\nMétodo: ${metodo}`
    );
    setCart([]);
    fetchData();
  };

  return (
    <div className="app">
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cart.reduce((acc, item) => acc + item.cantidad, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {activeView === 'admin' ? (
        <AdminPanel
          productos={productos}
          categorias={categorias}
          onBackToStore={() => setActiveView('store')}
          onDataUpdated={fetchData}
        />
      ) : activeView === 'builder' ? (
        <PcBuilder
          productos={productos}
          categorias={categorias}
          onAddBuildToCart={handleAddBuildToCart}
          onBackToStore={() => setActiveView('store')}
        />
      ) : (
        <>
          <nav className="cat-bar">
            <div className="container cat-list">
              <button
                type="button"
                className={`cat-pill ${selectedCat === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCat('all')}
              >
                Todos los productos
              </button>
              {categorias.map((cat) => (
                <button
                  type="button"
                  key={cat.id_categoria}
                  className={`cat-pill ${selectedCat === cat.id_categoria ? 'active' : ''}`}
                  onClick={() => setSelectedCat(cat.id_categoria)}
                >
                  {cat.nombre_categoria}
                </button>
              ))}
            </div>
          </nav>

          <section className="container hero-banner">
            <div className="banner-box">
              <h1>Equipa tu Setup con HeroesPC</h1>
              <span className="tag">HARDWARE DE ALTO RENDIMIENTO</span>
              <p>
                Encuentra los mejores procesadores, tarjetas gráficas, laptops, hardware y
                componentes de nuestro catálogo con envío inmediato.
              </p>
            </div>
          </section>

          <main className="container main-layout">
            <aside className="sidebar">
              <h3>Filtros</h3>

              <div className="filter-list">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCat === 'all'}
                    onChange={() => setSelectedCat('all')}
                  />
                  Todas las categorías
                </label>
                {categorias.map((cat) => (
                  <label key={cat.id_categoria} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCat === cat.id_categoria}
                      onChange={() =>
                        setSelectedCat(
                          selectedCat === cat.id_categoria ? 'all' : cat.id_categoria
                        )
                      }
                    />
                    {cat.nombre_categoria}
                  </label>
                ))}
              </div>

              <div className="filter-group">
                <h4>Disponibilidad</h4>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={onlyStock}
                    onChange={(e) => setOnlyStock(e.target.checked)}
                  />
                  Solo con stock
                </label>
              </div>

              <div className="filter-group">
                <h4>Ordenar por</h4>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Relevancia</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </aside>

            <section className="catalog">
              {loading ? (
                <p>Cargando catálogo desde PostgreSQL...</p>
              ) : (
                <div className="products-grid-two-col">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id_producto}
                      producto={prod}
                      onAddToCart={handleAddToCart}
                      onSelectProduct={setSelectedProduct}
                    />
                  ))}
                </div>
              )}
            </section>
          </main>
        </>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleOpenCheckout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(u) => {
          handleLoginSuccess(u);
          if (cart.length > 0) setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        user={user}
        onOrderSuccess={handleOrderSuccess}
      />

      <MyOrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={user}
      />

      <ProductDetailModal
        producto={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}