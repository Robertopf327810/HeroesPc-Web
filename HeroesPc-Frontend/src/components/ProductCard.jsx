export default function ProductCard({ producto, onAddToCart, onSelectProduct }) {
  const hasStock = producto.stock > 0;
  const img =
    producto.imagen_url || 'https://via.placeholder.com/160x160?text=Hardware';

  return (
    <article className="product-card-horizontal">
      <div
        className="card-img-box clickable"
        onClick={() => onSelectProduct(producto)}
        title="Ver especificaciones"
      >
        <img src={img} alt={producto.nombre} className="product-img" />
      </div>

      <div className="card-info-box">
        <div>
          <h4
            className="product-title clickable"
            onClick={() => onSelectProduct(producto)}
          >
            {producto.nombre} ({producto.sku})
          </h4>
          <div className="product-price">
            $ {Number(producto.precio).toLocaleString('es-MX', {
              minimumFractionDigits: 2,
            })}
          </div>
          <div className={`stock-text ${hasStock ? '' : 'out'}`}>
            {hasStock ? `Stock: ${producto.stock} disp.` : 'Agotado'}
          </div>
        </div>

        <button
          className="btn-add-compact"
          type="button"
          disabled={!hasStock}
          onClick={() => onAddToCart(producto)}
        >
          {hasStock ? 'Agregar al carrito' : 'Sin existencias'}
        </button>
      </div>
    </article>
  );
}