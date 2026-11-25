export default function ProductCard({ producto, onAddToCart, onSelectProduct }) {
  const sinStock = Number(producto.stock) <= 0;

  return (
    <article className="product-card">
      <div
        className="product-img-wrap"
        onClick={() => onSelectProduct && onSelectProduct(producto)}
      >
        <img
          src={
            producto.imagen_url ||
            'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500'
          }
          alt={producto.nombre}
          loading="lazy"
        />
        <span className={`stock-badge ${sinStock ? 'out-stock' : 'in-stock'}`}>
          {sinStock ? 'Agotado' : `${producto.stock} disp.`}
        </span>
      </div>

      <div className="product-body">
        <span className="product-sku">{producto.sku}</span>
        <h3
          className="product-title"
          onClick={() => onSelectProduct && onSelectProduct(producto)}
        >
          {producto.nombre}
        </h3>
        <p className="product-desc">
          {producto.descripcion || 'Componente de alto rendimiento para ensamble PC.'}
        </p>

        <div className="product-footer">
          <span className="product-price">
            $
            {Number(producto.precio).toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })}
          </span>
          <button
            type="button"
            className="btn-add-cart"
            disabled={sinStock}
            onClick={() => onAddToCart(producto)}
          >
            {sinStock ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </article>
  );
}