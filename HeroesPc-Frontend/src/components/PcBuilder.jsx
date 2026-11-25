import { useState, useMemo, useEffect } from 'react';
import {
  Cpu,
  HardDrive,
  MemoryStick,
  CircuitBoard,
  MonitorPlay,
  Zap,
  Box,
  Fan,
  ShoppingCart,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  Wrench,
  Search,
  Layers,
} from 'lucide-react';
import Pc3DViewer from './Pc3DViewer';

const BUILD_SLOTS = [
  {
    key: 'cpu',
    label: 'Procesador (CPU)',
    shortLabel: 'Procesador',
    keywords: ['procesador', 'cpu'],
    icon: Cpu,
    required: true,
  },
  {
    key: 'cooler',
    label: 'Enfriamiento (Cooler / AIO)',
    shortLabel: 'Enfriamiento',
    keywords: ['enfriamiento', 'cooler', 'disipador', 'líquida', 'liquida', 'aio'],
    icon: Fan,
    required: false,
  },
  {
    key: 'motherboard',
    label: 'Tarjeta Madre (Motherboard)',
    shortLabel: 'Tarjeta Madre',
    keywords: ['madre', 'motherboard', 'placa'],
    icon: CircuitBoard,
    required: true,
  },
  {
    key: 'ram',
    label: 'Memoria RAM',
    shortLabel: 'RAM',
    keywords: ['ram', 'memoria'],
    icon: MemoryStick,
    required: true,
  },
  {
    key: 'gpu',
    label: 'Tarjeta de Video (GPU)',
    shortLabel: 'Gráfica',
    keywords: ['video', 'gpu', 'gráfica', 'grafica'],
    icon: MonitorPlay,
    required: false,
  },
  {
    key: 'storage',
    label: 'Almacenamiento SSD / NVMe',
    shortLabel: 'Almacenamiento',
    keywords: ['almacenamiento', 'ssd', 'disco', 'nvme'],
    icon: HardDrive,
    required: true,
  },
  {
    key: 'psu',
    label: 'Fuente de Poder (PSU)',
    shortLabel: 'Fuente',
    keywords: ['fuente', 'poder', 'psu'],
    icon: Zap,
    required: true,
  },
  {
    key: 'case',
    label: 'Gabinete (Case)',
    shortLabel: 'Gabinete',
    keywords: ['gabinete', 'case', 'chasis', 'torre'],
    icon: Box,
    required: true,
  },
];

const KNOWN_BRANDS = [
  'AMD',
  'INTEL',
  'NVIDIA',
  'ASUS',
  'MSI',
  'GIGABYTE',
  'AORUS',
  'CORSAIR',
  'KINGSTON',
  'XPG',
  'NZXT',
  'COOLER MASTER',
  'EVGA',
  'SAMSUNG',
  'WESTERN DIGITAL',
  'CRUCIAL',
];

const STORAGE_KEY = 'heroespc_saved_build_v1';
const ASSEMBLY_STORAGE_KEY = 'heroespc_saved_assembly_v1';
const DEFAULT_ASSEMBLY_FEE = 499;

function estimateComponentWatts(slotKey, product) {
  if (!product) return 0;
  const text = `${product.nombre} ${product.descripcion || ''}`.toUpperCase();

  if (slotKey === 'cpu') {
    if (text.includes('RYZEN 9') || text.includes('I9')) return 170;
    if (text.includes('RYZEN 7') || text.includes('I7')) return 105;
    if (text.includes('RYZEN 5') || text.includes('I5')) return 65;
    return 65;
  }
  if (slotKey === 'gpu') {
    if (text.includes('4090') || text.includes('7900 XTX')) return 450;
    if (text.includes('4080') || text.includes('7900 XT')) return 320;
    if (text.includes('4070') || text.includes('7800') || text.includes('3080')) return 250;
    if (text.includes('4060') || text.includes('3060') || text.includes('7600') || text.includes('6600')) return 170;
    if (text.includes('3050') || text.includes('1660') || text.includes('1650')) return 130;
    return 180;
  }
  if (slotKey === 'cooler') return text.includes('AIO') || text.includes('LÍQUIDA') ? 25 : 10;
  if (slotKey === 'motherboard') return 45;
  if (slotKey === 'ram') return 10;
  if (slotKey === 'storage') return 10;
  if (slotKey === 'case') return 15;
  return 0;
}

function extractPsuCapacity(psuProduct) {
  if (!psuProduct) return 0;
  const text = `${psuProduct.nombre} ${psuProduct.descripcion || ''}`.toUpperCase();
  const match = text.match(/(\d{3,4})\s*W/);
  return match ? Number(match[1]) : 650;
}

