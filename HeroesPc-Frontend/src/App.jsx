import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
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
    }
    fetchData();
  }, []);

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

  const handleRemoveFromCart = (idProducto) => {
    setCart((prev) => prev.filter((item) => item.id_producto !== idProducto));
  };

  const handleCheckout = () => {
    alert('¡Pedido listo para enviarse a POST /api/pedidos!');
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="app">
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cart.reduce((acc, item) => acc + item.cantidad, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Barra de Categorías */}
      <nav className="cat-bar">
        <div className="container cat-list">
          <button
            type="button"
            className={`cat-btn ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            Todos los productos
          </button>
          {categorias.map((cat) => (
            <button
              type="button"
              key={cat.id_categoria}
              className={`cat-btn ${selectedCat === cat.id_categoria ? 'active' : ''}`}
              onClick={() => setSelectedCat(cat.id_categoria)}
            >
              {cat.nombre_categoria}
            </button>
          ))}
        </div>
      </nav>

      {/* Banner Hero */}
      <section className="container hero-banner">
        <div className="banner-box">
          <span className="tag">HARDWARE DE ALTO RENDIMIENTO</span>
          <h1>Equipa tu Setup con HeroesPC</h1>
          <p>Procesadores, tarjetas gráficas, almacenamiento NVMe y periféricos con envío inmediato.</p>
        </div>
      </section>

      {/* Catálogo Principal */}
      <main className="container main-layout">
        <aside className="sidebar">
          <h3>Filtros</h3>
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={onlyStock}
                onChange={(e) => setOnlyStock(e.target.checked)}
              />
              Solo con stock disponible
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
          <div className="catalog-header">
            <h2>Catálogo de Componentes</h2>
            <span>{filteredProducts.length} productos encontrados</span>
          </div>

          {loading ? (
            <p>Cargando catálogo desde PostgreSQL...</p>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id_producto}
                  producto={prod}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}   