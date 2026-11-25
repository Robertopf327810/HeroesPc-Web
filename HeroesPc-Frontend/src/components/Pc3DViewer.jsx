import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCw, Palette, Power } from 'lucide-react';

const RGB_PRESETS = [
  { name: 'Heroes Orange', hex: 0xea580c, css: '#ea580c' },
  { name: 'Cyber Cyan', hex: 0x06b6d4, css: '#06b6d4' },
  { name: 'Emerald', hex: 0x10b981, css: '#10b981' },
  { name: 'Pure White', hex: 0xf8fafc, css: '#f8fafc' },
];

export default function Pc3DViewer({ selectedParts }) {
  const mountRef = useRef(null);
  const sceneObjectsRef = useRef({});
  const autoRotateRef = useRef(false);
  const [rgbIndex, setRgbIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [is3DEnabled, setIs3DEnabled] = useState(true);

  const currentRgb = RGB_PRESETS[rgbIndex];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    if (!is3DEnabled) {
      container.innerHTML = '';
      sceneObjectsRef.current = {};
      return;
    }

    const getSize = () => {
      const rect = container.getBoundingClientRect();
      return {
        width: Math.max(rect.width, 320),
        height: Math.max(rect.height, 220),
      };
    };

    const { width, height } = getSize();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1120);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(5.2, 2.3, 6.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'low-power',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3.0;
    controls.maxDistance = 8.5;
    controls.target.set(0, 0.1, 0);
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.4;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.25);
    dirLight.position.set(5, 8, 6);
    scene.add(dirLight);

    const rgbPointLight = new THREE.PointLight(currentRgb.hex, 2.2, 8);
    rgbPointLight.position.set(0.3, 0.4, 0.7);
    scene.add(rgbPointLight);

    const gridHelper = new THREE.GridHelper(10, 16, 0x1e293b, 0x1e293b);
    gridHelper.position.y = -1.85;
    scene.add(gridHelper);

    const pcGroup = new THREE.Group();
    scene.add(pcGroup);

    const matChassisDark = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.7,
      roughness: 0.35,
    });
    const matChassisUninstalled = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const matGlass = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.14,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });
    const matRgb = new THREE.MeshStandardMaterial({
      color: currentRgb.hex,
      emissive: currentRgb.hex,
      emissiveIntensity: 1.4,
    });

    const caseGroup = new THREE.Group();
    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.6, 0.12), matChassisDark);
    backPanel.position.set(0, 0, -0.85);
    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 1.8), matChassisDark);
    topPanel.position.set(0, 1.78, 0);
    const bottomShroud = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.75, 1.8), matChassisDark);
    bottomShroud.position.set(0, -1.42, 0);
    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.6, 1.8), matChassisDark);
    frontPanel.position.set(1.35, 0, 0);
    const rearPanel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.6, 1.8), matChassisDark);
    rearPanel.position.set(-1.35, 0, 0);
    const glassSide = new THREE.Mesh(new THREE.BoxGeometry(2.65, 3.45, 0.04), matGlass);
    glassSide.position.set(0, 0.05, 0.88);

    const fanGeo = new THREE.TorusGeometry(0.36, 0.045, 10, 22);
    [-0.95, 0.05, 1.05].forEach((fy) => {
      const fanRing = new THREE.Mesh(fanGeo, matRgb);
      fanRing.rotation.y = Math.PI / 2;
      fanRing.position.set(1.24, fy, 0);
      caseGroup.add(fanRing);
    });

    caseGroup.add(backPanel, topPanel, bottomShroud, frontPanel, rearPanel, glassSide);
    pcGroup.add(caseGroup);

    const moboMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.75, 2.15, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.5 })
    );
    moboMesh.position.set(-0.25, 0.35, -0.72);
    const vrmHeatsink = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.9, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.25 })
    );
    vrmHeatsink.position.set(-0.92, 0.8, -0.64);
    const moboGroup = new THREE.Group();
    moboGroup.add(moboMesh, vrmHeatsink);
    pcGroup.add(moboGroup);

    const cpuMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.38, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.9, roughness: 0.2 })
    );
    cpuMesh.position.set(-0.35, 0.78, -0.65);
    pcGroup.add(cpuMesh);

    const coolerGroup = new THREE.Group();
    const pumpBlock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.24, 18),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 })
    );
    pumpBlock.rotation.x = Math.PI / 2;
    pumpBlock.position.set(-0.35, 0.78, -0.5);
    const pumpRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.03, 10, 20),
      matRgb
    );
    pumpRing.position.set(-0.35, 0.78, -0.37);
    const topRadiator = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.18, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 })
    );
    topRadiator.position.set(-0.1, 1.62, 0);
    coolerGroup.add(pumpBlock, pumpRing, topRadiator);
    pcGroup.add(coolerGroup);

    const ramGroup = new THREE.Group();
    const ramStickGeo = new THREE.BoxGeometry(0.06, 0.78, 0.18);
    const ramStickMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const ramLedGeo = new THREE.BoxGeometry(0.04, 0.76, 0.04);
    [0.08, 0.22].forEach((rx) => {
      const stick = new THREE.Mesh(ramStickGeo, ramStickMat);
      stick.position.set(rx, 0.78, -0.58);
      const ledBar = new THREE.Mesh(ramLedGeo, matRgb);
      ledBar.position.set(rx, 0.78, -0.48);
      ramGroup.add(stick, ledBar);
    });
    pcGroup.add(ramGroup);

    const gpuGroup = new THREE.Group();
    const gpuBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.24, 0.78),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.65, roughness: 0.3 })
    );
    gpuBody.position.set(-0.15, -0.18, -0.32);
    const gpuStripe = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.04, 0.04), matRgb);
    gpuStripe.position.set(-0.15, -0.12, 0.08);
    gpuGroup.add(gpuBody, gpuStripe);
    pcGroup.add(gpuGroup);

    const storageMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.16, 0.05),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.5, roughness: 0.35 })
    );
    storageMesh.position.set(-0.35, 0.2, -0.66);
    pcGroup.add(storageMesh);

    const psuMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.05, 0.58, 0.95),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6, roughness: 0.4 })
    );
    psuMesh.position.set(-0.75, -1.42, -0.15);
    const psuBadge = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, 0.02), matRgb);
    psuBadge.position.set(-0.75, -1.42, 0.34);
    const psuGroup = new THREE.Group();
    psuGroup.add(psuMesh, psuBadge);
    pcGroup.add(psuGroup);

    let animationFrameId = null;
    let isDisposed = false;

    const renderFrame = () => {
      if (isDisposed) return;
      animationFrameId = null;
      const stillMoving = controls.update();
      renderer.render(scene, camera);

      if (!document.hidden && (autoRotateRef.current || stillMoving)) {
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    const scheduleRender = () => {
      if (!isDisposed && !document.hidden && animationFrameId === null) {
        animationFrameId = requestAnimationFrame(renderFrame);
      }
    };

    controls.addEventListener('change', scheduleRender);

    const handleVisibilityChange = () => {
      if (document.hidden && animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      } else if (!document.hidden) {
        scheduleRender();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    sceneObjectsRef.current = {
      controls,
      rgbPointLight,
      matRgb,
      matChassisDark,
      matChassisUninstalled,
      backPanel,
      topPanel,
      bottomShroud,
      frontPanel,
      rearPanel,
      moboGroup,
      cpuMesh,
      coolerGroup,
      ramGroup,
      gpuGroup,
      storageMesh,
      psuGroup,
      scheduleRender,
    };

    const hasCase = Boolean(selectedParts.case);
    const caseMat = hasCase ? matChassisDark : matChassisUninstalled;
    [backPanel, topPanel, bottomShroud, frontPanel, rearPanel].forEach((mesh) => {
      mesh.material = caseMat;
    });
    moboGroup.visible = Boolean(selectedParts.motherboard);
    cpuMesh.visible = Boolean(selectedParts.cpu);
    coolerGroup.visible = Boolean(selectedParts.cooler);
    ramGroup.visible = Boolean(selectedParts.ram);
    gpuGroup.visible = Boolean(selectedParts.gpu);
    storageMesh.visible = Boolean(selectedParts.storage);
    psuGroup.visible = Boolean(selectedParts.psu);

    scheduleRender();

    const resizeObserver = new ResizeObserver(() => {
      if (!container || isDisposed) return;
      const { width: newW, height: newH } = getSize();
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      scheduleRender();
    });
    resizeObserver.observe(container);

    return () => {
      isDisposed = true;
      if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      controls.removeEventListener('change', scheduleRender);
      resizeObserver.disconnect();
      controls.dispose();

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [is3DEnabled]);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
    const objs = sceneObjectsRef.current;
    if (!objs.controls) return;
    objs.controls.autoRotate = autoRotate;
    objs.scheduleRender?.();
  }, [autoRotate]);

  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs.matRgb || !objs.rgbPointLight) return;
    objs.matRgb.color.setHex(currentRgb.hex);
    objs.matRgb.emissive.setHex(currentRgb.hex);
    objs.rgbPointLight.color.setHex(currentRgb.hex);
    objs.scheduleRender?.();
  }, [currentRgb]);

  useEffect(() => {
    const objs = sceneObjectsRef.current;
    if (!objs.moboGroup) return;

    const hasCase = Boolean(selectedParts.case);
    const caseMat = hasCase ? objs.matChassisDark : objs.matChassisUninstalled;
    [
      objs.backPanel,
      objs.topPanel,
      objs.bottomShroud,
      objs.frontPanel,
      objs.rearPanel,
    ].forEach((mesh) => {
      if (mesh) mesh.material = caseMat;
    });

    objs.moboGroup.visible = Boolean(selectedParts.motherboard);
    objs.cpuMesh.visible = Boolean(selectedParts.cpu);
    objs.coolerGroup.visible = Boolean(selectedParts.cooler);
    objs.ramGroup.visible = Boolean(selectedParts.ram);
    objs.gpuGroup.visible = Boolean(selectedParts.gpu);
    objs.storageMesh.visible = Boolean(selectedParts.storage);
    objs.psuGroup.visible = Boolean(selectedParts.psu);
    objs.scheduleRender?.();
  }, [selectedParts]);

  return (
    <div className="pc-3d-wrapper">
      <div className="pc-3d-toolbar">
        <span className="pc-3d-badge">VISTA 3D INTERACTIVA</span>
        <div className="pc-3d-controls">
          <button
            type="button"
            className={`btn-3d-ctrl ${is3DEnabled ? 'active' : ''}`}
            title="Encender/Apagar motor 3D para ahorrar batería y GPU"
            onClick={() => setIs3DEnabled((prev) => !prev)}
          >
            <Power size={13} />
            <span>{is3DEnabled ? '3D ON' : '3D OFF'}</span>
          </button>
          <button
            type="button"
            className="btn-3d-ctrl"
            disabled={!is3DEnabled}
            title="Cambiar iluminación RGB"
            onClick={() => setRgbIndex((prev) => (prev + 1) % RGB_PRESETS.length)}
          >
            <Palette size={13} style={{ color: currentRgb.css }} />
            <span>RGB</span>
          </button>
          <button
            type="button"
            className={`btn-3d-ctrl ${autoRotate ? 'active' : ''}`}
            disabled={!is3DEnabled}
            title="Activar/Pausar rotación 360°"
            onClick={() => setAutoRotate((prev) => !prev)}
          >
            <RotateCw size={13} />
            <span>360°</span>
          </button>
        </div>
      </div>

      {is3DEnabled ? (
        <>
          <div ref={mountRef} className="pc-3d-canvas-box" />
          <div className="pc-3d-hint">
            Arrastra para rotar 360° • Rueda del mouse para hacer zoom
          </div>
        </>
      ) : (
        <div
          className="pc-3d-canvas-box"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: '#94a3b8',
            background: '#0b1120',
            cursor: 'default',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <Power size={28} style={{ color: '#ea580c' }} />
          <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>
            Vista 3D pausada (Modo Ahorro)
          </strong>
          <span style={{ fontSize: '0.78rem' }}>
            Activa <strong>3D ON</strong> arriba cuando quieras previsualizar tu gabinete.
          </span>
        </div>
      )}
    </div>
  );
}