import { useState, useMemo } from 'react';
import {
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  MonitorPlay,
  Zap,
  ShoppingCart,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

// Ranuras estándar de un armado de PC y palabras clave para emparejar con tus categorías de PostgreSQL
const BUILD_SLOTS = [
  {
    key: 'cpu',
    label: 'Procesador (CPU)',
    keywords: ['procesador', 'cpu'],
    icon: Cpu,
    required: true,
  },
  {
    key: 'motherboard',
    label: 'Tarjeta Madre (Motherboard)',
    keywords: ['madre', 'motherboard', 'placa'],
    icon: CircuitBoard,
    required: true,
  },
  {
    key: 'ram',
    label: 'Memoria RAM',
    keywords: ['ram', 'memoria'],
    icon: MemoryStick,
    required: true,
  },
  {
    key: 'gpu',
    label: 'Tarjeta de Video (GPU)',
    keywords: ['video', 'gpu', 'gráfica', 'grafica'],
    icon: MonitorPlay,
    required: false,
  },
  {
    key: 'storage',
    label: 'Almacenamiento SSD / NVMe',
    keywords: ['almacenamiento', 'ssd', 'disco', 'nvme'],
    icon: HardDrive,
    required: true,
  },
  {
    key: 'psu',
    label: 'Fuente de Poder (PSU)',
    keywords: ['fuente', 'poder', 'psu'],
    icon: Zap,
    required: true,
  },
];

export default function PcBuilder({
  productos,
  categorias,
  onAddBuildToCart,
  onBackToStore,
}) {
  const [selectedParts, setSelectedParts] = useState({});
  const [activeSlot, setActiveSlot] = useState('cpu');

  // Relaciona los productos disponibles en stock con cada ranura del configurador
  const productsBySlot = useMemo(() => {
    const map = {};
    BUILD_SLOTS.forEach((slot) => {
      const matchingCatIds = categorias
        .filter((cat) =>
          slot.keywords.some((kw) =>
            cat.nombre_categoria.toLowerCase().includes(kw)
          )
        )
        .map((c) => c.id_categoria);

      map[slot.key] = productos.filter(
        (p) =>
          p.stock > 0 &&
          (matchingCatIds.includes(p.id_categoria) ||
            slot.keywords.some((kw) => p.nombre.toLowerCase().includes(kw)))
      );
    });
    return map;
  }, [productos, categorias]);

  // Validación básica de compatibilidad (Socket AM4 vs AM5 / DDR4 vs DDR5)
  const compatibilityWarnings = useMemo(() => {
    const warnings = [];
    const cpu = selectedParts.cpu?.nombre.toUpperCase() || '';
    const mobo = selectedParts.motherboard?.nombre.toUpperCase() || '';
    const ram = selectedParts.ram?.nombre.toUpperCase() || '';

    if (cpu && mobo) {
      if (cpu.includes('AM4') && mobo.includes('AM5')) {
        warnings.push('Incompatibilidad de socket: El CPU es AM4 y la Tarjeta Madre es AM5.');
      }
      if (cpu.includes('AM5') && mobo.includes('AM4')) {
        warnings.push('Incompatibilidad de socket: El CPU es AM5 y la Tarjeta Madre es AM4.');
      }
    }

    if (mobo && ram) {
      if (mobo.includes('DDR5') && ram.includes('DDR4')) {
        warnings.push('Incompatibilidad de memoria: La Tarjeta Madre requiere DDR5 y elegiste DDR4.');
      }
      if (mobo.includes('AM4') && ram.includes('DDR5')) {
        warnings.push('Las placas AM4 utilizan memoria DDR4, no DDR5.');
      }
    }

    return warnings;
  }, [selectedParts]);

  const selectedList = Object.values(selectedParts).filter(Boolean);
  const totalPrice = selectedList.reduce(
    (sum, item) => sum + Number(item.precio),
    0
  );

  const handleSelectPart = (slotKey, product) => {
    setSelectedParts((prev) => ({
      ...prev,
      [slotKey]:
        prev[slotKey]?.id_producto === product.id_producto ? null : product,
    }));
  };

  const handleClearBuild = () => {
    setSelectedParts({});
  };

  const handleAddAllToCart = () => {
    if (selectedList.length === 0) return;
    onAddBuildToCart(selectedList);
  };

  const currentSlotConfig = BUILD_SLOTS.find((s) => s.key === activeSlot);
  const currentOptions = productsBySlot[activeSlot] || [];

  return (
    <div className="container builder-container">
      {/* Encabezado */}
      <div className="admin-top-bar">
        <div>
          <h2>
            <Sparkles
              size={22}
              style={{ verticalAlign: 'middle', marginRight: '8px', color: '#ff6b00' }}
            />
            Configurador PC Gamer & Workstation — HEROES PC
          </h2>
          <p>
            Selecciona tus componentes pieza por pieza y previsualiza tu ensamble en tiempo real
          </p>
        </div>
        <button type="button" className="btn-back-store" onClick={onBackToStore}>
          <ArrowLeft size={18} />
          <span>Volver al Catálogo</span>
        </button>
      </div>

      {/* Layout Principal: Izquierda Previsualizador | Derecha Selector */}
      <div className="builder-layout">
        {/* LADO IZQUIERDO: PREVISUALIZADOR INTERACTIVO DE LA PC */}
        <aside className="builder-preview-panel">
          <div className="preview-header">
            <h3>Tu Ensamble en Vivo</h3>
            <button
              type="button"
              className="btn-reset-build"
              onClick={handleClearBuild}
              disabled={selectedList.length === 0}
            >
              <RotateCcw size={14} />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Gabinete Visual con las piezas montadas */}
          <div className="pc-chassis-visualizer">
            <div className="chassis-glass">
              <div className="chassis-top-bar">
                <span className="chassis-led" />
                <span className="chassis-label">HEROES-CASE RGB PRO</span>
              </div>

              <div className="chassis-slots-visual">
                {BUILD_SLOTS.map((slot) => {
                  const Icon = slot.icon;
                  const part = selectedParts[slot.key];
                  return (
                    <div
                      key={slot.key}
                      className={`visual-node ${part ? 'installed' : ''} ${
                        activeSlot === slot.key ? 'focused' : ''
                      }`}
                      onClick={() => setActiveSlot(slot.key)}
                    >
                      {part ? (
                        <img
                          src={
                            part.imagen_url ||
                            'https://via.placeholder.com/60?text=PC'
                          }
                          alt={part.nombre}
                        />
                      ) : (
                        <div className="node-placeholder">
                          <Icon size={22} />
                        </div>
                      )}
                      <div className="node-meta">
                        <small>{slot.label}</small>
                        <span>
                          {part ? part.nombre : 'Sin seleccionar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alertas de Compatibilidad */}
          {compatibilityWarnings.length > 0 ? (
            <div className="compat-box warn">
              <AlertTriangle size={18} />
              <div>
                <strong>Revisa compatibilidad:</strong>
                <ul>
                  {compatibilityWarnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : selectedList.length >= 2 ? (
            <div className="compat-box ok">
              <CheckCircle2 size={18} />
              <span>Componentes compatibles entre sí</span>
            </div>
          ) : null}

          {/* Resumen de Precios y Botón al Carrito */}
          <div className="builder-summary-card">
            <div className="summary-line">
              <span>Piezas seleccionadas:</span>
              <strong>
                {selectedList.length} de {BUILD_SLOTS.length}
              </strong>
            </div>
            <div className="summary-line total">
              <span>Total estimado:</span>
              <strong>
                ${totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </strong>
            </div>

            <button
              type="button"
              className="btn-add-build-cart"
              disabled={selectedList.length === 0}
              onClick={handleAddAllToCart}
            >
              <ShoppingCart size={18} />
              <span>Agregar Ensamble al Carrito ({selectedList.length})</span>
            </button>
          </div>
        </aside>

        {/* LADO DERECHO: SELECTOR DE COMPONENTES POR PASO */}
        <section className="builder-selector-panel">
          {/* Pestañas de Categorías de Armado */}
          <div className="builder-steps-bar">
            {BUILD_SLOTS.map((slot) => {
              const Icon = slot.icon;
              const isSelected = Boolean(selectedParts[slot.key]);
              return (
                <button
                  key={slot.key}
                  type="button"
                  className={`step-pill ${
                    activeSlot === slot.key ? 'active' : ''
                  } ${isSelected ? 'completed' : ''}`}
                  onClick={() => setActiveSlot(slot.key)}
                >
                  <Icon size={16} />
                  <span>{slot.label.split(' ')[0]}</span>
                  {isSelected && <CheckCircle2 size={14} className="check-ico" />}
                </button>
              );
            })}
          </div>

          {/* Lista de Opciones Disponibles para la Ranura Activa */}
          <div className="selector-header">
            <h3>Elige tu {currentSlotConfig?.label}</h3>
            <span>{currentOptions.length} opciones en stock</span>
          </div>

          {currentOptions.length === 0 ? (
            <div className="builder-empty-slot">
              <p>
                No hay componentes disponibles en stock para{' '}
                <strong>{currentSlotConfig?.label}</strong>. Puedes darlos de alta desde el panel <strong>Admin</strong>.
              </p>
            </div>
          ) : (
            <div className="builder-options-grid">
              {currentOptions.map((prod) => {
                const isChosen =
                  selectedParts[activeSlot]?.id_producto === prod.id_producto;
                return (
                  <div
                    key={prod.id_producto}
                    className={`builder-option-card ${isChosen ? 'chosen' : ''}`}
                  >
                    <img
                      src={
                        prod.imagen_url ||
                        'https://via.placeholder.com/100?text=Hardware'
                      }
                      alt={prod.nombre}
                    />
                    <div className="option-details">
                      <span className="option-sku">{prod.sku}</span>
                      <h4>{prod.nombre}</h4>
                      <p className="option-desc">
                        {prod.descripcion || 'Componente compatible certificado.'}
                      </p>
                      <div className="option-bottom">
                        <strong className="option-price">
                          $
                          {Number(prod.precio).toLocaleString('es-MX', {
                            minimumFractionDigits: 2,
                          })}
                        </strong>
                        <button
                          type="button"
                          className={`btn-choose-part ${isChosen ? 'selected' : ''}`}
                          onClick={() => handleSelectPart(activeSlot, prod)}
                        >
                          {isChosen ? '✓ Seleccionado' : 'Seleccionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}