export default function PcBuilder({
  productos,
  categorias,
  onAddBuildToCart,
  onBackToStore,
}) {
  const [selectedParts, setSelectedParts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [includeAssembly, setIncludeAssembly] = useState(() => {
    return localStorage.getItem(ASSEMBLY_STORAGE_KEY) === 'true';
  });

  const [activeSlot, setActiveSlot] = useState('cpu');
  const [slotSearch, setSlotSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [copiedQuote, setCopiedQuote] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedParts));
    } catch (e) {
      console.error('Error guardando ensamble:', e);
    }
  }, [selectedParts]);

  useEffect(() => {
    localStorage.setItem(ASSEMBLY_STORAGE_KEY, String(includeAssembly));
  }, [includeAssembly]);

  const assemblyServiceProduct = useMemo(() => {
    return (
      productos.find((p) => p.sku?.toUpperCase() === 'SRV-BUILD-01') || null
    );
  }, [productos]);

  const assemblyFee = assemblyServiceProduct
    ? Number(assemblyServiceProduct.precio)
    : DEFAULT_ASSEMBLY_FEE;

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
          p.sku?.toUpperCase() !== 'SRV-BUILD-01' &&
          (matchingCatIds.includes(p.id_categoria) ||
            slot.keywords.some((kw) => p.nombre.toLowerCase().includes(kw)))
      );
    });
    return map;
  }, [productos, categorias]);

  const handleChangeSlot = (slotKey) => {
    setActiveSlot(slotKey);
    setSlotSearch('');
    setSelectedBrand('ALL');
  };

  const applyPresetBuild = (tier) => {
    const nextBuild = {};

    BUILD_SLOTS.forEach((slot) => {
      const options = [...(productsBySlot[slot.key] || [])].sort(
        (a, b) => Number(a.precio) - Number(b.precio)
      );
      if (options.length === 0) return;

      if (tier === 'entry') {
        if (slot.key === 'gpu' || slot.key === 'cooler') return;
        nextBuild[slot.key] = options[0];
      } else if (tier === 'mid') {
        const midIndex = Math.floor(options.length / 2);
        nextBuild[slot.key] = options[midIndex];
      } else if (tier === 'pro') {
        nextBuild[slot.key] = options[options.length - 1];
      }
    });

    setSelectedParts(nextBuild);
  };

  const powerStats = useMemo(() => {
    let estimatedWatts = 0;
    Object.entries(selectedParts).forEach(([slotKey, product]) => {
      if (slotKey !== 'psu' && product) {
        estimatedWatts += estimateComponentWatts(slotKey, product);
      }
    });
    const psuWatts = extractPsuCapacity(selectedParts.psu);
    const recommendedWatts =
      estimatedWatts > 0 ? Math.ceil((estimatedWatts * 1.25) / 50) * 50 : 0;
    const isUnderpowered = psuWatts > 0 && estimatedWatts > psuWatts * 0.85;
    const loadPercent =
      psuWatts > 0 ? Math.min(100, Math.round((estimatedWatts / psuWatts) * 100)) : 0;

    return {
      estimatedWatts,
      psuWatts,
      recommendedWatts,
      isUnderpowered,
      loadPercent,
    };
  }, [selectedParts]);

  const compatibilityWarnings = useMemo(() => {
    const warnings = [];
    const cpu = selectedParts.cpu?.nombre.toUpperCase() || '';
    const mobo = selectedParts.motherboard?.nombre.toUpperCase() || '';
    const ram = selectedParts.ram?.nombre.toUpperCase() || '';
    const pcCase = selectedParts.case?.nombre.toUpperCase() || '';

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

    if (mobo && pcCase) {
      if (
        mobo.includes('ATX') &&
        !mobo.includes('MICRO') &&
        !mobo.includes('M-ATX') &&
        (pcCase.includes('MINI-ITX') || pcCase.includes('ITX'))
      ) {
        warnings.push('El gabinete seleccionado es formato ITX y la Tarjeta Madre es ATX.');
      }
    }

    if (powerStats.isUnderpowered) {
      warnings.push(
        `Fuente ajustada (${powerStats.psuWatts}W): se recomiendan al menos ${powerStats.recommendedWatts}W para este ensamble.`
      );
    }

    return warnings;
  }, [selectedParts, powerStats]);

  const selectedList = Object.values(selectedParts).filter(Boolean);
  const partsTotal = selectedList.reduce((sum, item) => sum + Number(item.precio), 0);
  const finalTotal = partsTotal + (includeAssembly ? assemblyFee : 0);

  const handleSelectPart = (slotKey, product) => {
    setSelectedParts((prev) => ({
      ...prev,
      [slotKey]:
        prev[slotKey]?.id_producto === product.id_producto ? null : product,
    }));
  };

  const handleClearBuild = () => {
    setSelectedParts({});
    setIncludeAssembly(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ASSEMBLY_STORAGE_KEY);
  };

  const handleCopyQuote = async () => {
    if (selectedList.length === 0 && !includeAssembly) return;

    const lines = [
      '🖥️ *COTIZACIÓN ENSAMBLE HEROES PC*',
      '------------------------------------',
      ...BUILD_SLOTS.filter((s) => selectedParts[s.key]).map((s) => {
        const p = selectedParts[s.key];
        return `• ${s.shortLabel}: ${p.nombre} (${p.sku}) — $${Number(
          p.precio
        ).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
      }),
    ];

    if (includeAssembly) {
      lines.push(`• Servicio de Ensamblaje y Prueba — $${assemblyFee.toFixed(2)}`);
    }

    lines.push(
      '------------------------------------',
      `⚡ Consumo estimado: ~${powerStats.estimatedWatts}W`,
      `💰 *TOTAL: $${finalTotal.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
      })} MXN*`
    );

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2500);
    } catch (err) {
      console.error('No se pudo copiar la cotización:', err);
    }
  };

  const handleAddAllToCart = () => {
    if (selectedList.length === 0 && !includeAssembly) return;
    const itemsToSend = [...selectedList];

    if (includeAssembly) {
      const servicioEnsamblaje = assemblyServiceProduct || {
        id_producto: 'SRV-BUILD-01',
        sku: 'SRV-BUILD-01',
        nombre: 'Ensamblaje Profesional + Gestión de Cables e Instalación SO',
        precio: assemblyFee,
        stock: 99,
        imagen_url:
          'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500',
      };
      itemsToSend.push(servicioEnsamblaje);
    }

    onAddBuildToCart(itemsToSend);
  };

  const currentSlotConfig = BUILD_SLOTS.find((s) => s.key === activeSlot);
  const rawSlotOptions = productsBySlot[activeSlot] || [];

  const availableBrands = useMemo(() => {
    const found = new Set();
    rawSlotOptions.forEach((p) => {
      const upper = p.nombre.toUpperCase();
      KNOWN_BRANDS.forEach((brand) => {
        if (upper.includes(brand)) found.add(brand);
      });
    });
    return Array.from(found);
  }, [rawSlotOptions]);

  const filteredSlotOptions = useMemo(() => {
    return rawSlotOptions.filter((p) => {
      const upper = p.nombre.toUpperCase();
      const matchBrand =
        selectedBrand === 'ALL' || upper.includes(selectedBrand);
      const matchText =
        !slotSearch.trim() ||
        p.nombre.toLowerCase().includes(slotSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(slotSearch.toLowerCase());
      return matchBrand && matchText;
    });
  }, [rawSlotOptions, selectedBrand, slotSearch]);

  const selectedCase = selectedParts.case;

  return (
    <div className="container builder-container-wide">
      <div className="admin-top-bar">
        <div>
          <h2>
            <Sparkles
              size={22}
              style={{ verticalAlign: 'middle', marginRight: '8px', color: '#ea580c' }}
            />
            Configurador PC Gamer & Workstation — HEROES PC
          </h2>
          <p>
            Selecciona tus componentes pieza por pieza y previsualiza tu ensamble en 3D en tiempo real
          </p>
        </div>
        <button type="button" className="btn-back-store" onClick={onBackToStore}>
          <ArrowLeft size={18} />
          <span>Volver al Catálogo</span>
        </button>
      </div>

      {/* LAYOUT DE 3 COLUMNAS: [3D + RESUMEN] | [SELECTOR] | [LISTA DE PIEZAS] */}
      <div className="builder-layout-3col">
        {/* COLUMNA 1 (IZQUIERDA): VISOR 3D + WATTS + RESUMEN Y COMPRA */}
        <aside className="builder-col-left">
          <Pc3DViewer
            selectedParts={selectedParts}
            activeSlot={activeSlot}
            onSelectSlot={handleChangeSlot}
          />

          {powerStats.estimatedWatts > 0 && (
            <div className="wattage-card">
              <div className="wattage-top">
                <span>
                  <Zap size={14} /> Consumo:{' '}
                  <strong>~{powerStats.estimatedWatts}W</strong>
                </span>
                <span>
                  {powerStats.psuWatts > 0
                    ? `Fuente: ${powerStats.psuWatts}W`
                    : `Sugerida: ${powerStats.recommendedWatts}W+`}
                </span>
              </div>
              {powerStats.psuWatts > 0 && (
                <div className="wattage-bar-bg">
                  <div
                    className={`wattage-bar-fill ${
                      powerStats.isUnderpowered ? 'danger' : ''
                    }`}
                    style={{ width: `${powerStats.loadPercent}%` }}
                  />
                </div>
              )}
            </div>
          )}

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

          <div className="builder-summary-card">
            <label
              className="assembly-checkbox"
              title="Agregar servicio profesional de armado al pedido"
            >
              <input
                type="checkbox"
                checked={includeAssembly}
                onChange={(e) => setIncludeAssembly(e.target.checked)}
              />
              <Wrench size={15} />
              <span>
                Incluir ensamblaje profesional (+${assemblyFee} MXN)
              </span>
            </label>

            <div className="summary-line">
              <span>Piezas seleccionadas:</span>
              <strong>
                {selectedList.length} de {BUILD_SLOTS.length}
              </strong>
            </div>
            <div className="summary-line total">
              <span>Total estimado:</span>
              <strong>
                ${finalTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </strong>
            </div>

            <button
              type="button"
              className="btn-add-build-cart"
              disabled={selectedList.length === 0 && !includeAssembly}
              onClick={handleAddAllToCart}
            >
              <ShoppingCart size={18} />
              <span>
                Agregar al Carrito (
                {selectedList.length + (includeAssembly ? 1 : 0)})
              </span>
            </button>
          </div>
        </aside>

        {/* COLUMNA 2 (CENTRO): ARMADO RÁPIDO + PESTAÑAS + CATÁLOGO */}
        <section className="builder-col-center">
          <div className="preset-bar">
            <span className="preset-title">
              <Layers size={15} /> Armado rápido:
            </span>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyPresetBuild('entry')}
            >
              Oficina / Entrada
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyPresetBuild('mid')}
            >
              Gamer 1080p Balanceado
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyPresetBuild('pro')}
            >
              Workstation / 4K Pro
            </button>
          </div>

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
                  onClick={() => handleChangeSlot(slot.key)}
                >
                  <Icon size={15} />
                  <span>{slot.shortLabel}</span>
                  {isSelected && <CheckCircle2 size={13} className="check-ico" />}
                </button>
              );
            })}
          </div>

          <div className="selector-header">
            <h3>Elige tu {currentSlotConfig?.label}</h3>
            <span>{filteredSlotOptions.length} opciones en stock</span>
          </div>

          {rawSlotOptions.length > 0 && (
            <div className="slot-filters-bar">
              <div className="slot-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder={`Buscar en ${currentSlotConfig?.shortLabel}...`}
                  value={slotSearch}
                  onChange={(e) => setSlotSearch(e.target.value)}
                />
              </div>

              {availableBrands.length > 0 && (
                <div className="brand-pills">
                  <button
                    type="button"
                    className={`brand-pill ${selectedBrand === 'ALL' ? 'active' : ''}`}
                    onClick={() => setSelectedBrand('ALL')}
                  >
                    Todas
                  </button>
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      className={`brand-pill ${
                        selectedBrand === brand ? 'active' : ''
                      }`}
                      onClick={() => setSelectedBrand(brand)}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredSlotOptions.length === 0 ? (
            <div className="builder-empty-slot">
              <p>
                No hay componentes disponibles con este filtro para{' '}
                <strong>{currentSlotConfig?.label}</strong>. Puedes darlos de alta desde el panel{' '}
                <strong>Admin</strong>.
              </p>
            </div>
          ) : (
            <div className="builder-options-grid">
              {filteredSlotOptions.map((prod) => {
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

        {/* COLUMNA 3 (DERECHA): LISTA DE RANURAS EN VIVO */}
        <aside className="builder-col-right">
          <div className="preview-header">
            <h3>Tu Ensamble</h3>
            <div className="preview-header-actions">
              <button
                type="button"
                className="btn-reset-build"
                onClick={handleCopyQuote}
                disabled={selectedList.length === 0 && !includeAssembly}
                title="Copiar cotización"
              >
                {copiedQuote ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedQuote ? 'Copiada' : 'Cotizar'}</span>
              </button>
              <button
                type="button"
                className="btn-reset-build"
                onClick={handleClearBuild}
                disabled={selectedList.length === 0 && !includeAssembly}
                title="Limpiar ensamble"
              >
                <RotateCcw size={13} />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className="pc-chassis-visualizer compact-chassis">
            <div className="chassis-glass">
              <div className="chassis-top-bar">
                <span className="chassis-led" />
                <span className="chassis-label">
                  {selectedCase ? selectedCase.nombre : 'GABINETE SIN SELECCIONAR'}
                </span>
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
                      onClick={() => handleChangeSlot(slot.key)}
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
                          <Icon size={18} />
                        </div>
                      )}
                      <div className="node-meta">
                        <small>{slot.shortLabel}</small>
                        <span>{part ? part.nombre : 'Sin seleccionar'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}