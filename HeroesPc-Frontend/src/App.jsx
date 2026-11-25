import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from './api/axiosClient';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import ProductDetailModal from './components/ProductDetailModal';
import './App.css';

// Carga diferida: Three.js y los modales pesados solo se descargan cuando los abres
const PcBuilder = lazy(() => import('./components/PcBuilder'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));
const MyOrdersModal = lazy(() => import('./components/MyOrdersModal'));

const ITEMS_PER_PAGE = 16;

export default function App() {
  const queryClient = useQueryClient();
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [onlyStock, setOnlyStock] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [visibleLimit, setVisibleLimit] = useState(ITEMS_PER_PAGE);

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeView, setActiveView] = useState('store');
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('heroespc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: async () => {
      const { data } = await api.get('/categorias');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const { data: productos = [], isLoading: loading } = useQuery({
    queryKey: ['productos'],
    queryFn: async () => {
      const { data } = await api.get('/productos');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  const refreshData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] });
    queryClient.invalidateQueries({ queryKey: ['productos'] });
  }, [queryClient]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pagoStatus = params.get('pago');
    if (pagoStatus) {
      if (pagoStatus === 'aprobado') {
        alert('¡Pago aprobado en Mercado Pago! Tu pedido ha sido confirmado.');
        setCart([]);
        refreshData();
      } else if (pagoStatus === 'pendiente') {
        alert('Tu pago en Mercado Pago está pendiente de acreditación.');
      } else if (pagoStatus === 'fallido') {
        alert('El pago en Mercado Pago no se completó. Puedes intentarlo nuevamente.');
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshData]);

  // Reinicia el límite visible al cambiar de categoría, búsqueda u orden
  useEffect(() => {
    setVisibleLimit(ITEMS_PER_PAGE);
  }, [selectedCat, search, onlyStock, sortBy]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('heroespc_user', JSON.stringify(userData));
    if (userData?.rol?.toLowerCase() === 'admin') {
      setActiveView('admin');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/usuarios/logout');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
    setUser(null);
    localStorage.removeItem('heroespc_user');
    if (activeView === 'admin') {
      setActiveView('store');
    }
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return productos
      .filter((p) => {
        if (p.sku?.toUpperCase() === 'SRV-BUILD-01') return false;
        const matchCat = selectedCat === 'all' || p.id_categoria === selectedCat;
        const matchSearch =
          !term ||
          p.nombre.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term);
        const matchStock = !onlyStock || p.stock > 0;
        return matchCat && matchSearch && matchStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.precio) - Number(b.precio);
        if (sortBy === 'price-desc') return Number(b.precio) - Number(a.precio);
        return 0;
      });
  }, [productos, selectedCat, search, onlyStock, sortBy]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleLimit),
    [filteredProducts, visibleLimit]
  );

  const handleAddToCart = useCallback((producto) => {
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
  }, []);

  const handleAddBuildToCart = useCallback((partsList) => {
    setCart((prev) => {
      let next = [...prev];
      partsList.forEach((part) => {
        const idx = next.findIndex((i) => i.id_producto === part.id_producto);
        if (idx >= 0) {
          if (next[idx].cantidad < part.stock) {
            next[idx] = { ...next[idx], cantidad: next[idx].cantidad + 1 };
          }
        } else {
          next.push({ ...part, cantidad: 1 });
        }
      });
      return next;
    });
    setIsCartOpen(true);
  }, []);

  const handleRemoveFromCart = useCallback((idProducto) => {
    setCart((prev) => prev.filter((item) => item.id_producto !== idProducto));
  }, []);

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
    refreshData();
  };

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.cantidad, 0),
    [cart]
  );

  return (
    <div className="app">
      <Navbar
        search={search}
        setSearch={setSearch}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onLogout={handleLogout}
        activeView={activeView}
        onChangeView={setActiveView}
      />

      {activeView === 'admin' && user?.rol?.toLowerCase() === 'admin' ? (
        <Suspense fallback={<div className="container" style={{ padding: '40px' }}>Cargando panel...</div>}>
          <AdminPanel
            productos={productos}
            categorias={categorias}
            onBackToStore={() => setActiveView('store')}
            onDataUpdated={refreshData}
          />
        </Suspense>
      ) : activeView === 'builder' ? (
        <Suspense fallback={<div className="container" style={{ padding: '40px' }}>Cargando configurador 3D...</div>}>
          <PcBuilder
            productos={productos}
            categorias={categorias}
            onAddBuildToCart={handleAddBuildToCart}
            onBackToStore={() => setActiveView('store')}
          />
        </Suspense>
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
                <>
                  <div className="products-grid-two-col">
                    {visibleProducts.map((prod) => (
                      <ProductCard
                        key={prod.id_producto}
                        producto={prod}
                        onAddToCart={handleAddToCart}
                        onSelectProduct={setSelectedProduct}
                      />
                    ))}
                  </div>

                  {visibleLimit < filteredProducts.length && (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <button
                        type="button"
                        className="btn-add-cart"
                        style={{ padding: '11px 24px', fontSize: '0.92rem' }}
                        onClick={() => setVisibleLimit((prev) => prev + ITEMS_PER_PAGE)}
                      >
                        Mostrar más productos ({filteredProducts.length - visibleLimit} restantes)
                      </button>
                    </div>
                  )}
                </>
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
          if (cart.length > 0 && u?.rol?.toLowerCase() !== 'admin') {
            setIsCheckoutOpen(true);
          }
        }}
      />

      {isCheckoutOpen && (
        <Suspense fallback={null}>
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            user={user}
            onOrderSuccess={handleOrderSuccess}
          />
        </Suspense>
      )}

      {isOrdersOpen && (
        <Suspense fallback={null}>
          <MyOrdersModal
            isOpen={isOrdersOpen}
            onClose={() => setIsOrdersOpen(false)}
            user={user}
          />
        </Suspense>
      )}

      <ProductDetailModal
        producto={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}